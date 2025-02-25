// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  {
    root: true,
    ignores: ['node_modules/', 'dist/', '.next/'],
  },
  ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended'),
  {
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: true,
      },
    },
    rules: {
      // 필요하면 추가 규칙을 정의
    },
  },
]
