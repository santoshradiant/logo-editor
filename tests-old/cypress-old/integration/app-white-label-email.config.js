/// <reference types="Cypress" />

export const viewPort = {
  desktop: "macbook-15",
  mobile: "iphone-6",
  tablet: "ipad-2"
};

export const testAccountWithoutCampaigns = {
  email: "testaccount@appmachine.com",
  password: "appmachine"
};

export const testAccountWithCampaigns = {
  email: "testaccount+campaigns@appmachine.com",
  password: "appmachine"
};

export const rootUrl = Cypress.env("app_designer_hostname");
export const brand = Cypress.env("_brand") || "websitebuilder";
export const brands = ["websitebuilder"]; // 'sitelio', 'gator', 'constantcontact' 'websitebuilder', 'sitey'
export const env = Cypress.env("_env") || "local";
export const envs = ["dev"]; // 'sitelio', 'gator', 'constantcontact' 'websitebuilder', 'sitey'
export const viewPorts = ["desktop"]; // 'desktop', 'tablet', 'mobile'

const capitalize = s => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export function getUrl(key) {
  return Cypress.config()["_urls." + key];
}

export function run(tc, title, callback) {
  envs.forEach(env => {
    brands.forEach(brand => {
      viewPorts.forEach(vp => {
        describe(`${tc} - ${env.toUpperCase()} - ${capitalize(brand)} - ${title} - ${capitalize(vp)}`, () => {
          before(function() {
            cy.setConfig(brand, env);
            cy.viewport(viewPort[vp]).wait(10); // wait for resize
            cy.log("viewport root");

            Cypress.Cookies.defaults({
              whitelist: ["XSRF-TOKEN", "cp_token"]
            });
          });

          const props = { env, brand, vp };
          callback(props);
        });
      });
    });
  });
}
