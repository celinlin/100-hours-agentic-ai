/** Registry keys of the bespoke room games. */
export const SIGNATURE_GAMES = ['c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09', 'c10', 'c11', 'c12', 'c13', 'c14'] as const;
export type SignatureKey = (typeof SIGNATURE_GAMES)[number];

export interface SignatureProps {
  lang: 'fr' | 'en';
  onSolved: () => void;
  onMistake?: () => void;
}
