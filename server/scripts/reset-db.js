const fs = require('fs-extra');
const path = require('path');
const {
  exec
} = require('promisify-child-process');

module.exports = async function resetDB() {
  const schemaFile = '../types.graphql';
  console.log("Dropping and re-creating the database");
  console.log("... dropping");
  await fs.move(
    path.join(__dirname, schemaFile),
    path.join(__dirname, schemaFile + '.back'));
  await fs.outputFile(
    path.join(__dirname, schemaFile),
    'type ResetDB @model { id: ID! @isUnique }');
  await exec('npx graphcool deploy --force');

  console.log("... re-creating");
  await fs.move(
    path.join(__dirname, schemaFile + '.back'),
    path.join(__dirname, schemaFile), {
      overwrite: true
    });
  await exec('npx graphcool deploy --force');
};