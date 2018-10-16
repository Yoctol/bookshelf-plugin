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

- [visibility](https://github.com/bookshelf/bookshelf/wiki/Plugin:-Visibility)
- case-converter
- [virtuals](https://github.com/bookshelf/bookshelf/wiki/Plugin:-Virtuals)
- [modelbase](https://github.com/bsiddiqui/bookshelf-modelbase)
- [json-columns](https://github.com/seegno/bookshelf-json-columns)
- touch
- soft-delete
- accessible-attributes
- save-refresh

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

### save-refresh

> This feature may be supported after bookshelf v0.14.x: https://github.com/bookshelf/bookshelf/issues/1665

```js
user.save(null, { withRefresh: true });
user.save({ key: value }, { withRefresh: true });
user.save(key, value, { withRefresh: true });
```

## License

MIT © [Yoctol](https://github.com/Yoctol/bookshelf-plugin)
