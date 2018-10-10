# bookshelf-plugin

## Install

```sh
npm install @yoctol/bookshelf-plugin
```

## Usage

```js
const plugin = require('@yoctol/bookshelf-plugin');

bookshelf.plugin(plugin);
```

## Include plugins

- [visibility](https://github.com/bookshelf/bookshelf/wiki/Plugin:-Visibility)
- case-converter
- [virtuals](https://github.com/bookshelf/bookshelf/wiki/Plugin:-Virtuals)
- [modelbase](https://github.com/bsiddiqui/bookshelf-modelbase)
- touch
- soft-delete
- accessible-attributes

### touch

```js
const Project = bookshelf.Model.extend({
  tableName: 'projects',
  touches: ['user'],

  user() {
    return this.belongsTo(User);
  },
});
```

```js
project.touch();
```

You can use `touchMethod` option to avoid naming conflict when it happened:

```js
const plugin = require('@yoctol/bookshelf-plugin');

bookshelf.plugin(plugin, { touchMethod: 'touchModel' });
```

### soft-delete

```js
const User = bookshelf.Model.extend({
  tableName: 'users',

  softDelete: true,
  dependents: ['projects'],

  projects() {
    return this.hasMany(Project);
  },
});
```

```js
// This will update deleted_at and cascade delete dependents
user.destroy();
```

### accessible-attributes

```js
const User = bookshelf.Model.extend({
  tableName: 'users',

  attrs: ['name', 'type', 'age'],
});
```

```js
user.name; // Same as user.get('name');
user.type; // Same as user.get('type');
user.age; // Same as user.get('age');
```

## License

MIT © [Yoctol](https://github.com/Yoctol/bookshelf-plugin)
