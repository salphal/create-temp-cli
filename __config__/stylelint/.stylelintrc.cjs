/**
 * https://github.com/ant-design/ant-design/blob/master/.stylelintrc.js
 */
module.exports = {
  extends: [
    'stylelint-__config__-standard',
    'stylelint-__config__-standard-scss',
    'stylelint-prettier/recommended',
    'stylelint-__config__-rational-order',
  ],
  rules: {
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'layer', 'apply', 'variants', 'responsive', 'screen'],
      },
    ],
    'function-name-case': ['lower'],
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: [
          'fade',
          'fadeout',
          'tint',
          'darken',
          'ceil',
          'fadein',
          'floor',
          'unit',
          'shade',
          'lighten',
          'percentage',
          '-',
        ],
      },
    ],
    'import-notation': null,
    'no-descending-specificity': null,
    'no-invalid-position-at-import-rule': null,
    'declaration-empty-line-before': null,
    'keyframes-name-pattern': null,
    'custom-property-pattern': null,
    'number-max-precision': 8,
    'alpha-value-notation': 'number',
    'color-function-notation': 'legacy',
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'selector-not-notation': null,
  },
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
};
