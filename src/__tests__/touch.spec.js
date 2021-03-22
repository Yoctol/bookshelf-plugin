const mockKnex = require('mock-knex');

const bookshelf = require('./bookshelf');

const tracker = mockKnex.getTracker();

const User = bookshelf.Model.extend({
  tableName: 'users',
});

const Project = bookshelf.Model.extend({
  tableName: 'projects',
  touches: ['user'],

  user() {
    return this.belongsTo(User);
  },
});

beforeEach(() => {
  tracker.install();
});

afterEach(() => {
  tracker.uninstall();
});

it('should update updated_at', async () => {
  expect.assertions(4);

  const USER_ID = '42';

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'update `users` set `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual([expect.any(Date), USER_ID]);

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
    age: 18,
    type: 'admin',
  });

  await user.touch();
});

it('should update touches relations', async () => {
  expect.assertions(10);

  const USER_ID = '42';
  const PROJECT_ID = '56';

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'update `projects` set `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual([expect.any(Date), PROJECT_ID]);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select `projects`.* from `projects` where `projects`.`id` = ? limit ?'
      );
      expect(query.bindings).toEqual([PROJECT_ID, 1]);

      query.response([
        {
          id: PROJECT_ID,
        },
      ]);
    }

    if (step === 3) {
      expect(query.sql).toEqual(
        'select distinct `users`.* from `users` where `users`.`id` in (?)'
      );
      expect(query.bindings).toEqual([USER_ID]);

      query.response([
        {
          id: USER_ID,
          name: 'John',
          type: 'admin',
          age: 18,
        },
      ]);
    }

    if (step === 4) {
      expect(query.sql).toEqual(
        'update `users` set `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual([expect.any(Date), USER_ID]);

      query.response([1]);
    }

    if (step === 5) {
      expect(query.sql).toEqual(
        'select distinct `users`.* from `users` where `users`.`id` = ? and `users`.`id` = ? limit ?'
      );
      expect(query.bindings).toEqual([USER_ID, USER_ID, 1]);

      query.response([
        {
          id: USER_ID,
          name: 'John',
          type: 'admin',
          age: 18,
        },
      ]);
    }
  });

  const project = Project.forge({
    id: PROJECT_ID,
    name: 'First Project',
    userId: USER_ID,
  });

  await project.touch();
});
