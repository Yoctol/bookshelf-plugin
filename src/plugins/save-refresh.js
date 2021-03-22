module.exports = (bookshelf) => {
  // model.save() wouldn't return all columns
  // https://github.com/bookshelf/bookshelf/issues/507
  // TODO: this feature may be supported after bookshelf v0.14.x
  // https://github.com/bookshelf/bookshelf/issues/1665
  const proto = bookshelf.Model.prototype;

  // eslint-disable-next-line no-param-reassign
  bookshelf.Model = bookshelf.Model.extend({
    save(...args) {
      let attrs;
      let options;

      const [firstArg, secondArg, thirdArg] = args;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (firstArg == null || typeof firstArg === 'object') {
        attrs = firstArg || {};
        options = secondArg || {};
      } else {
        attrs = {
          [firstArg]: secondArg,
        };
        options = thirdArg || {};
      }

      const { withRefresh, ...otherOptions } = options;

      // we must return bluebird Promise for bookshelf
      return proto.save.call(this, attrs, otherOptions).then((model) => {
        if (withRefresh && model) {
          // options contains transaction info
          return model.refresh(otherOptions);
        }

        return model;
      });
    },
  });
};
