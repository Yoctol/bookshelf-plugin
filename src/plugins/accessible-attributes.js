const snakeCase = require('lodash/snakeCase');

module.exports = bookshelf => {
  const proto = bookshelf.Model.prototype;

  // eslint-disable-next-line no-param-reassign
  bookshelf.Model = bookshelf.Model.extend({
    constructor(...args) {
      proto.constructor.apply(this, args);

      if (this.attrs) {
        const attrs = [...this.attrs, 'createdAt', 'updatedAt', 'deletedAt'];
        attrs.forEach(attr => {
          Object.defineProperty(this, attr, {
            get: () =>
              this.get(attr) === undefined
                ? this.get(snakeCase(attr))
                : this.get(attr),
            set: (value, key) => this.set(key, value),
          });
        });
      }
    },
  });
};
