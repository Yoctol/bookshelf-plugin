const _bookshelf = require('bookshelf');

const plugin = require('..');

const knex = require('./knex');

const bookshelf = _bookshelf(knex);

bookshelf.plugin(plugin);

module.exports = bookshelf;
