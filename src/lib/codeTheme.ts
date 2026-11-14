import type { ThemeRegistration } from 'shiki';

/** A quiet code theme drawn from the hotel palette: night glass, limestone text, brass keywords. */
export const hotelCodeTheme: ThemeRegistration = {
  name: 'hotel-night',
  type: 'dark',
  colors: {
    'editor.background': '#10261D',
    'editor.foreground': '#E4DCCD',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#8695A5', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'keyword.control', 'storage.type', 'keyword.operator.logical'], settings: { foreground: '#E3C27A' } },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: '#B9DCC4' } },
    { scope: ['constant.numeric', 'constant.language', 'support.constant'], settings: { foreground: '#DBA58C' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'], settings: { foreground: '#F4EFE5' } },
    { scope: ['entity.name.class', 'entity.name.type', 'support.class', 'support.type'], settings: { foreground: '#B9C7B0' } },
    { scope: ['variable.parameter', 'variable.parameter.function'], settings: { foreground: '#C9D1DA' } },
    { scope: ['support.type.property-name', 'meta.object-literal.key', 'entity.name.tag'], settings: { foreground: '#A9BBCB' } },
    { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#B8B0A2' } },
    { scope: ['variable.other.readwrite', 'variable'], settings: { foreground: '#E4DCCD' } },
  ],
};
