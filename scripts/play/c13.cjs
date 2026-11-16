// Wins "La chaufferie" (chapter 13). The game root is .sg13; the page is in French.
module.exports = async function play(page) {
  const g = page.locator('.sg13');
  await g.waitFor({ state: 'visible' });
  const night = async () => {
    await g.locator('[data-testid="sg13-launch"]').click();
    await g.locator('[data-testid="sg13-report"]').waitFor({ state: 'visible', timeout: 12000 });
  };

  // Deliberate mistake: launch the night with the regulator as found (unbounded instant retries, no cap, no alert).
  await night();
  await g.locator('[data-testid="sg13-status"][data-tone="err"]').waitFor({ state: 'visible', timeout: 4000 });
  const why = (await g.locator('[data-testid="sg13-status"]').innerText()).trim();
  if (!why) throw new Error('c13: empty feedback after a failed night');
  await g.locator('[data-testid="sg13-back"]').click();

  // The settings that hold the night.
  for (const id of ['key-env', 'tries-3', 'delay-expo', 'scope-transient', 'cap-on', 'alert-useful']) {
    await g.locator(`[data-testid="sg13-${id}"]`).click();
  }
  await night();
  await page.locator('.sg13[data-solved="true"]').waitFor({ state: 'visible', timeout: 4000 });
};
