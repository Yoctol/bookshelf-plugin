const _bookshelf = require('bookshelf');

const knex = require('./knex');

const plugin = require('..');

const bookshelf = _bookshelf(knex);

bookshelf.plugin(plugin, {
  encryptColumns: {
    key: '88887777666655554444333322221111', // 256 bits long buffer or string (32 chars long ascii string) for aes-256-cbc
  },
});

module.exports = bookshelf;
