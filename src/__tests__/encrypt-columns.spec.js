const crypto = require('crypto');

const mockKnex = require('mock-knex');

const bookshelf = require('./bookshelf');

const tracker = mockKnex.getTracker();

const User = bookshelf.Model.extend({
  tableName: 'users',
  encryptedColumns: ['secret'],
});

let _randomBytes;

beforeEach(() => {
  _randomBytes = jest
    .spyOn(crypto, 'randomBytes')
    .mockImplementation(() => Buffer.from('1111222233334444', 'utf8'));
  tracker.install();
});

afterEach(() => {
  _randomBytes.mockRestore();
  tracker.uninstall();
});

it('should encrypt the column on save', async () => {
  expect.assertions(2);

  tracker.on('query', query => {
    expect(query.sql).toEqual(
      'insert into `users` (`created_at`, `secret`, `updated_at`) values (?, ?, ?)'
    );
    expect(query.bindings).toEqual([
      expect.any(Date),
      '313131313232323233333333343434344fecd9602213e7878bf09650b5054f94',
      expect.any(Date),
    ]);

    query.response([1]);
  });

  await User.forge().save({
    secret: 'shh',
  });
});

it('should encrypt the column on save with different data', async () => {
  expect.assertions(2);

  tracker.on('query', query => {
    expect(query.sql).toEqual(
      'insert into `users` (`created_at`, `secret`, `updated_at`) values (?, ?, ?)'
    );
    expect(query.bindings).toEqual([
      expect.any(Date),
      '31313131323232323333333334343434f3ec3839a286023deeab0392d8bac8e2',
      expect.any(Date),
    ]);

    query.response([1]);
  });

  await User.forge().save({
    secret: 'another data',
  });
});

it('should decrypt the column on fetch', async () => {
  tracker.on('query', query => {
    query.response([
      {
        secret:
          '313131313232323233333333343434344fecd9602213e7878bf09650b5054f94',
      },
    ]);
  });

  const user = await User.forge({
    secret: 'shh',
  }).fetch();

  expect(user.get('secret')).toBe('shh');
});

it('should decrypt the column on fetch with different data', async () => {
  tracker.on('query', query => {
    query.response([
      {
        secret:
          '31313131323232323333333334343434f3ec3839a286023deeab0392d8bac8e2',
      },
    ]);
  });

  const user = await User.forge({
    secret: 'another data',
  }).fetch();

  expect(user.get('secret')).toBe('another data');
});

it('should encrypt the column when creating through a collection', async () => {
  expect.assertions(2);

  tracker.on('query', query => {
    expect(query.sql).toEqual(
      'insert into `users` (`created_at`, `secret`, `updated_at`) values (?, ?, ?)'
    );
    expect(query.bindings).toEqual([
      expect.any(Date),
      '313131313232323233333333343434344fecd9602213e7878bf09650b5054f94',
      expect.any(Date),
    ]);

    query.response([1]);
  });

  const Collection = bookshelf.Collection.extend({
    model: User,
  });
  const collection = Collection.forge();

  await collection.create(
    User.forge({
      secret: 'shh',
    })
  );
});

it('should encrypt the column on update', async () => {
  expect.assertions(4);

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'insert into `users` (`created_at`, `updated_at`) values (?, ?)'
      );
      expect(query.bindings).toEqual([expect.any(Date), expect.any(Date)]);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'update `users` set `updated_at` = ?, `created_at` = ?, `secret` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual([
        expect.any(Date),
        expect.any(Date),
        '313131313232323233333333343434344fecd9602213e7878bf09650b5054f94',
        1,
      ]);

      query.response([1]);
    }
  });

  const user = await User.forge().save();

  await user.save({
    secret: 'shh',
  });
});

it('should encrypt the column on update when patch is true', async () => {
  expect.assertions(4);

  tracker.on('query', (query, step) => {
    if (step === 1) {
      expect(query.sql).toEqual(
        'insert into `users` (`created_at`, `updated_at`) values (?, ?)'
      );
      expect(query.bindings).toEqual([expect.any(Date), expect.any(Date)]);

      query.response([1]);
    }

    if (step === 2) {
      expect(query.sql).toEqual(
        'update `users` set `secret` = ?, `updated_at` = ? where `id` = ?'
      );
      expect(query.bindings).toEqual([
        '313131313232323233333333343434344fecd9602213e7878bf09650b5054f94',
        expect.any(Date),
        1,
      ]);

      query.response([1]);
    }
  });

  const user = await User.forge().save();

  await user.save(
    {
      secret: 'shh',
    },
    {
      patch: true,
    }
  );
});
