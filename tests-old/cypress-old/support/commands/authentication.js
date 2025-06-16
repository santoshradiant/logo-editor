/* global Cypress, cy */

import "tests-old/cypress-old/support/commands/@testing-library/cypress/add-commands";

function getUrl(key) {
  return Cypress.config()["_urls." + key];
}

const preauth = () => {
  return cy.request({
    method: "POST",
    url: `${getUrl("api")}/v1.0/token/preauth`
  });
};

const postRequest = (url, token, body) => {
  return cy.request({
    method: "POST",
    url,
    headers: {
      "User-Agent": "eigi-testing",
      "X-XSRF-TOKEN": token
    },
    body
  });
};

Cypress.Commands.add("loginAuth", () => {
  cy.clearCookies();
  cy.clearLocalStorage();

  Cypress.Cookies.defaults({
    whitelist: ["XSRF-TOKEN", "cp_token"]
  });

  preauth().then(({ status, headers }) => {
    const token = headers["x-xsrf-token"];

    console.log(Cypress.config());

    if (Cypress.config().name === "constantcontact") {
      postRequest(`${getUrl("apilogin")}/v1.0/accounts`, token, Cypress.config().auth);
    } else {
      postRequest(`${getUrl("apilogin")}/v1.0/login`, token, {
        email: Cypress.env("email"),
        password: Cypress.env("password")
      }).then(xhr => {
        expect(xhr.status).to.eq(200);
      });
    }
  });
});
