const bookshelf = require('./bookshelf');

const User = bookshelf.Model.extend({
  tableName: 'users',

  attrs: ['name', 'type', 'age'],
});

it('should support directly access value by declared keys', () => {
  const user = User.forge({
    name: 'John',
    type: 'admin',
    age: 18,
  });

  expect(user.name).toEqual('John');
  expect(user.type).toEqual('admin');
  expect(user.age).toEqual(18);
});
