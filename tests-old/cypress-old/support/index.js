// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands/authentication";
import "./commands/set-config";
import addContext from "tests-old/cypress-old/support/mochawesome/addContext";

import chaiString from "tests-old/cypress-old/support/chai-string";

chai.use(chaiString);

Cypress.on("window:before:load", win => {
  win.fetch = null;
});

Cypress.on("test:after:run", (test, runnable) => {
  addContext({ test }, `assets/${Cypress.spec.name}.mp4`);
  if (test.state === "failed") {
    const screenshotFileName = `${runnable.parent.title} -- ${test.title} (failed).png`;
    addContext({ test }, `assets/${Cypress.spec.name}/${screenshotFileName}`);
  }
});

Cypress.Commands.add("getByDataElement", id => {
  return cy.get(`[data-element-id="${id}"]`);
});
