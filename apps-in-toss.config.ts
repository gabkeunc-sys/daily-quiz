import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'daily-one-quiz',
  permissions: [],
  navigationBar: { withBackButton: true, withHomeButton: false },
  webBundleDir: 'dist',
});
