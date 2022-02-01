const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const { makeLoggers } = require("@lidio601/logger");

const { getTemplateMap, resolveTemplateId, rotateTemplateVersions, createTemplateVersion } = require("./lib/sendgrid");
const { resolveTemplates } = require("./lib/filesystem");

const { log } = makeLoggers("html2sendgrid");

/**
 * @typedef TemplateData
 * @property {String} name template name (incl. language)
 * @property {String} body HTML message
 * @property {String} subject subject line
 */

const processTemplate = (templateMap) => async ({ name, body, subject }) => {
  log("processing", name);

  const templateId = await resolveTemplateId(templateMap, name);

  await rotateTemplateVersions(templateId);

  const versionId = await createTemplateVersion(templateId, name, body, subject);

  log("active versionId", {templateId, versionId});
};

/**
 * Main entrypoint
 */
async function run() {
  /**
   * Read the template list from the template dir
   * @type {TemplateData[]}
   */
  const templateData = resolveTemplates();

  /**
   * Map a template name with the template id
   */
  const templateMap = await getTemplateMap();

  await _.map(templateData, processTemplate(templateMap));
}

module.exports = run;
