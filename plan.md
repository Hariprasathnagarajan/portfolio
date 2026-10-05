# Portfolio redesign plan

## Design direction

- **Design movement:** editorial digital studio / field-notes interface — part creative developer portfolio, part research notebook.
- **Core principles:** asymmetry over centered grids; visible structure through rules and labels; warm human imagery against an ink-dark canvas; motion used as a tactile cue, not decoration.
- **Color philosophy:** `#11100e` ink gives the work room to breathe; `#f2eee6` paper creates a human editorial counterpoint; amber `#f4a340` is the ownable signal color for availability, links, and system markers; muted blue and coral add just enough dimensional contrast.
- **Layout paradigm:** a persistent vertical index rail on desktop, staggered section starts, and project rows that read like annotated case-study cards rather than product tiles.
- **Signature elements:** amber registration marks, a thin ruled grid texture, and oversized section numbers paired with micro-labels.
- **Interaction philosophy:** links reveal their destination; cards lift a few pixels and expose a second layer of information; navigation follows the reader without dominating; all motion has a reduced-motion fallback.
- **Animation:** initial copy rises in on a soft stagger; portrait frame drifts independently from the hero copy; project rows reveal an amber sweep and arrow on hover; scroll progress is a slender signal line; section content uses low-distance reveal transitions.
- **Typography system:** `Newsreader` for expressive display headlines, `DM Sans` for interface copy, and `Space Mono` for labels, dates, and technical details.
- **Brand essence:** “Hariprasath builds calm, useful software around complex AI ideas.” Personality: **curious, precise, quietly bold**.
- **Brand voice:** direct, observant, specific. Example lines: “I make the complicated part feel obvious.” / “Give me a messy problem and a little room to think.”
- **Wordmark & logo:** a compact `HN/` monogram with a diagonal amber slash, used as a text mark instead of a generic icon.
- **Signature brand color:** amber `#f4a340`.

## Implementation

- Keep the existing Vite + React + TypeScript stack.
- Replace the generic component assembly with a single readable page composition in `src/App.tsx`, supported by `src/App.css` and `src/index.css`.
- Preserve the supplied portrait from `public/photo.jpeg` and use the supplied identity/project information from the repository data.
- Use Framer Motion for entrance and hover transitions and Lucide icons for small interface marks.
- Add `public/manus-routes.json` for the single-page route manifest.
- Update `index.html` metadata and font loading.
- Validate with `npm run build` and `npm run lint`, then inspect the running page locally.

## Project structure

- `src/App.tsx`: portfolio page sections, project content, lightweight interactions, and motion orchestration.
- `src/App.css`: page-specific layout, editorial components, responsive breakpoints, and animation keyframes.
- `src/index.css`: global reset, typography, palette, and accessibility defaults.
- `public/photo.jpeg`: existing supplied portrait.
- `public/manus-routes.json`: route declaration for the single-page site.
