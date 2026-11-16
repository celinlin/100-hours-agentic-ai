/** Wins "La salle de contrôle" (chapter 11): one mistake at the first reading, one at the desk. */
module.exports = async function play(page) {
  const g = page.locator('.sg11');
  await g.waitFor({ state: 'visible' });
  const fb = (tone) => g.locator(`[data-testid="feedback"][data-tone="${tone}"]`);
  const stage = (n) => page.waitForSelector(`.sg11[data-stage="${n}"]`);

  // 1 · cause — deliberate mistake: mark the final answer (the symptom)
  await g.getByTestId('mark').click();
  await fb('err').waitFor();
  await g.getByTestId('back').click(); // turn 4
  await g.getByTestId('back').click(); // turn 3: the tool timeout
  await g.getByTestId('mark').click();
  await stage(1);

  // 2 · slowness
  await g.getByTestId('lens-ms').click();
  await g.getByTestId('span-2').click();
  await g.getByTestId('mark').click();
  await stage(2);

  // 3 · cost
  await g.getByTestId('lens-tok').click();
  await g.getByTestId('span-5').click();
  await g.getByTestId('mark').click();
  await stage(3);
  await g.getByTestId('block-tools').click(); // mistake: not sent at every turn
  await fb('err').waitFor();
  await g.getByTestId('block-sys').click();
  await g.getByTestId('next').click();
  await stage(4);

  // 4 · redaction — deliberate mistake: write with the API key still readable
  await g.getByTestId('field-iban').click();
  await g.getByTestId('write').click();
  await fb('err').waitFor();
  await g.getByTestId('field-key').click();
  await g.getByTestId('field-tel').click();
  await g.getByTestId('write').click();
  await page.waitForSelector('.sg11[data-solved="true"]');
};
