// Wins "La salle des coffres" (chapter 12). The game root is .sg12; the page is in French.
module.exports = async function play(page) {
  const g = page.locator('.sg12');
  await g.waitFor({ state: 'visible' });
  const status = g.locator('[data-testid="sg12-status"]');
  const expectTone = async (tone) => {
    await g.locator(`[data-testid="sg12-status"][data-tone="${tone}"]`).waitFor({ state: 'visible', timeout: 8000 });
    const text = (await status.innerText()).trim();
    if (!text) throw new Error(`c12: empty ${tone} feedback`);
  };

  // Part 1 — deliberate mistake: flag a visible, harmless line.
  await g.locator('[data-testid="sg12-row-4"]').click();
  await g.locator('[data-testid="sg12-flag"]').click();
  await expectTone('err');

  // Then light and flag the three hidden orders (white text, HTML comment, base64).
  for (const i of [3, 5, 7]) {
    await g.locator(`[data-testid="sg12-row-${i}"]`).click();
    await g.locator('[data-testid="sg12-flag"]').click();
  }
  await g.locator('[data-testid="sg12-next"]').click();

  // Part 2 — deliberate mistake: a prompt instruction and a word filter only; the attack still leaks.
  const replay = async () => {
    await g.locator('[data-testid="sg12-run"]').click();
    await g.locator('[data-testid="sg12-results"][data-done="true"]').waitFor({ state: 'visible', timeout: 8000 });
  };
  await g.locator('[data-testid="sg12-lever-prompt"]').click();
  await g.locator('[data-testid="sg12-lever-filter"]').click();
  await replay();
  await expectTone('err');

  // Cut the third lock in code: allowlist + human approval on sending.
  await g.locator('[data-testid="sg12-lever-brake"]').click();
  await replay();
  await page.locator('.sg12[data-solved="true"]').waitFor({ state: 'visible', timeout: 8000 });
};
