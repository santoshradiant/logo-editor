const getConfigurationByFile = (brand, env) => {
  return cy.readFile(`cypress/config/generated/cypress.${brand}.${env}.json`);
};

// const getCustomConfiguration = (env) => {
//   return cy.readFile(`cypress/config/${env}.json`)
// }

function flattenObject(obj) {
  const result = {};
  let flatObject;

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    if (typeof obj[key] === "object") {
      flatObject = flattenObject(obj[key]);
      for (const childKey in flatObject) {
        if (!flatObject.hasOwnProperty(childKey)) {
          continue;
        }

        result[key + (isNaN(childKey) ? "." + childKey : "")] = flatObject[childKey];
      }
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}

Cypress.Commands.add("setConfig", (brandName, env) => {
  // const config = Cypress.config()

  Cypress.config("brandName", brandName);

  const isLocal = env === "local";
  if (isLocal) {
    env = "uat";
  }
  getConfigurationByFile(brandName, env).then(data => {
    const brandConfig = flattenObject(data);
    for (const prop in brandConfig) {
      Cypress.config(prop, brandConfig[prop]);
    }
    // console.log('brandConfig', brandConfig)
    if (isLocal) {
      Cypress.config("baseUrl", "http://localhost:3210");
    } else {
      Cypress.config("baseUrl", brandConfig["_urls.my"]);
    }
  });
});
