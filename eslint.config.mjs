import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.node,
                ...globals.browser,
            }
        },
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            'no-unused-vars': 'off',
            'no-trailing-spaces': ["error", { "skipBlankLines": false, "ignoreComments": true }],
            'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1 }],
            'keyword-spacing': ["error", { "before": true }],
            curly: ['error', 'multi-or-nest'],
            quotes: ['error', 'single'],
            indent: ['error', 4, { 'SwitchCase': 1 }],
            'max-len': ['error', 120],
            'semi': ['error', 'always'],
            'eol-last': ['error', 'always'],
            'linebreak-style': ['error', 'unix'],
            'object-curly-spacing': [
                'error',
                'always'
            ],
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            'comma-dangle': ["error", {
                "arrays": "always-multiline",
                "objects": "always-multiline",
                "imports": "never",
                "exports": "never",
                "functions": "never"
            }],
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    ignoreRestSiblings: false,
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        files: ['**/*.js'],
        ...tseslint.configs.disableTypeChecked,
    },
    {
        ignores: [
            "**/static",
            "**/node_modules",
        ],
    }
);
