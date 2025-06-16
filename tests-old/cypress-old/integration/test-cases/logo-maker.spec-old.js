/* global cy, before, Cypress */
import { run, testAccountWithCampaigns, getUrl } from "../app-white-label-email.config";
import login from "tests-old/cypress-old/integration/test-cases/@eig-builder/core-e2e/page-objects/authentication/login";

// const getURl = url => Cypress.env(Cypress.env('config_env'))[url]

const TEST_CASE = "WLE SETTINGS";
const TEST_NAME = "Edit email marketing settings";

run(TEST_CASE, TEST_NAME, () => {
  before(() => {
    const url = `${getUrl("apilogin")}/v1.0/login`;

    Cypress.Cookies.debug(true);
    Cypress.Cookies.defaults({
      whitelist: ["CSRF-TOKEN", "cp_token"]
    });

    // login.visitAndLoginSuccessful(testAccountWithCampaigns.email, testAccountWithCampaigns.password, url)

    // cy.route('GET', `${getUrl('api')}/v1.0/account/status`).as('getAccountStatus')

    cy.visit("/home");

    // cy.wait('@getAccountStatus').then(xhr => {
    //   expect(xhr.status).to.eq(200)
    // })
  });

  it("Should create a new logo", () => {
    cy.visit("/logo-onboarding/onboarding/1");
    cy.wait(1000);

    cy.url()
      .should("include", "logo-onboarding/onboarding/1")
      .get('[data-test-id="brand-name-button"]')
      .type("Bob's Burgers")
      .get('[data-test-id="slogan-button"]')
      .type("Good stuff")
      .wait(1000)
      .get(".logo-preview")
      .first()
      .debug()
      .children(".amreset")
      .first()
      // .debug()
      // .wait(1000)
      // .children('svg')
      // .debug()
      // .should('have.length', 1)
      .get(".logo-preview")
      .first()
      .click()
      .get('[data-element-id="auth-form-sign-up-button"]');
  });

  it("Should create a new logo", () => {
    cy.visit("/logo/my");
    cy.wait(1000);

    cy.url()
      .should("include", "/logo/my")
      .url()
      .should("include", "logo/onboarding/1")
      .get('[data-test-id="brand-name-button"]')
      .type("Bob's Burgers")
      .get('[data-test-id="slogan-button"]')
      .type("Good stuff")
      // .get('.logo-preview').first().children('.amreset').first().children('svg').should('have.length', 1)
      .get(".logo-preview")
      .first()
      .click()
      .wait(1000)
      .url()
      .should("include", "logo/editor")
      .get(".logo-editor-preview")
      .should("have.length", 1);
  });

  it("Should load a preview page", () => {
    cy.visit("/logo/my");
    cy.wait(1000);

    cy.url()
      .should("include", "/logo/my")
      .get(".my-logo-preview")
      .should("have.length", 1)
      .get('[data-test-id="logo-action-card"]')
      .last()
      .invoke("show")
      .get('[data-element-id="logomaker-my-logos-preview-button"]')
      .last()
      .click()
      .url()
      .should("include", "logo/editor")
      .should("include", "/preview")
      .get('[data-element-label="logo-preview-inspiration"]')
      .should("have.length.of.at.least", 12)
      // .get('.amreset > svg').should('have.length.of.at.least', 1)
      .get('[data-element-label="navigation-logomaker-back"]')
      .click();
  });

  it("Should load the editor corrrectly", () => {
    cy.visit("/logo/my");
    cy.wait(1000);

    cy.url()
      .should("include", "/logo/my")
      .get(".my-logo-preview")
      .should("have.length", 1)
      .first()
      .parent()
      .click()
      .url()
      .should("include", "logo/editor")
      .should("include", "/name")
      .get(".variationsBox")
      .should("have.length.of.at.least", 4)

      .get(".logomaker-editor-logo-save-button > p > span")
      .should("have.text", "Saved")

      .get('[value="Bob\'s Burgers"]')
      .type(" and pizza's")

      .get(".logomaker-editor-logo-save-button > p > span")
      .should("have.text", "Save")

      .click()

      .should("have.text", "Saved")

      // control tabs switching
      .get("#slogan")
      .click()
      .url()
      .should("include", "/slogan")
      .get(".variationsBox")
      .should("have.length.of.at.least", 4)

      .get("#symbol")
      .click()
      .url()
      .should("include", "/symbol")
      // .get('.variationsBox').should('have.length.of.at.least', 4)

      .get("#color")
      .click()
      .url()
      .should("include", "/color")
      .get(".variationsBox")
      .should("have.length.of.at.least", 4)

      .get("#backgrounds")
      .click()
      .url()
      .should("include", "/backgrounds")
      .get(".variationsBox")
      .should("have.length.of.at.least", 4)

      .get('[data-element-label="navigation-logomaker-back"]')
      .click();
  });

  it("Should delete the last logo", () => {
    cy.visit("/logo/my");
    cy.wait(1000);
    cy.url()
      .should("include", "/logo/my")
      .get(".my-logo-preview")
      .should("have.length", 1)
      .get('[data-test-id="logo-action-card"]')
      .last()
      .invoke("show")
      .get('[data-element-id="logomaker-my-logos-delete-button"]')
      .last()
      .click()
      .get('button[tag="yes"]')
      .click()
      .url()
      .should("include", "logo/onboarding");
  });
});
