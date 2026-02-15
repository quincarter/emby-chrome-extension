import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';

/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  browsers: [playwrightLauncher({ product: 'chromium' })],
  coverage: true,
  coverageConfig: {
    reportDir: 'coverage/wtr',
    reporters: ['lcov', 'json-summary'],
    include: ['src/components/**/*.ts', 'src/mixins/**/*.ts'],
    exclude: ['src/**/*.test.ts', 'src/**/*.styles.ts', 'src/**/*.svg.ts'],
  },
  plugins: [
    esbuildPlugin({
      ts: true,
      tsconfig: './tsconfig.json',
    }),
  ],
  testFramework: {
    config: {
      timeout: 5000,
    },
  },
};
