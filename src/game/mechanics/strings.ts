import type { T } from '../types';

export type Lang = 'fr' | 'en';

/** Bilingual UI strings shared by every mechanic. */
export const S = {
  check: { fr: 'Vérifier', en: 'Check' },
  retry: { fr: 'Recommencer', en: 'Start over' },
  again: { fr: 'À revoir', en: 'Check again' },
  right: { fr: 'Juste', en: 'Correct' },
  solved: { fr: 'Juste. Épreuve résolue.', en: 'Correct. Solved.' },
  hint: { fr: 'Indice', en: 'Hint' },
  // order
  moveUp: { fr: 'Monter', en: 'Move up' },
  moveDown: { fr: 'Descendre', en: 'Move down' },
  dragHandle: { fr: 'Glisser pour déplacer', en: 'Drag to move' },
  position: { fr: 'position', en: 'position' },
  of: { fr: 'sur', en: 'of' },
  stepsToReview: { fr: 'étape(s) mal placée(s). Lisez les indices et réessayez.', en: 'step(s) out of place. Read the hints and try again.' },
  // sort
  toPlace: { fr: 'Cartes à classer', en: 'Cards to sort' },
  dropIn: { fr: 'Déposer ici', en: 'Place here' },
  binFor: { fr: 'Bac pour', en: 'Bin for' },
  notPlaced: { fr: 'Non classée', en: 'Not sorted' },
  pickCardFirst: { fr: 'Choisissez d’abord une carte, puis un bac.', en: 'Pick a card first, then a bin.' },
  selected: { fr: 'sélectionnée. Choisissez un bac.', en: 'selected. Now pick a bin.' },
  placedIn: { fr: 'placée dans', en: 'placed in' },
  placeAll: { fr: 'Classez toutes les cartes avant de vérifier.', en: 'Sort every card before checking.' },
  cardsToReview: { fr: 'carte(s) dans le mauvais bac. Les explications sont sous chaque carte.', en: 'card(s) in the wrong bin. The explanations are under each card.' },
  emptyBin: { fr: 'Vide', en: 'Empty' },
  // match
  pickLeftFirst: { fr: 'Choisissez d’abord un élément de la colonne de gauche.', en: 'Pick an item in the left column first.' },
  linkedTo: { fr: 'relié à', en: 'linked to' },
  unlinked: { fr: 'lien retiré', en: 'link removed' },
  linkAll: { fr: 'Reliez chaque élément avant de vérifier.', en: 'Link every item before checking.' },
  pairsToReview: { fr: 'association(s) incorrecte(s). Réessayez.', en: 'pair(s) are wrong. Try again.' },
  leftCol: { fr: 'Éléments', en: 'Items' },
  rightCol: { fr: 'Correspondances', en: 'Matches' },
  // choice
  pickOne: { fr: 'Choisissez une réponse.', en: 'Pick an answer.' },
  pickSome: { fr: 'Choisissez au moins une réponse.', en: 'Pick at least one answer.' },
  severalAnswers: { fr: 'Plusieurs réponses possibles.', en: 'Several answers possible.' },
  notThis: { fr: 'Pas tout à fait. Lisez l’explication et réessayez.', en: 'Not quite. Read the explanation and try again.' },
  missing: { fr: 'Il manque encore au moins une bonne réponse.', en: 'At least one correct answer is still missing.' },
  // spot
  pickLine: { fr: 'Sélectionnez au moins une ligne.', en: 'Select at least one line.' },
  linesWrong: { fr: 'ligne(s) sélectionnée(s) à tort.', en: 'line(s) selected by mistake.' },
  linesMissing: { fr: 'Il reste au moins une ligne fautive à trouver.', en: 'At least one faulty line is still to be found.' },
  line: { fr: 'Ligne', en: 'Line' },
  faulty: { fr: 'Fautive', en: 'Faulty' },
  // fill
  blank: { fr: 'Trou', en: 'Blank' },
  choose: { fr: '…', en: '…' },
  fillAll: { fr: 'Complétez tous les trous avant de vérifier.', en: 'Fill every blank before checking.' },
  blanksWrong: { fr: 'trou(s) à revoir.', en: 'blank(s) to review.' },
  // sampler
  illustrative: { fr: 'Probabilités illustratives', en: 'Illustrative probabilities' },
  temperature: { fr: 'Température', en: 'Temperature' },
  draw: { fr: 'Tirer', en: 'Draw' },
  history: { fr: 'Tirages', en: 'Draws' },
  noDraw: { fr: 'Aucun tirage pour l’instant.', en: 'No draws yet.' },
  drawn: { fr: 'Token tiré', en: 'Drawn token' },
  distinctHigh: { fr: 'Tokens différents à T ≥ 1,2', en: 'Distinct tokens at T ≥ 1.2' },
  nextToken: { fr: 'Prochain token', en: 'Next token' },
  // loop
  context: { fr: 'Contexte', en: 'Context' },
  request: { fr: 'Demande', en: 'Request' },
  toolCall: { fr: 'Appel d’outil', en: 'Tool call' },
  result: { fr: 'Résultat', en: 'Result' },
  final: { fr: 'Réponse finale', en: 'Final answer' },
  actions: { fr: 'Votre action', en: 'Your action' },
  executing: { fr: 'Le système exécute', en: 'The system executes' },
  resultAdded: { fr: 'résultat ajouté au contexte.', en: 'result added to the context.' },
} satisfies Record<string, T>;

export const t = (x: T, lang: Lang) => x[lang];
