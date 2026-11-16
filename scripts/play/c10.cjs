/** Wins "Le banc d'essai" (chapter 10): one wrong diagnosis and one wrong decision first. */
module.exports = async function play(page) {
  const g = page.locator('.sg10');
  await g.waitFor({ state: 'visible' });
  const fb = (tone) => g.locator(`[data-testid="feedback"][data-tone="${tone}"]`);
  const diagnose = async (id, cause) => {
    await g.getByTestId(`cell-${id}-v4`).click();
    await g.getByTestId('sheet').waitFor();
    await g.getByTestId(`cause-${cause}`).click();
  };

  await g.getByTestId('lever').click();
  await page.waitForSelector('.sg10[data-phase="inspect"]', { timeout: 20000 });

  // deliberate mistake: blame the grader for the unstable case 12
  await diagnose('c12', 'grader');
  await fb('err').waitFor();
  await g.getByTestId('cause-agent').click();
  await fb('ok').waitFor();

  await diagnose('c08', 'agent');
  await diagnose('c19', 'grader');
  await diagnose('c16', 'case');
  await page.waitForSelector('.sg10[data-phase="decide"]');

  // deliberate mistake: ship on the better average
  await g.getByTestId('ship').click();
  await fb('err').waitFor();
  // wrong evidence: a case that already failed on v3
  await g.getByTestId('cell-c08-v3').click();
  await g.getByTestId('hold').click();
  await fb('err').waitFor();

  await g.getByTestId('cell-c12-v4').click();
  await g.getByTestId('hold').click();
  await page.waitForSelector('.sg10[data-solved="true"]');
};
