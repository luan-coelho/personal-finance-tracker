import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      '*.tsbuildinfo',
      'next-env.d.ts',
      '.vercel/**',
      'coverage/**',
      'drizzle/**',
      'src/generated/**',
    ],
  },
]

export default eslintConfig
