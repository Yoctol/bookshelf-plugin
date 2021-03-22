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
  expect.assertions(8);

  const USER_ID = '42';
  const PROJECT_ID = '56';

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual('BEGIN;');

      query.response([]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select distinct `projects`.* from `projects` where `projects`.`user_id` in (?)'
      );
      expect(query.bindings).toEqual([USER_ID]);

      query.response([
        {
          id: PROJECT_ID,
          user_id: USER_ID,
        },
      ]);
    }

    if (step === 3) {
      expect(query.sql).toEqual('delete from `projects` where `id` = ?');
      expect(query.bindings).toEqual([PROJECT_ID]);

      query.response([1]);
    }

    if (step === 4) {
      expect(query.sql).toEqual(
        'update `users` set `deleted_at` = ? where `id` = ? and `users`.`deleted_at` is null'
      );
      expect(query.bindings).toEqual([expect.any(Date), USER_ID]);

      query.response([1]);
    }

    if (step === 5) {
      expect(query.sql).toEqual('COMMIT;');

      query.response([]);
    }
  });

  const user = CascadeDeleteUser.forge({
    id: USER_ID,
    name: 'John',
    type: 'admin',
    age: 18,
  });

  await user.destroy();
});
