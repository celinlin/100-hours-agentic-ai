/** Wins "Le carnet de suite" (chapter 07), after one deliberate mistake. */
module.exports = async function play(page) {
  const g = page.locator('.sg07');
  await g.waitFor({ state: 'visible' });
  const tap = (id) => g.locator(`[data-testid="${id}"]`).click();
  const morning = (pass) => g.locator(`[data-testid="morning"][data-pass="${pass}"]`).waitFor({ state: 'visible' });

  // Evening 1 — deliberate mistake: the personal phone number goes into the notebook.
  await tap('note-step1');
  await tap('note-b15');
  await tap('note-open');
  await tap('note-phone');
  await tap('night');
  await morning('false');
  await g.locator('[data-testid="incident"]').first().waitFor({ state: 'visible' });

  // Back to the evening: take the number out, keep step, decision and open question.
  await tap('retry');
  await tap('line-phone');
  await tap('night');
  await morning('true');
  await tap('next');

  // Evening 2 — strike the stale budget, note the call and the corrected budget.
  await tap('line-b15');
  await tap('note-visio');
  await tap('note-b18');
  await tap('night');
  await morning('true');
  await tap('next');

  // Evening 3 — the step moved on and the open question is settled: strike both, note the new ones.
  await tap('line-step1');
  await tap('line-open');
  await tap('note-fmt');
  await tap('note-step2');
  await tap('night');
  await page.locator('.sg07[data-solved="true"]').waitFor({ state: 'visible' });
};
