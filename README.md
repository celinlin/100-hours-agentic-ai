# 100 Hours of Agentic AI — the hotel

An interactive, bilingual (FR/EN) learning site for the 14-step *100 Hours of Agentic AI* programme.
Each step is a lit suite in an Art Deco New York hotel; each programme block is a setback tier.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export in out/, deployable on any static host
```

## Where things live

- `content/fr/NN.md`, `content/en/NN.md`: the full text of each step (the façade is generated from these files, one window per step).
- `content/notes/NN.md`: transcription notes and ambiguities found in the source PDFs.
- `src/lib/markdown.ts`: Markdown + directives (`::part`, `::margin`, `:::resource`, `:::steps`, …) rendered at build time.
- `src/lib/building.ts` / `src/components/Facade.tsx`: the procedural SVG façade.
- `src/lib/enhance.ts`: the interactive workbook (pre-test / final test answers compared to the answer key, journal lines, break/fix, evals, teach-back checklist, review, timers).
- `src/lib/progress.ts`, `src/lib/workbook.ts`: everything is saved locally in the browser (no account).

Typography: Newsreader + Geist. Colours: taken from the programme PDF (forest green `#1E4D3B`, highlighter `#FEE274`).
