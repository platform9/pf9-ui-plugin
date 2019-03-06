# Platform9 UI

This is the new home for all things Platform9 UI related.


# Getting started
**Initializing the App**

`npm install`

**Starting the Server (previous OpenStack Simulator)**

`npm run server`

**Starting the App**

`npm run start`

For local dev version, use `localhost:3000?dev=true` as the browser URL.


# Key Elements

## Server

The Server (previous OpenStack Simulator) serves as the API endpoint for the entire UI. Its roles are as follows:

- GraphQL API endpoint

- Proxies requests from GraphQL to the OpenStack REST API

- Contains business logic

- Testing simulator mock environment

- Development mock environment

There are some presets that can be used to configure the initial server status.


## Loader

The loader bootstraps the app loading process. It is the very first code to run
and determines which version of the UI to load.

Currently, the UI is loaded from an S3 bucket. Multiple versions of the UI are
stored in different folders and the loader selects which one to use.

It does this using a combination of query parameters, `localStorage`, and
defaults (in that order).

By default it will select the released version (branch mode).

To switch to a specific branch you can use `?branch=[BRANCH]`.

To switch to a specific version you can used `?version=vX.Y`.

To use the latest *edge* version use `?branch=master`. This option will have the
latest passing commit from `master` and is the absolute latest version.

To use the local dev version you will need to append `?dev=true` to the browser
URL. This will switch the bundle-loading source to local dev server.


# Storybook

Storybook is used to create an isolated development environment and showcase the
components. This helps speed up development as we can control the data / props
that are feed into the component.

To see the Storybook just run:

`npm run storybook`


# Running tests

We have several levels of testing: unit tests, integration tests, and end to end
tests (e2e).

Unit tests and integration tests are run through jest.

End to end tests are run through the Selenium web driver.

If on Mac OS X, make sure to install the Selenium web driver for chrome. This can
be done with:

`brew install chromedriver`


## Linting tests

To run them:

`npm run lint`

We currently use `StandardJS` as our linting standard.

CI will run linting after every commit in a PR.


## Unit tests

To run them:

`npm run test:unit`

Unit tests are designed to run very fast.  Anything that can have an external
side effect is mocked out. Jest will run the tests in parallel threads.

During active development a developer should be following a TDD (write tests
first) paradigm and running these in watch mode.

Unit tests should be run after each commit. Ideally, locally before they are
pushed as well.

100% test coverage with unit tests is validated during tests and PRs will be
blocked unless they have 100% coverage.

CI will run unit tests after every commit in a PR.


## Integration tests

To run them:

`npm run test:integration`

Integration tests are designed to test larger swaths of the codebase. They should
catch things that are missed by unit tests alone.

The general line between integration tests and e2e tests are that external APIs
are mocked out so there is no need for an actual server.  The API events are
either mocked out or simulated.

These tests will run in Jest and Enzyme.


## End-To-End tests

Currently we have an issue with tests not running in the correct order. We may
need to switch to Mocha instead of Jest if we can't find a way to force Jest to
run tests in a specific order.

To run them:

1. Set up a test bed server.

2. Configure `config.json` to point to the correct server.
See `config.example.json` for an example.

3. `npm run test:e2e`

End-to-end tests are run against an actual server in an actual browser. We use
Mocha and Selenium for these tests.

A server must be provisioned before each one of these tests.  These tests are
very expensive to run (several hours) and designed to be run occasionally.
1. Set up a test bed server.

2. Configure `config.json` to point to the correct server.
See `config.example.json` for an example.

3. `npm run test:e2e`

End-to-end tests are run against an actual server in an actual browser. We use
Mocha and Selenium for these tests.

A server must be provisioned before each one of these tests. These tests are
very expensive to run (several hours) and designed to be run occasionally.

## Special Flags

To enable the develeper plugin use:

`window.localStorage.setItem('enableDevPlugin', true)`

To enable the left sidebar nav links to point to the development version use:

`window.localStorage.disableClarityLinks = true`

## Docker

As of right now, the Docker image is a UI development demo.  It runs with the
simulator built into the image so no DU is required.

To build, tag, and publish the image:

```
npm run docker:build
npm run docker:tag
npm run docker:push
```

To run the image:

`npm run docker:run`

Alternatively, you can run the UI demo without checking out the Github repo at all:

`docker run -p 3000:3000 -p 4444:4444 platform9/ui-dev`

This will launch the simulator, graphql server, and a simple express HTTP server.

Be sure to specify the dev version in the loader by visiting this url:

`http://localhost:3000/?dev=true`

Use the username: `admin@platform9.com` with the password: `secret` for the login.
