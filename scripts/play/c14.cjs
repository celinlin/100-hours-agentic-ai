/**
 * Wins « La remise des clés » (chapter 14).
 * Deliberate mistakes first: a folder with one reassuring paper instead of evidence, and a hidden
 * demo failure. Then the honest demo, a failed week, the folder fixed, and the signed handover.
 */
module.exports = async function play(page) {
  const root = page.locator('.sg14');
  await root.waitFor({ state: 'visible' });
  const tid = (id) => root.locator(`[data-testid="${id}"]`);
  const status = tid('sg14-status');
  const expectTone = async (tone) => {
    await root.locator(`[data-testid="sg14-status"][data-tone="${tone}"]`).waitFor({ state: 'visible' });
  };

  // Act 1 — four pieces of evidence and one sentence that only reassures (no "who to call").
  for (const id of ['tests', 'scope', 'rollback', 'traces', 'machine']) await tid(`sg14-card-${id}`).click();
  await tid('sg14-close').click();

  // Act 2 — her three real files; the third goes wrong live.
  for (const i of [0, 1, 2]) await tid(`sg14-case-${i}`).click();
  await expectTone('err');

  // Mistake 1: hide the failure → Inès noticed, trust collapses.
  await tid('sg14-react-hide').click();
  await expectTone('err');
  if (!(await status.innerText()).trim()) throw new Error('c14: no feedback after hiding the failure');
  if ((await root.getAttribute('data-trust')) !== '0') throw new Error('c14: trust should drop to 0 after hiding the failure');

  // Honest reaction: show the trace, write the failure down.
  await tid('sg14-react-note').click();
  await expectTone('ok');
  await tid('sg14-notes').waitFor({ state: 'visible' });
  await tid('sg14-to-week').click();

  // Act 3 — the week plays out; Tuesday (expired key) breaks: nobody to call.
  await tid('sg14-leave').click();
  await root.locator('[data-testid="sg14-day-4"]:not([data-state="wait"]):not([data-state="now"])').waitFor({ timeout: 15000 });
  if ((await tid('sg14-day-1').getAttribute('data-state')) !== 'ko') throw new Error('c14: Tuesday should break without the contact');
  await expectTone('err');
  if (await root.getAttribute('data-solved')) throw new Error('c14: must not be solved with a broken week');

  // Mistake 2 repaired: swap the sentence for the contact, and leave again.
  await tid('sg14-reopen').click();
  await tid('sg14-slot-machine').click();
  await tid('sg14-card-contact').click();
  await tid('sg14-close').click();
  await tid('sg14-leave').click();

  await page.locator('.sg14[data-solved="true"]').waitFor({ state: 'visible', timeout: 15000 });
  await tid('sg14-signed').waitFor({ state: 'visible' });
};
