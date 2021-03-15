/**
 * @see https://sendgrid.com/docs/api-reference/
 */

const _ = require("lodash");
const client = require("@sendgrid/client");
const { makeLoggers } = require("@lidio601/logger");

const {
  SENDGRID_API_KEY,
  MAX_VERSION_PER_TEMPLATE,
  TEMPLATE_TEST_DATA,
} = require("./config");

const { log, logi } = makeLoggers("sendgrid", false);

/**
 * setup the Sendgrid api client
 */
client.setApiKey(SENDGRID_API_KEY);

/**
 * List all the existing templates
 * @returns
 */
const getTemplates = async () => {
  const request = {
    method: "GET",
    url: `/v3/templates`,
    qs: {
      generations: "legacy,dynamic",
    },
  };
  log("Sendgrid api request", request);

  const [response, body] = await client.request(request);
  logi("Sendgrid api response", { statusCode: response.statusCode });
  log("Sendgrid api response body", body);

  const TEMPLATES = body.templates;
  logi("templates loaded", _.size(TEMPLATES));

  return TEMPLATES;
};

/**
 * Create a template
 * @param {*} templateName
 * @returns {String} templateId
 */
const createTemplate = async (templateName) => {
  const request = {
    method: "POST",
    url: `/v3/templates`,
    body: {
      name: templateName,
      generation: "dynamic",
    },
  };
  log("Sendgrid api request", request);

  const [response, body] = await client.request(request);
  log("Sendgrid api response", { statusCode: response.statusCode, body });

  return body.id;
};

/**
 * Get the versions of a template
 * @param {*} templateId
 * @returns
 */
const getTemplateVersions = async (templateId) => {
  const request = {
    method: "GET",
    url: `/v3/templates/${templateId}`,
  };
  log("Sendgrid api request", request);

  const [response, body] = await client.request(request);
  log("Sendgrid api response", { statusCode: response.statusCode });
  log("Sendgrid api response body", body);

  const versions = body.versions;
  logi("Sendgrid versions loaded", _.size(versions));

  return versions;
};

/**
 * Delete a version of a template
 * @param {*} templateId
 * @param {*} versionId
 * @returns
 */
const deleteTemplateVersion = async (templateId, versionId) => {
  const request = {
    method: "DELETE",
    url: `/v3/templates/${templateId}/versions/${versionId}`,
  };
  log("Sendgrid api request", request);

  const [response, body] = await client.request(request);
  log("Sendgrid api response", { statusCode: response.statusCode });
  log("Sendgrid api response body", body);

  return response.statusCode === 204;
};

/**
 * Create a template version
 * @param {*} templateId
 * @param {*} htmlContent
 */

const createTemplateVersion = async (
  templateId,
  templateName,
  htmlContent,
  subject
) => {
  const request = {
    method: "POST",
    url: `/v3/templates/${templateId}/versions`,
    body: {
      active: 1,
      name: `${templateName} ${new Date().toISOString()} DO_NOT_EDIT`,
      subject,
      html_content: htmlContent,
      generate_plain_content: true,
      editor: "code",
      test_data: JSON.stringify(TEMPLATE_TEST_DATA),
    },
  };
  log("Sendgrid api request", request);

  const [response, body] = await client.request(request);
  log("Sendgrid api response", { statusCode: response.statusCode });
  log("Sendgrid api response body", body);

  return body.id;
};

const getTemplateMap = async () => {
  const templates = await getTemplates();
  log("templates", templates);

  const result = _(templates)
    .map((t) => [t.name, t.id])
    .fromPairs()
    .value();
  logi("template map", result);

  return result;
};

const resolveTemplateId = async (templateMap, templateName) => {
  const SHOULD_CREATE_TEMPLATE = !_.has(templateMap, templateName);
  log("should create a new template for", {
    templateName,
    SHOULD_CREATE_TEMPLATE,
  });

  if (!SHOULD_CREATE_TEMPLATE) {
    const templateId = _.get(templateMap, templateName);
    log("existing template id", templateId);

    return templateId;
  }

  logi("creating a new template with name", templateName);

  const templateId = await createTemplate(templateName);
  log("new template id", templateId);

  return templateId;
};

const rotateTemplateVersions = async (templateId) => {
  /**
   * List all the existing version of a template
   */
  const versions = await getTemplateVersions(templateId);
  logi("versions for template", _.size(versions), templateId);

  /**
   * we need to rotate the version to maintain
   * at most 10 version for each template
   */
  const TRAILING_VERSION = _(versions)
    .sortBy("-name")
    .slice(MAX_VERSION_PER_TEMPLATE - 1)
    .value();
  logi("versions to delete", _.size(TRAILING_VERSION), templateId);
  log("TRAILING_VERSION", _.map(TRAILING_VERSION, "name"));

  /**
   * delete the trailing version
   */
  await _.map(TRAILING_VERSION, (version) =>
    deleteTemplateVersion(templateId, version.id)
  );
};

module.exports = {
  getTemplateMap,
  resolveTemplateId,
  rotateTemplateVersions,
  createTemplateVersion,
};
