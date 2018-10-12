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
  expect.assertions(2);

  tracker.on('query', query => {
    expect(query.sql).toEqual(
      'update `users` set `updated_at` = ? where `id` = ?'
    );
    expect(query.bindings).toEqual([expect.any(Date), '1']);

    query.response([1]);
  });

  const user = User.forge({
    id: '1',
    name: 'John',
    type: 'admin',
    age: 18,
  });

  await user.touch();
});

it('should update touches relations', async () => {
  expect.assertions(6);

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'update `projects` set `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual([expect.any(Date), '1']);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `users`.`id` in (?)'
      );
      expect(query.bindings).toEqual(['1']);

      query.response([
        {
          id: '1',
          name: 'John',
          type: 'admin',
          age: 18,
        },
      ]);
    }

    if (step === 3) {
      expect(query.sql).toEqual(
        'update `users` set `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual([expect.any(Date), '1']);

      query.response([1]);
    }
  });

  const project = Project.forge({
    id: '1',
    name: 'First Project',
    userId: '1',
  });

  await project.touch();
});

it('should update touches relations after destroyed event', async () => {
  expect.assertions(6);

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual('delete from `projects` where `id` = ?');
      expect(query.bindings).toEqual(['1']);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'select `users`.* from `users` where `users`.`id` in (?)'
      );
      expect(query.bindings).toEqual(['1']);

      query.response([
        {
          id: '1',
          name: 'John',
          type: 'admin',
          age: 18,
        },
      ]);
    }

    if (step === 3) {
      expect(query.sql).toEqual(
        'update `users` set `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual([expect.any(Date), '1']);

      query.response([1]);
    }
  });

  await Project.forge({ id: '1' }).destroy();
});
