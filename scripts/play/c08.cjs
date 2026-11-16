/**
 * Wins "Le tampon" (chapter 08).
 * 1. Deliberate mistake: e-mails in the "alone" lane → the misaddressed quote leaves on its own (incident).
 * 2. Win: reads alone, draft / e-mail / payment on "ask first", deletion "never"; then stamp each slip
 *    after reading it (approve the draft and the right e-mail, refuse the wrong recipient, the payment
 *    ordered by a document, and the reworded resend).
 */
module.exports = async function play(page) {
  const root = page.locator('.sg08');
  await root.waitFor({ state: 'visible' });
  const expect = (cond, msg) => {
    if (!cond) throw new Error(`c08: ${msg}`);
  };
  const rules = async (set) => {
    for (const [kind, lane] of Object.entries(set)) await root.locator(`[data-testid="rule-${kind}-${lane}"]`).click();
  };
  /** Plays a morning to its end; `stamp(slipId)` returns 'yes' or 'no' for the slips that ring. */
  const morning = async (stamp) => {
    const seen = { gone: 0 };
    for (let guard = 0; guard < 400; guard += 1) {
      if ((await root.getAttribute('data-phase')) === 'end') return seen;
      const cont = root.locator('[data-testid="continue"]');
      const yes = root.locator('[data-testid="stamp-yes"]');
      if (await cont.isVisible()) {
        // an incident or a wrong stamp holds the desk: the feedback must be on screen
        const bad = (await root.locator('.sg08-mark[data-tone="bad"]').count()) + 0;
        const why = await root.locator('[data-testid="note"][data-tone="bad"]').count();
        if (bad && why) seen.gone += 1;
        await cont.click();
      }
      else if (await yes.isVisible()) {
        const id = await root.locator('[data-testid="slip"]').getAttribute('data-slip');
        await root.locator(`[data-testid="stamp-${stamp(id)}"]`).click();
      } else await page.waitForTimeout(120);
    }
    throw new Error('c08: the morning never ended');
  };

  // mistake: e-mails leave alone
  await rules({ cal: 'auto', draft: 'ask', email: 'auto', pay: 'ask', del: 'never' });
  await root.locator('[data-testid="open"]').click();
  const seen = await morning((id) => (id === 's3' ? 'yes' : 'no'));
  expect(seen.gone >= 1, 'expected the misaddressed slip to be marked as gone, with a red one-line reason');
  expect((await root.locator('[data-testid="incidents"]').getAttribute('data-count')) === '1', 'expected one incident');
  expect((await root.getAttribute('data-solved')) !== 'true', 'must not be solved after an incident');
  await root.locator('[data-testid="verdict"][data-tone="bad"]').waitFor({ state: 'visible' });

  // win
  await root.locator('[data-testid="change"]').click();
  await rules({ email: 'ask' });
  await root.locator('[data-testid="open"]').click();
  const answers = { s3: 'yes', s4: 'yes', s6: 'no', s8: 'no', s9: 'no' };
  await morning((id) => answers[id] || 'no');
  await page.locator('.sg08[data-solved="true"]').waitFor({ state: 'visible' });
};
