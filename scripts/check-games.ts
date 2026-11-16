/**
 * Consistency checks for the playable chapters. Run: npx tsx scripts/check-games.ts [id ...]
 * Verifies that every mission and teaching scene is winnable, that wrong setups fail,
 * and that references (props, videos, coverage targets) exist.
 */
import { GAMES } from '../src/game/chapters';
import { PROPS } from '../src/game/props';
import type { ChapterGame, PermissionLevel, TeachOption, Criterion, Mechanic } from '../src/game/types';

const CRIT: Criterion[] = ['accuracy', 'simplicity', 'relevance', 'limits', 'example'];
function score(parts: TeachOption[]) {
  const per = {} as Record<Criterion, number>;
  for (const c of CRIT) {
    const v = parts.map((p) => p.scores[c]).filter((x): x is 0 | 1 | 2 => x !== undefined);
    per[c] = v.length ? Math.min(...v) : 0;
  }
  const total = CRIT.reduce((a, c) => a + per[c], 0);
  return total === 10;
}
function runTests(g: ChapterGame, tools: string[], perms: Record<string, PermissionLevel>) {
  const m = g.mission!;
  return m.tests.map((t) => {
    const missing = t.needsTools.some((x) => !tools.includes(x));
    const level: PermissionLevel | null = t.permission ? (tools.includes(t.permission.tool) ? perms[t.permission.tool] ?? 'auto' : 'deny') : null;
    return !missing && (!t.permission || t.permission.allowed.includes(level!));
  });
}
function bilingual(o: unknown, path: string, errs: string[]) {
  if (o && typeof o === 'object') {
    const r = o as Record<string, unknown>;
    if ('fr' in r || 'en' in r) {
      if (typeof r.fr !== 'string' || typeof r.en !== 'string' || !r.fr.trim() || !r.en.trim()) errs.push(`${path}: incomplete bilingual text`);
      return;
    }
    for (const [k, v] of Object.entries(r)) bilingual(v, `${path}.${k}`, errs);
  }
}
function mech(m: Mechanic, path: string, errs: string[]) {
  if (m.kind === 'sort') for (const it of m.items) if (!m.bins.some((b) => b.id === it.bin)) errs.push(`${path}: item ${it.id} → unknown bin ${it.bin}`);
  if (m.kind === 'choice' && !m.options.some((o) => o.correct)) errs.push(`${path}: no correct option`);
  if (m.kind === 'choice' && !m.multiple && m.options.filter((o) => o.correct).length !== 1) errs.push(`${path}: single choice needs exactly one correct option`);
  if (m.kind === 'spot' && !m.lines.some((l) => l.faulty)) errs.push(`${path}: no faulty line`);
  if (m.kind === 'fill') {
    m.blanks.forEach((b, i) => !b.options.includes(b.answer) && errs.push(`${path}: blank ${i} answer not in options`));
    for (const l of ['fr', 'en'] as const) m.blanks.forEach((_, i) => !m.template[l].includes(`{{${i}}}`) && errs.push(`${path}: template.${l} lacks {{${i}}}`));
  }
  if (m.kind === 'loop') for (const e of m.expected) if (!m.tools.some((t) => t.id === e)) errs.push(`${path}: expected tool ${e} missing`);
  if (m.kind === 'desk') {
    for (const q of m.questions) for (const n of q.needs) if (!m.docs.some((d) => d.id === n)) errs.push(`${path}: question needs unknown doc ${n}`);
    const need = new Set(m.questions.flatMap((q) => q.needs));
    if (need.size > m.slots) errs.push(`${path}: needs ${need.size} docs but only ${m.slots} slots`);
    if (m.docs.length <= m.slots) errs.push(`${path}: no real choice (docs ≤ slots)`);
  }
  if (m.kind === 'stepper') mech(m.check, `${path}.check`, errs);
}

