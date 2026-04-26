# File Size Limits: CaseSift Website (Frontend)

| Pattern | Limit | Severity | Rationale |
|---|---|---|---|
| `src/app/**/page.tsx` | 600 lines | warning | Marketing pages can be long. Above 600, split into section components under `src/components/sections/`. The current `page.tsx` is on the upper end and is a known refactor candidate. |
| `src/app/layout.tsx` | 200 lines | warning | Layout should be thin — heavy logic belongs in components |
| `src/components/*.tsx` | 250 lines | warning | Components over 250 lines should be split |
| `src/components/sections/*.tsx` | 400 lines | warning | Section components can be larger but flag for review |
| `src/lib/*.ts` | 200 lines | warning | Utility files — split if they grow |
| `next.config.ts` | 100 lines | warning | Config should be flat and readable |
| `.github/workflows/*.yml` | 250 lines | warning | Long workflows are usually doing too much; consider composite actions or splitting |

## Severity Definitions

- **error**: Must be fixed before merge. Split the file.
- **warning**: Flag for review. Consider splitting at next opportunity.
