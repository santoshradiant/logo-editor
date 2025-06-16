import { run, getUrl } from "../app-white-label-email.config";
import login from "tests-old/cypress-old/integration/authentication/@eig-builder/core-e2e/page-objects/authentication/login";

const TEST_CASE = "WLE Login";
const TEST_NAME = "Login";

run(TEST_CASE, TEST_NAME, () => {
  before(() => {});

  beforeEach(() => {
    login.open();
  });

  it("should login", () => {
    cy.server();
    cy.route("POST", `${getUrl("apilogin")}/v1.0/login`).as("postLogin");

    login
      .fillEmail("willem.dejong@endurance.com")
      .fillPassword("appmachine")
      .submit();

    cy.wait("@postLogin").then(xhr => {
      expect(xhr.status).to.eq(200);
    });

    cy.url().should("include", `${getUrl("my")}`);
  });
});
