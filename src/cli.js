#!/usr/bin/env node

const html2sendgrid = require("./index");

html2sendgrid().catch((err) => {
  if (err.code) {
    console.log("Sendgrid API error");
    console.log('HTTP', err.code, err.message);
    console.log(JSON.stringify(err.response.body, null, 2));
  } else {
    console.error(err);
  }
});
