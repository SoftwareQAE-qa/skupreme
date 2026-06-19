const { BASE_URL } = require('./cypress-env.json');
const { defineConfig } = require('cypress');

const isCI = process.env.CI || process.env.GITLAB_CI;

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
