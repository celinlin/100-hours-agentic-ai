/**
 * Wins "La presse à consignes" (chapter 02).
 * 1. Deliberate mistakes: the task alone (prose, invented time), then format + outdated notes + archive.
 * 2. Win: task + format + this morning's notes.
 */
module.exports = async function play(page) {
  const root = page.locator('.sg02');
  await root.waitFor({ state: 'visible' });
  const pull = async (n) => {
    await root.locator('[data-testid="sg02-pull"]').click();
    await page.locator(`.sg02[data-pulls="${n}"][data-phase="printed"]`).waitFor({ state: 'visible' });
  };
  const state = (i) => root.locator(`[data-testid="sg02-check-${i}"]`).getAttribute('data-state');
  const expect = (cond, msg) => {
    if (!cond) throw new Error(`c02: ${msg}`);
  };

  // mistake 1: nothing but the task → prose, invented time, three rejected checks
  await pull(1);
  expect((await root.locator('[data-testid="sg02-sheet"]').getAttribute('data-shape')) === 'prose', 'expected prose without a format block');
  expect((await state(0)) === 'ko' && (await state(1)) === 'ko' && (await state(2)) === 'ko', 'expected three rejected checks');
  expect((await root.locator('.sg02-why').count()) >= 1, 'expected a one-line reason');
  expect((await root.getAttribute('data-solved')) !== 'true', 'must not be solved yet');

  // mistake 2: format + yesterday's notes + the whole archive → format buried, wrong time
  await root.locator('[data-testid="sg02-block-format"]').click();
  await root.locator('[data-testid="sg02-block-old"]').click();
  await root.locator('[data-testid="sg02-block-archive"]').click();
  await pull(2);
  expect((await state(0)) === 'ko' && (await state(1)) === 'ok' && (await state(2)) === 'ko', 'expected buried format and outdated time');
  await root.locator('[data-testid="sg02-bed-format"] .sg02-tag').waitFor({ state: 'visible' });

  // win: take the archive and the old notes off, set the fresh notes
  await root.locator('[data-testid="sg02-bed-archive"]').click();
  await root.locator('[data-testid="sg02-bed-old"]').click();
  await root.locator('[data-testid="sg02-block-notes"]').click();
  await pull(3);
  await page.locator('.sg02[data-solved="true"]').waitFor({ state: 'visible' });
};
