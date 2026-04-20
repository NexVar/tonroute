import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    ignores: ['.next/**', '.open-next/**', 'coverage/**', 'playwright-report/**', 'test-results/**', 'node_modules/**']
  }
];

export default config;
