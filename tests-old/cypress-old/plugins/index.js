// ***********************************************************
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const fs = require("tests-old/cypress-old/plugins/fs-extra");
const path = require("path");
const webpack = require("tests-old/cypress-old/plugins/@cypress/webpack-preprocessor");

function getConfigurationByFile(brand, env) {
  const pathToConfigFile = path.resolve(`cypress/config/generated/cypress.${brand}.${env}.json`);
  return fs.readJson(pathToConfigFile);
}

// const getCustomConfiguration = (env) => {
//   const pathToConfigFile = path.resolve(`cypress/config/${env}.json`)
//   return fs.readJson(pathToConfigFile)
// }

const getDefaultConfiguration = () => {
  const pathToConfigFile = path.resolve("cypress/config/config.json");
  return fs.readJson(pathToConfigFile);
};

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

module.exports = async (on, parameters) => {
  // Default config and brand when starting without npm
  const params = parameters.env;
  const env = params.env || "dev"; // local | uat | dev | qa | prod
  const brand = params.brand || "websitebuilder"; // websitebuilder | sitebuilder | gator | sitey | sitelio | endurance | constantcontact
  on("file:preprocessor", webpack());

  let config = {};

  if (env === "local") {
    // local testing
    const configFile = require("../../../src/services/app-email-marketing/config");
    const localEnv = configFile.env;
    const localBrand = configFile.brand;
    const envConfig = await getConfigurationByFile(localBrand, localEnv);
    config = flattenObject(envConfig);
    config.baseUrl = "http://localhost:3210";

    console.log("local configuration", config);
  } else {
    // Published site configuration, using defaultbrand as config
    const envConfig = await getConfigurationByFile(brand, env);
    // const customConfig = await getCustomConfiguration(env)
    // console.log(customConfig)
    // config.brands = customConfig.brands
    config = flattenObject(envConfig);
    config.baseUrl = config["_urls.my"];
    console.log(`${env} config`, config);
  }
  config.brandEnv = env;

  const defaultConfig = await getDefaultConfiguration();
  config = { ...config, ...defaultConfig };

  if (params.tc) {
    config.testFiles = "**/*.?(spec|tcflow).js";
  }

  return config;
};
