const mockKnex = require('mock-knex');

const bookshelf = require('./bookshelf');

const tracker = mockKnex.getTracker();

const User = bookshelf.Model.extend({
  tableName: 'users',
});

beforeEach(() => {
  tracker.install();
});

afterEach(() => {
  tracker.uninstall();
});

it('should use camel case timestamps', () => {
  const user = User.forge({
    name: 'John',
    type: 'admin',
    age: 18,
  });

  const [createdAtKey, updatedAtKey] = user.getTimestampKeys();

  expect(createdAtKey).toEqual('createdAt');
  expect(updatedAtKey).toEqual('updatedAt');
});

describe('#where', () => {
  it('should format string key', async () => {
    expect.assertions(2);

    tracker.on('query', (query) => {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `first_name` = ?'
      );
      expect(query.bindings).toEqual(['John']);

      query.response([]);
    });

    await User.where('firstName', 'John').fetchAll();
  });

  it('should format object keys', async () => {
    expect.assertions(2);

    tracker.on('query', (query) => {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `first_name` = ?'
      );
      expect(query.bindings).toEqual(['John']);

      query.response([]);
    });

    await User.where({ firstName: 'John' }).fetchAll();
  });
});

describe('#findAll', () => {
  it('should format object keys', async () => {
    expect.assertions(2);

    tracker.on('query', (query) => {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `first_name` = ?'
      );
      expect(query.bindings).toEqual(['John']);

      query.response([]);
    });

    await User.findAll({ firstName: 'John' });
  });
});
