import type { PropFn } from './common';
import * as common from './common';
import * as ch01 from './ch01';
import * as ch02 from './ch02';
import * as ch03 from './ch03';
import * as ch04 from './ch04';
import * as ch05 from './ch05';
import * as ch06 from './ch06';
import * as ch07 from './ch07';
import * as ch08 from './ch08';
import * as ch09 from './ch09';
import * as ch10 from './ch10';
import * as ch11 from './ch11';
import * as ch12 from './ch12';
import * as ch13 from './ch13';
import * as ch14 from './ch14';

/** Every drawable prop, by name. Chapter files only export PropFn values. */
function collect(mod: Record<string, unknown>): Record<string, PropFn> {
  const out: Record<string, PropFn> = {};
  for (const [k, v] of Object.entries(mod)) if (typeof v === 'function' && k !== 'Shadow') out[k] = v as PropFn;
  return out;
}

export const PROPS: Record<string, PropFn> = {
  ...collect(common),
  ...collect(ch01),
  ...collect(ch02),
  ...collect(ch03),
  ...collect(ch04),
  ...collect(ch05),
  ...collect(ch06),
  ...collect(ch07),
  ...collect(ch08),
  ...collect(ch09),
  ...collect(ch10),
  ...collect(ch11),
  ...collect(ch12),
  ...collect(ch13),
  ...collect(ch14),
};
