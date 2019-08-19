const mockKnex = require('mock-knex');

const bookshelf = require('./bookshelf');

const tracker = mockKnex.getTracker();

const User = bookshelf.Model.extend({
  tableName: 'users',

  softDelete: true,
});

const Project = bookshelf.Model.extend({
  tableName: 'projects',
});

const CascadeDeleteUser = bookshelf.Model.extend({
  tableName: 'users',

  softDelete: true,
  dependents: ['projects'],

  projects() {
    return this.hasMany(Project);
  },
});

beforeEach(() => {
  tracker.install();
});

afterEach(() => {
  tracker.uninstall();
});

it('should update deleted_at', async () => {
  expect.assertions(4);

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual('BEGIN;');

      query.response([]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'update `users` set `deleted_at` = ? where `id` = ? and `users`.`deleted_at` is null'
      );
      expect(query.bindings).toEqual([expect.any(Date), '1']);

      query.response([1]);
    }

    if (step === 3) {
      expect(query.sql).toEqual('COMMIT;');

      query.response([]);
    }
  });

  const user = User.forge({
    id: '1',
    name: 'John',
    type: 'admin',
    age: 18,
  });

  await user.destroy();
});

it('should cascade delete', async () => {
  expect.assertions(6);

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual('BEGIN;');

      query.response([]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select `projects`.* from `projects` where `projects`.`user_id` in (?)'
      );
      expect(query.bindings).toEqual(['1']);

      query.response([]);
    }

    if (step === 3) {
      expect(query.sql).toEqual(
        'update `users` set `deleted_at` = ? where `id` = ? and `users`.`deleted_at` is null'
      );
      expect(query.bindings).toEqual([expect.any(Date), '1']);

      query.response([1]);
    }

    if (step === 4) {
      expect(query.sql).toEqual('COMMIT;');

      query.response([]);
    }
  });

  const user = CascadeDeleteUser.forge({
    id: '1',
    name: 'John',
    type: 'admin',
    age: 18,
  });

  await user.destroy();
});
