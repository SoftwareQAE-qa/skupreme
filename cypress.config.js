const { defineConfig } = require('cypress');

const isCI = process.env.CI || process.env.GITLAB_CI;

// Load local env file when present (it is gitignored), otherwise fall back to
// process env vars (e.g. provided by CI). This keeps CI runs from crashing when
// cypress-env.json does not exist on the runner.
let localEnv = {};
try {
  localEnv = require('./cypress-env.json');
} catch (e) {
  localEnv = {};
}

const BASE_URL = process.env.BASE_URL || localEnv.BASE_URL;
const USER_EMAIL = process.env.USER_EMAIL || localEnv.USER_EMAIL;
const USER_PASSWORD = process.env.USER_PASSWORD || localEnv.USER_PASSWORD;

module.exports = defineConfig({
  experimentalModifyObstructiveThirdPartyCode: true,
  chromeWebSecurity: false,

  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportFilename: '[status]_[datetime]-[name]-report',
    timestamp: 'longDate',
    overwrite: false,
    html: !isCI,
    json: true,
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },

  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
    baseUrl: BASE_URL,
    env: {
      USER_EMAIL,
      USER_PASSWORD,
    },
    pageLoadTimeout: 120000,
    defaultCommandTimeout: 60000,
    requestTimeout: 60000,
    responseTimeout: 60000,
    viewportWidth: 1440,
    viewportHeight: 1000,
    retries: {
      runMode: 0,
      openMode: 0,
    },
  },
});
