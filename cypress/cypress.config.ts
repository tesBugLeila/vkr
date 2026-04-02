const { defineConfig } = require("cypress");
require('dotenv').config();

module.exports = defineConfig({
  allowCypressEnv: false,
  viewportWidth: 1100,
  viewportHeight: 700,
  e2e: {
    baseUrl: process.env.BASE_URL ?? process.env.CYPRESS_BASE_URL,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    setupNodeEvents(on, config) {
      return config;
    },
  },
});