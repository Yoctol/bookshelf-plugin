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

it('should not refresh without withRefresh', async () => {
  tracker.on('query', query => {
    query.response([1]);
  });

  const user = User.forge({
    id: '1',
    name: 'John',
  });

  expect((await user.save({ age: 18 })).get('type')).toBeUndefined();
});

it('should refresh with withRefresh (object format)', async () => {
  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'update `users` set `name` = ?, `age` = ?, `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual(['John', 18, expect.any(Date), '1']);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `users`.`id` = ? limit ?'
      );
      expect(query.bindings).toEqual(['1', 1]);

      query.response([
        {
          id: '1',
          name: 'John',
          age: 18,
          type: 'admin',
        },
      ]);
    }
  });

  const user = User.forge({
    id: '1',
    name: 'John',
  });

  expect(
    (await user.save({ age: 18 }, { withRefresh: true })).get('type')
  ).toEqual('admin');
});

it('should refresh with withRefresh (key, value)', async () => {
  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'update `users` set `name` = ?, `age` = ?, `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual(['John', 18, expect.any(Date), '1']);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `users`.`id` = ? limit ?'
      );
      expect(query.bindings).toEqual(['1', 1]);

      query.response([
        {
          id: '1',
          name: 'John',
          age: 18,
          type: 'admin',
        },
      ]);
    }
  });

  const user = User.forge({
    id: '1',
    name: 'John',
  });

  expect(
    (await user.save('age', 18, { withRefresh: true })).get('type')
  ).toEqual('admin');
});

it('should refresh with withRefresh (null as first argument)', async () => {
  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'update `users` set `name` = ?, `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual(['John', expect.any(Date), '1']);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `users`.`id` = ? limit ?'
      );
      expect(query.bindings).toEqual(['1', 1]);

      query.response([
        {
          id: '1',
          name: 'John',
          age: 18,
          type: 'admin',
        },
      ]);
    }
  });

  const user = User.forge({
    id: '1',
    name: 'John',
  });

  expect((await user.save(null, { withRefresh: true })).get('type')).toEqual(
    'admin'
  );
});
