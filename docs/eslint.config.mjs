import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

// ESLint 9 flat config. Mirrors the old `.eslintrc.json` which extended
// "next/core-web-vitals" and "next/typescript" (eslintrc format), now that
// `next lint` is removed in Next 16 and eslint-config-next ships flat configs.
const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: ['.next/**', 'out/**', 'next-env.d.ts'],
  },
]

export default config
