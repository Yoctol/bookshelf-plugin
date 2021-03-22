# bookshelf-plugin

[![npm](https://img.shields.io/npm/v/@yoctol/bookshelf-plugin.svg)](https://www.npmjs.com/package/@yoctol/bookshelf-plugin)

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

- [case-converter](https://github.com/bookshelf/case-converter-plugin)
- [virtuals](https://github.com/bookshelf/virtuals-plugin)
- [modelbase](https://github.com/bsiddiqui/bookshelf-modelbase)
- [json-columns](https://github.com/seegno/bookshelf-json-columns)
- touch
- soft-delete
- accessible-attributes
- encrypt-columns

You can pass `caseConverter: false` option to disable `case-converter`:

```js
const plugin = require('@yoctol/bookshelf-plugin');

bookshelf.plugin(plugin, { caseConverter: false });
```

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

You can use `timestamps` option to overwrite the timestamps key:

```js
const plugin = require('@yoctol/bookshelf-plugin');

bookshelf.plugin(plugin, { timestamps: ['created_at', 'updated_at'] });
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

You can also overwrite attr on Model.

```js
bookshelf.Model = bookshelf.Model.extend({
  constructor(...args) {
    proto.constructor.apply(this, args);

    Object.defineProperty(this, 'custom', {
      get: () => 'custom-value',
      set: (value, key) => this.set(key, value),
    });
  },
});
```

### encrypt-columns

Use `encryptColumns` options to enable `encrypt-columns` plugin.  
The idea of this plugin mainly comes from [`bookshelf-encrypt-columns`](https://github.com/scoutforpets/bookshelf-encrypt-columns/)

```js
const plugin = require('@yoctol/bookshelf-plugin');

bookshelf.plugin(plugin, {
  encryptColumns: {
    algorithm: 'aes-256-cbc', // default to 'aes-256-cbc'
    ivLength: 16, // IV length for the selected algorithm
    key: '<YOUR_KEY>',
  },
});
```

This plugin will automatically encrypt when save to database and decrypt on query from database.

```js
const User = bookshelf.Model.extend({
  tableName: 'users',
  encryptedCoulmns: ['secret'],
});
```

## License

MIT © [Yoctol](https://github.com/Yoctol/bookshelf-plugin)
