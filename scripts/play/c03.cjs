/**
 * Wins "L'établi de l'agent" (chapter 03).
 * 1. Deliberate mistakes: calendrier({"date": …}) → unknown argument; envoyer_mail → refused.
 * 2. Win: calendrier(jour), recherche(Brume & Quai), recherche(Inès Caron), final answer.
 */
module.exports = async function play(page) {
  const root = page.locator('.sg03');
  await root.waitFor({ state: 'visible' });
  const tid = (id) => root.locator(`[data-testid="${id}"]`);
  const expect = (cond, msg) => {
    if (!cond) throw new Error(`c03: ${msg}`);
  };
  let turn = 0;
  const send = async (tool, arg, val, kind) => {
    await tid(`sg03-tool-${tool}`).click();
    await tid(`sg03-arg-${arg}`).click();
    await tid(`sg03-val-${val}`).click();
    await tid('sg03-send').click();
    turn += 1;
    const res = root.locator(`[data-testid="sg03-result"][data-turn="${turn}"]`);
    await res.waitFor({ state: 'visible' });
    expect((await res.getAttribute('data-kind')) === kind, `turn ${turn}: expected ${kind}, got ${await res.getAttribute('data-kind')}`);
    await page.locator('.sg03[data-busy="false"]').waitFor({ state: 'visible' });
    return res;
  };

  // the company is not selectable before the calendar revealed it
  expect(await tid('sg03-val-bq').isDisabled(), 'Brume & Quai should be locked at first');

  // mistake 1: wrong argument name → typed error returned to the model
  const err = await send('calendrier', 'date', 'jeudi', 'error');
  expect(/jour/.test(await err.innerText()), 'the error should name the right argument');
  // mistake 2: a tool that is not on the allow-list → refused
  await send('envoyer_mail', 'a', 'ines', 'refused');

  // win
  await send('calendrier', 'jour', 'jeudi', 'ok');
  expect((await tid('sg03-fact-when').getAttribute('data-known')) === 'true', 'the brief should now know when');
  await send('recherche', 'requete', 'bq', 'ok');
  await send('recherche', 'requete', 'ines', 'ok');
  await tid('sg03-final').click();
  await page.locator('.sg03[data-solved="true"]').waitFor({ state: 'visible' });
};
