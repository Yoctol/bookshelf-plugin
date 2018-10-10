const _knex = require('knex');
const mockKnex = require('mock-knex');

const knex = _knex({
  client: 'sqlite3',
  connection: ':memory:',
});

mockKnex.mock(knex);

module.exports = knex;
