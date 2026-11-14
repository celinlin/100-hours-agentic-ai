import type { ChapterGame } from '../types';
import ch01 from './01';
import ch02 from './02';
import ch03 from './03';
import ch04 from './04';
import ch05 from './05';
import ch06 from './06';
import ch07 from './07';
import ch08 from './08';
import ch09 from './09';
import ch10 from './10';
import ch11 from './11';
import ch12 from './12';
import ch13 from './13';
import ch14 from './14';

/** id → playable chapter. A chapter whose file exports `null` falls back to the reading view. */
const ALL: Record<string, ChapterGame | null> = {
  '01': ch01,
  '02': ch02,
  '03': ch03,
  '04': ch04,
  '05': ch05,
  '06': ch06,
  '07': ch07,
  '08': ch08,
  '09': ch09,
  '10': ch10,
  '11': ch11,
  '12': ch12,
  '13': ch13,
  '14': ch14,
};

export const GAMES: Record<string, ChapterGame> = Object.fromEntries(
  Object.entries(ALL).filter((e): e is [string, ChapterGame] => e[1] !== null),
);

/** The lift door to the next floor sits at the same place in every room. */
export const DOOR_AT = { x: 1490, y: 470 };
