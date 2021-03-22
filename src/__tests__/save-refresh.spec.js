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

it('should default refresh without autoRefresh option', async () => {
  expect.assertions(5);

  const USER_ID = '42';

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'update `users` set `name` = ?, `age` = ?, `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual(['John', 18, expect.any(Date), USER_ID]);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `users`.`id` = ? limit ?'
      );
      expect(query.bindings).toEqual([USER_ID, 1]);

      query.response([
        {
          id: USER_ID,
          name: 'John',
          age: 18,
          type: 'admin',
        },
      ]);
    }
  });

  const user = User.forge({
    id: USER_ID,
    name: 'John',
  });

  expect((await user.save({ age: 18 })).get('type')).toEqual('admin');
});

it('should refresh with autoRefresh (object format)', async () => {
  const USER_ID = '42';

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'update `users` set `name` = ?, `age` = ?, `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual(['John', 18, expect.any(Date), USER_ID]);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `users`.`id` = ? limit ?'
      );
      expect(query.bindings).toEqual([USER_ID, 1]);

      query.response([
        {
          id: USER_ID,
          name: 'John',
          age: 18,
          type: 'admin',
        },
      ]);
    }
  });

  const user = User.forge({
    id: USER_ID,
    name: 'John',
  });

  expect(
    (await user.save({ age: 18 }, { autoRefresh: true })).get('type')
  ).toEqual('admin');
});

it('should refresh with autoRefresh (key, value)', async () => {
  const USER_ID = '42';

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'update `users` set `name` = ?, `age` = ?, `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual(['John', 18, expect.any(Date), USER_ID]);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `users`.`id` = ? limit ?'
      );
      expect(query.bindings).toEqual([USER_ID, 1]);

      query.response([
        {
          id: USER_ID,
          name: 'John',
          age: 18,
          type: 'admin',
        },
      ]);
    }
  });

  const user = User.forge({
    id: USER_ID,
    name: 'John',
  });

  expect(
    (await user.save('age', 18, { autoRefresh: true })).get('type')
  ).toEqual('admin');
});

it('should refresh with autoRefresh (null as first argument)', async () => {
  const USER_ID = '42';

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'update `users` set `name` = ?, `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual(['John', expect.any(Date), USER_ID]);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `users`.`id` = ? limit ?'
      );
      expect(query.bindings).toEqual([USER_ID, 1]);

      query.response([
        {
          id: USER_ID,
          name: 'John',
          age: 18,
          type: 'admin',
        },
      ]);
    }
  });

  const user = User.forge({
    id: USER_ID,
    name: 'John',
  });

  expect((await user.save(null, { autoRefresh: true })).get('type')).toEqual(
    'admin'
  );
});
