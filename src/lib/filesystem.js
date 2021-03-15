const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const { makeLoggers } = require("@lidio601/logger");

const { BUILD_DIR } = require("./config");

const { log, logi } = makeLoggers("filesystem", false);

/**
 * @typedef TemplateData
 * @property {String} name template name (incl. language)
 * @property {String} body HTML message
 * @property {String} subject subject line
 */

/**
 * @returns {TemplateData[]}
 */
function resolveTemplates() {
  logi("build directory", BUILD_DIR);

  const files = fs.readdirSync(BUILD_DIR, { encoding: "utf-8" });
  log("build files", files);

  const edms = _(files)
    .filter((f) => _.endsWith(f, ".html"))
    .map(_.partial(_.replace, _, ".html", ""))
    .value();
  logi("edms", edms);

  const result = _.map(edms).map((edm) => {
    log("edm", edm);

    const htmlFilename = path.join(BUILD_DIR, `${edm}.html`);
    log("reading", htmlFilename);
    const body = fs.readFileSync(htmlFilename, { encoding: "utf-8" });

    const subjectFilename = path.join(BUILD_DIR, `${edm} Subject.txt`);
    log("reading", subjectFilename);
    const subject = _.trim(
      fs.readFileSync(subjectFilename, { encoding: "utf-8" })
    );
    log("subject", subject);

    return { name: edm, body, subject };
  });

  return result;
}

module.exports = {
  resolveTemplates,
};
