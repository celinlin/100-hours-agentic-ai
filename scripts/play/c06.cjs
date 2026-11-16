/** Wins "L'enquête à la bibliothèque" (chapter 06), after one deliberate mistake. */
module.exports = async function play(page) {
  const g = page.locator('.sg06');
  await g.waitFor({ state: 'visible' });
  const tap = (id) => g.locator(`[data-testid="${id}"]`).click();
  const verdict = (v) => g.locator(`[data-testid="verdict"][data-verdict="${v}"]`).waitFor({ state: 'visible' });

  // Case 1 — deliberate mistake: cite the look-alike passage (subtitle price).
  await tap('book-gr');
  await tap('passage-gr_options');
  await tap('cite-gr_options');
  await tap('submit');
  await verdict('offtopic');
  if (!(await g.locator('.sg06-result .is-err').isVisible())) throw new Error('c06: no feedback after the mistake');

  // …then the passage that really answers.
  await tap('pinned-gr_options');
  await tap('passage-gr_formats');
  await tap('cite-gr_formats');
  await tap('submit');
  await verdict('ok');
  await tap('next');

  // Case 2 — two documents disagree: pin both, flag the gap.
  await tap('book-cr');
  await tap('passage-cr_budget');
  await tap('book-gr');
  await tap('passage-gr_env');
  await tap('stance-gap');
  await tap('submit');
  await verdict('ok');
  await tap('next');

  // Case 3 — no book holds the answer: say so.
  await tap('stance-none');
  await tap('submit');
  await page.locator('.sg06[data-solved="true"]').waitFor({ state: 'visible' });
};
