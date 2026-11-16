/**
 * Wins "Le passe" (chapter 09).
 * 1. Deliberate mistakes: a ticket with a vague task and no context; a writer launched in parallel with
 *    the research; serving the brief without flagging the gap; three helpers for a three-line task.
 * 2. Win: complete ticket → budget + deadline in parallel, writer waits for the notes → flag the two
 *    amounts that disagree → the lead alone for the small order.
 */
module.exports = async function play(page) {
  const root = page.locator('.sg09');
  await root.waitFor({ state: 'visible' });
  const expect = (cond, msg) => {
    if (!cond) throw new Error(`c09: ${msg}`);
  };
  const setTo = async (testid, value) => {
    const el = root.locator(`[data-testid="${testid}"]`);
    for (let i = 0; i < 6; i += 1) {
      if ((await el.getAttribute('data-value')) === String(value)) return;
      await el.click();
    }
    throw new Error(`c09: could not set ${testid} to ${value}`);
  };
  const service = async () => {
    await root.locator('[data-testid="service"]').click();
    await page.locator('.sg09[data-phase="done"]').waitFor({ state: 'visible' });
  };
  const tone = () => root.locator('[data-testid="note"]').getAttribute('data-tone');
  const next = async (step) => {
    await root.locator('[data-testid="next"]').click();
    await page.locator(`.sg09[data-step="${step}"]`).waitFor({ state: 'visible' });
  };

  // course 1 — mistake: vague task, no context, free text, no limit
  for (const p of ['task', 'ctx', 'fmt', 'lim']) await setTo(`part-${p}`, 0);
  await service();
  expect((await tone()) === 'bad', 'expected a bad return for a vague ticket');
  expect((await root.locator('[data-testid="part-task"]').getAttribute('data-bad')) === 'true', 'expected the task line to be flagged');
  // still wrong: precise task but no context → another client's budget
  await setTo('part-task', 1);
  await service();
  expect((await root.locator('[data-testid="return"]').textContent()).replace(/\s/g, ' ').includes('22 000'), 'expected the wrong budget without context');
  // right ticket
  await setTo('part-ctx', 2);
  await setTo('part-fmt', 1);
  await setTo('part-lim', 1);
  await service();
  expect((await tone()) === 'good', 'expected the complete ticket to pass');
  await next(2);

  // course 2 — mistake: the writer starts with the research
  await setTo('job-0', 'budget');
  await setTo('job-1', 'delai');
  await setTo('job-2', 'brief');
  await service();
  expect((await tone()) === 'bad', 'expected a brief with holes');
  expect((await root.locator('.sg09-plates li[data-tone="bad"]').count()) === 1, 'expected one bad plate');
  await root.locator('[data-testid="wait-2"]').click();
  await service();
  expect((await tone()) === 'good', 'expected the service to beat the solo baseline');
  await next(3);

  // course 3 — mistake: serve without flagging
  await root.locator('[data-testid="serve"]').click();
  expect((await tone()) === 'bad', 'expected a consequence when serving silently');
  await root.locator('[data-testid="line-a1"]').click();
  await root.locator('[data-testid="line-b3"]').click();
  await root.locator('[data-testid="flag"]').click();
  expect((await tone()) === 'good', 'expected the flag to be accepted');
  await next(4);

  // course 4 — mistake: three helpers for three lines
  await service();
  expect((await tone()) === 'bad', 'expected three helpers to be slower and dearer');
  expect((await root.getAttribute('data-solved')) !== 'true', 'must not be solved yet');
  for (let i = 0; i < 3; i += 1) await root.locator('[data-testid="crew-less"]').click();
  await root.locator('[data-testid="service"]').click();
  await page.locator('.sg09[data-solved="true"]').waitFor({ state: 'visible' });
};
