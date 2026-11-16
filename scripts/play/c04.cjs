/** Wins "Le standard" (chapter 04). The game root is .sg04 ; the page is in French. */
module.exports = async function play(page) {
  const g = page.locator('.sg04');
  await g.waitFor({ state: 'visible' });
  const tap = (id) => g.locator(`[data-testid="${id}"]`).click();
  const code = (c) => g.locator(`[data-testid="response"][data-code="${c}"]`).waitFor({ state: 'visible' });
  const tone = (t) => g.locator(`[data-testid="feedback"][data-tone="${t}"]`).waitFor({ state: 'visible' });
  const next = async () => { await tone('ok'); await tap('next'); };

  // Call 1 — deliberate mistake: no token, so 401, passed off as an empty day.
  await tap('method-GET');
  await tap('path-ok');
  await tap('connect');
  await code(401);
  await tap('say-empty');
  await tone('err');
  // A wrong address is a 404, not a calendar.
  await tap('token');
  await tap('path-typo');
  await tap('connect');
  await code(404);
  // The right call: 200 with Thursday's events.
  await tap('path-ok');
  await tap('connect');
  await code(200);
  await tap('say-events');
  await next();

  // Call 2 — Friday: 200 and an empty list.
  await tap('connect');
  await code(200);
  await tap('say-empty');
  await next();

  // Call 3 — the token has expired: 401. Hammering the same call earns a 429.
  await tap('connect');
  await code(401);
  await tap('connect');
  await tap('connect');
  await code(429);
  await g.locator('[data-testid="cooling"]').waitFor({ state: 'visible' });
  await g.locator('[data-testid="cooling"]').waitFor({ state: 'detached', timeout: 10000 });
  await tap('path-typo');
  await tap('path-ok');
  await tap('connect');
  await code(401);
  await tap('say-lost');
  await next();

  // Call 4 — creating needs POST, and the read-only scope answers 403.
  await tap('method-POST');
  await tap('connect');
  await code(403);
  await tap('say-scope');
  await page.locator('.sg04[data-solved="true"]').waitFor({ state: 'visible' });
};
