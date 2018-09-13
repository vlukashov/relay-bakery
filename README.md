
## Available Scripts

In the project directory, you can run:

### `npm run graphcool:up`

Starts a local graphcool server (requires Docker)

### `npm run graphcool`

Re-deploys the schema to the local graphcool server (which needs to be started earlier by `npm run graphcool:up`)


### `npm run relay`

Refreshes the graphql schema from the local graphcool server (saves it into ./schema.graphql). Then pre-compiles the relay queries used in the app. Run this before starting the app.

Before running this command make sure the local graphcool server is up and running the most recent version of the schema (see `npm run graphcool`)

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](#running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!


### This is a 'Create React App' project

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) v1.1.5.

A [Graphcool + Relay quickstart project](https://www.graph.cool/docs/quickstart/frontend/react/relay-sot2faez6a) was copied over into the CRA project structure.