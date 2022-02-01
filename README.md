# HTML2Sendgrid

[![NPM](https://nodei.co/npm/htmltosendgrid.png)](https://npmjs.org/package/htmltosendgrid)

A CLI command to publish HTML files as Dynamic Templates on Sendgrid.

## WTF

In order to automatically publish some HTML templates to SendGrid you can use this script to:

- scan for existing templates
- match any existing template by name
- create a new template if missing
- rotate template versions (as they are limited to 300 per account)
- create a new version and set it active

You just need to specify the sendgrid api key as an environment variable named **SENDGRID_API_KEY** then run the script as per instruction here below.

## Usage

```
export SENDGRID_API_KEY=YOUR_API_KEY
npm start <HTML_DIR>
```

if you want to upload also some test variables

```
export SENDGRID_API_KEY=YOUR_API_KEY
npm start <HTML_DIR> <VARIABLES.JSON>
```

## Max version per template

```
export MAX_VERSION_PER_TEMPLATE=5
```

If you set this variable the module will automatically rotate the versions of the template by keeping the last N versions.

This is useful because Sendgrid has a limit of 300 versions per account.

If you have multiple template within the same account you might want to limit how many versions of a template you want to keep in order to not hit this limit.
