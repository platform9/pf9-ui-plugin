# Platform9 UI

This is the new home for all things Platform9 UI related.


# Getting started

**Dependencies**

- Node v8+ (12 recommendended)
- yarn should be installed
- A provisioned DU if you don't want to use the simulator.


**Initializing the App**

`yarn`

**Create a custom config**

`cp config.example.js config.js`

edit the username / password to be whatever you'd like (usually your pf9 email)

`config.js` is already specified in the .gitignore.


**Targeting a remote DU**

To have the API calls go to a remote DU you can edit the `apiHost` property in `config.js`.

Unless you override the `NODE_ENV` environment variable it will look under the `development` section of `config.js`.


**Starting the Simulator Server

`yarn server`

The simulator will create an admin user as specified in your `config.js`

**Hosting the App**

`yarn dev`

Load the UI in your browser at `localhost:3000?dev=true` as the browser URL.


# Key Elements

## Simulator Server

The Simulator Server implements all API endpoints used in the app.
It serves multiple functions.

- Provides a mock environment used during testing

- Provides a mock environment used during development

- Allows rapid "provisioning" of different backend configurations using `presets`.

- Provides a quick way to change backend state that would be too costly otherwise.


# Storybook

Storybook is used to create an isolated development environment and showcase the
components. This helps speed up development as we can control the data / props
that are feed into the component.

To see the Storybook just run:

`yarn storybook`


# Running tests

We have several levels of testing: unit tests and integration tests.
e2e tests are planned for later.

Unit tests are run through jest.

Integration tests are run through Cypress.

End to end tests are not yet implemented.


## Linting tests

To run them:

`yarn lint`

We currently use `StandardJS` as our linting standard.

CI will run linting after every commit in a PR.


## Unit tests

To run them:

`yarn test:unit`

Unit tests are designed to run very fast.  Anything that can have an external
side effect is mocked out. Jest will run the tests in parallel threads.

During active development a developer should be following a TDD (write tests
first) paradigm and running these in watch mode.

Unit tests should be run after each commit. Ideally, locally before they are
pushed as well.

CI will run unit tests after every commit in a PR.


## Integration tests

To run them:

`yarn test:integration`

Integration tests are designed to test larger swaths of the codebase. They should
catch things that are missed by unit tests alone.

The general line between integration tests and e2e tests are that external APIs
are mocked out so there is no need for an actual server.  The API events are
either mocked out or simulated.

These tests are run through Cypress.


## End-To-End tests

Not yet implemented.  These tests will target a real backend and must be run in
a more sequential manner.


## Special Flags

To enable the develeper plugin, open the browser JavaScript console and run:

`window.localStorage.setItem('enableDevPlugin', true)`

To enable the left sidebar nav links to point to the development version use:

`window.localStorage.disableClarityLinks = true`
