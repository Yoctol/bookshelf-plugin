const plugin = require('..');

function setup() {
  const _bookshelf = require('bookshelf');
  const knex = require('./knex');
  const bookshelf = _bookshelf(knex);

  return bookshelf;
}

beforeEach(() => {
  jest.resetModules();
});

it('works well with default value', () => {
  const bookshelf = setup();

  function test() {
    bookshelf.plugin(plugin, {
      encryptColumns: {
        key: '88887777666655554444333322221111', // 256 bits long buffer or string (32 chars long ascii string) for aes-256-cbc
      },
    });

    bookshelf.Model.extend({
      tableName: 'users',
      encryptedColumns: ['secret'],
    });
  }

  expect(test).not.toThrow();
});

it('throw when algorithm invalid', () => {
  const bookshelf = setup();

  function test() {
    bookshelf.plugin(plugin, {
      encryptColumns: {
        algorithm: 'not_a_algorithm',
        key: '88887777666655554444333322221111', // 256 bits long buffer or string (32 chars long ascii string) for aes-256-cbc
      },
    });

    bookshelf.Model.extend({
      tableName: 'users',
      encryptedColumns: ['secret'],
    });
  }

  expect(test).toThrow();
});

it('throw when ivLength invalid', () => {
  const bookshelf = setup();

  function test() {
    bookshelf.plugin(plugin, {
      encryptColumns: {
        ivLength: 4,
        key: '88887777666655554444333322221111', // 256 bits long buffer or string (32 chars long ascii string) for aes-256-cbc
      },
    });

    bookshelf.Model.extend({
      tableName: 'users',
      encryptedColumns: ['secret'],
    });
  }

  expect(test).toThrow();
});

it('throw when key invalid', () => {
  const bookshelf = setup();

  function test() {
    bookshelf.plugin(plugin, {
      encryptColumns: {
        key: 'invalid',
      },
    });

    bookshelf.Model.extend({
      tableName: 'users',
      encryptedColumns: ['secret'],
    });
  }

  expect(test).toThrow();
});

it('throw when algorithm and ivLength not match', () => {
  const bookshelf = setup();

  function test() {
    bookshelf.plugin(plugin, {
      encryptColumns: {
        ivLength: 15,
        algorithm: 'aes-256-cbc',
        key: '88887777666655554444333322221111', // 256 bits long buffer or string (32 chars long ascii string) for aes-256-cbc
      },
    });

    bookshelf.Model.extend({
      tableName: 'users',
      encryptedColumns: ['secret'],
    });
  }

  expect(test).toThrow();
});