const only = process.argv.slice(2);
let bad = 0;
for (const [id, g] of Object.entries(GAMES).sort()) {
  if (only.length && !only.includes(id)) continue;
  const errs: string[] = [];
  bilingual(g, id, errs);
  const ids = new Set<string>();
  for (const s of g.stations) {
    if (ids.has(s.id)) errs.push(`duplicate station id ${s.id}`);
    ids.add(s.id);
    if (['intro', 'mission', 'teach'].includes(s.id)) errs.push(`station id ${s.id} is reserved`);
    if (!PROPS[s.prop]) errs.push(`station ${s.id}: unknown prop ${s.prop}`);
    if (s.video && !g.videos.some((v) => v.id === s.video)) errs.push(`station ${s.id}: unknown video ${s.video}`);
    mech(s.mechanic, `station ${s.id}`, errs);
    if (s.then) mech(s.then, `station ${s.id}.then`, errs);
  }
  g.challenge.steps.forEach((m, i) => mech(m, `challenge[${i}]`, errs));
  if (!PROPS[g.challenge.reward.prop]) errs.push(`unknown reward prop ${g.challenge.reward.prop}`);
  if (g.intro && !g.intro.tools.some((t) => t.id === g.intro!.correct)) errs.push('intro.correct is not a tool');
  if (g.mission) {
    const m = g.mission;
    mech(m.problem, 'mission.problem', errs);
    mech(m.tasks, 'mission.tasks', errs);
    for (const b of ['rule', 'llm', 'agent', 'human']) if (!m.tasks.bins.some((x) => x.id === b)) errs.push(`mission.tasks: missing bin ${b}`);
    for (const b of ['rule', 'llm', 'human']) if (!m.tasks.items.some((x) => x.bin === b)) errs.push(`mission.tasks: no task for bin ${b} (an agent must not be the answer to everything)`);
    const tid = new Set(m.tools.map((t) => t.id));
    for (const p of m.permissions) {
      if (!tid.has(p.tool)) errs.push(`mission.permissions: unknown tool ${p.tool}`);
      for (const a of p.allowed) if (!p.options.includes(a)) errs.push(`mission.permissions ${p.tool}: allowed ${a} not in options`);
    }
    for (const t of m.tests) {
      for (const n of t.needsTools) if (!tid.has(n)) errs.push(`mission.tests ${t.id}: unknown tool ${n}`);
      for (const n of t.needsTools) if (m.tools.find((x) => x.id === n)?.role === 'forbidden') errs.push(`mission.tests ${t.id}: needs forbidden tool ${n}`);
      if (t.permission && !tid.has(t.permission.tool)) errs.push(`mission.tests ${t.id}: permission on unknown tool`);
    }
    const needed = m.tools.filter((t) => t.role === 'needed').map((t) => t.id);
    const best: Record<string, PermissionLevel> = Object.fromEntries(m.permissions.map((p) => [p.tool, p.allowed[0]]));
    const ideal = runTests(g, needed, best);
    if (!ideal.every(Boolean)) errs.push(`mission: the ideal setup (needed tools + allowed permissions) fails tests ${m.tests.filter((_, i) => !ideal[i]).map((t) => t.id)}`);
    // every needed tool matters; every forbidden tool or wrong permission is caught
    for (const n of needed) if (runTests(g, needed.filter((x) => x !== n), best).every(Boolean)) errs.push(`mission: removing needed tool ${n} breaks no test`);
    for (const p of m.permissions) {
      const wrong = p.options.filter((o) => !p.allowed.includes(o));
      const toolsWith = [...new Set([...needed, p.tool])];
      for (const w of wrong) if (runTests(g, toolsWith, { ...best, [p.tool]: w }).every(Boolean)) errs.push(`mission: wrong permission ${p.tool}=${w} breaks no test`);
    }
    if (!m.tests.some((t) => t.critical)) errs.push('mission: no critical test');
    if (m.tests.length < 4) errs.push('mission: fewer than 4 tests');
  }
  if (g.teach) {
    if (g.teach.colleagues.length !== 3) errs.push('teach: needs exactly 3 colleagues');
    for (const c of g.teach.colleagues) {
      let wins = 0;
      let combos = 0;
      for (const a of c.explain) for (const b of c.example) for (const d of c.limit) {
        combos++;
        if (score([a, b, d])) wins++;
      }
      if (wins !== 1) errs.push(`teach ${c.id}: ${wins} winning combinations out of ${combos} (need exactly 1)`);
      for (const part of [c.explain, c.example, c.limit]) if (part.length !== 3) errs.push(`teach ${c.id}: each part needs 3 options`);
    }
    const kinds = g.teach.colleagues.map((c) => c.kind).sort().join();
    if (kinds !== 'confusion,risky,simple') errs.push(`teach: kinds must be simple+confusion+risky (got ${kinds})`);
  }
  if (g.coverage) {
    const ok = new Set(['intro', 'mission', 'teach', 'challenge', 'lab', ...ids]);
    for (const r of g.coverage) for (const k of [r.learn, r.practice]) if (!ok.has(k)) errs.push(`coverage: unknown target ${k}`);
  }
  const lvl = [g.intro && 'intro', g.mission && 'mission', g.teach && 'teach', g.toolkit && 'kit', g.coverage && `coverage:${g.coverage.length}`, g.capability && 'capability'].filter(Boolean).join(' ');
  console.log(`${errs.length ? 'FAIL' : 'ok  '} ${id}  stations=${g.stations.length} everyday=${g.stations.filter((s) => s.everyday).length}  ${lvl}`);
  errs.slice(0, 12).forEach((e) => console.log('     - ' + e));
  bad += errs.length;
}
process.exit(bad ? 1 : 0);
