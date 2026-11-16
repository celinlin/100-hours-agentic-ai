/** Wins "Le tableau des clés MCP" (chapter 05). The game root is .sg05 ; the page is in French. */
module.exports = async function play(page) {
  const g = page.locator('.sg05');
  await g.waitFor({ state: 'visible' });
  const tap = (id) => g.locator(`[data-testid="${id}"]`).click();
  const tone = (t) => g.locator(`[data-testid="feedback"][data-tone="${t}"]`).waitFor({ state: 'visible' });
  const state = (s, st) => g.locator(`[data-testid="server-${s}"][data-state="${st}"]`).waitFor({ state: 'visible' });
  const next = async () => { await tone('ok'); await tap('next'); };

  // Deliberate mistakes: tools/list before initialize, then a guessed tool name.
  await tap('list-agenda');
  await tone('err');
  await tap('init-agenda');
  await state('agenda', 'init');
  await tap('guess');
  await tone('err');

  // Request 1 — Thursday's calendar.
  await tap('list-agenda');
  await state('agenda', 'listed');
  await tap('call-agenda-calendrier');
  await next();

  // Request 2 — a file: the documents server, discovered first.
  await tap('init-documents');
  await tap('list-documents');
  await state('documents', 'listed');
  await tap('call-documents-lire_fichier');
  await next();

  // Request 3 — a person: wrong key first, then the right one.
  await tap('call-agenda-calendrier');
  await tone('err');
  await tap('call-agenda-recherche');
  await next();

  // Request 4 — an email: only the third-party server offers it, with a hidden order.
  await tap('init-super');
  await tap('list-super');
  await state('super', 'listed');
  await tap('call-super-envoyer_mail');
  await tone('err');
  await tap('plug-super');
  await state('super', 'off');
  await tap('decline');
  await page.locator('.sg05[data-solved="true"]').waitFor({ state: 'visible' });
};
