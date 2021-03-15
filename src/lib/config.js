const _ = require("lodash");
const fs = require("fs");
const path = require("path");

require('dotenv').config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

const BUILD_DIR = _([
  process.env.BUILD_DIR,
  _.get(process.argv, 2),
])
  .compact()
  .filter(fs.existsSync)
  .map((f) => path.resolve(f))
  .first();

const TEMPLATE_DATA_PATH = _.get(process.argv, 3);

if (!SENDGRID_API_KEY || SENDGRID_API_KEY == "") {
  throw new Error("'SENDGRID_API_KEY' environment variable missing");
}

if (!fs.existsSync(BUILD_DIR)) {
  throw new Error(`'BUILD_DIR' ${BUILD_DIR} is not a valid directory. Please run npm start <BUILD_DIR>`);
}

if (!_.isEmpty(TEMPLATE_DATA_PATH) && !fs.existsSync(TEMPLATE_DATA_PATH)) {
  throw new Error(`'TEMPLATE_DATA_PATH' ${TEMPLATE_DATA_PATH} is not a valid file. Please run npm start <BUILD_DIR> <TEMPLATE_DATA_PATH>`);
}

/**
 * Each transactional template can have multiple versions, each version with its own
 * subject and content. Each user can have up to 300 versions across across all templates.
 * @see https://sendgrid.com/docs/api-reference/
 */
const MAX_VERSION_PER_TEMPLATE = _.clamp(
  _.parseInt(_.defaultTo(process.env.MAX_VERSION_PER_TEMPLATE, 10)),
  1,
  300
);

/**
 * obtained through
 * > make scan-build
 */
const TEMPLATE_TEST_DATA = TEMPLATE_DATA_PATH ? require(path.resolve(TEMPLATE_DATA_PATH)) : {};

module.exports = {
  SENDGRID_API_KEY,
  BUILD_DIR,
  MAX_VERSION_PER_TEMPLATE,
  TEMPLATE_TEST_DATA,
};
