const modelbase = require('bookshelf-modelbase');

module.exports = (
  bookshelf,
  { timestamps = ['createdAt', 'updatedAt'] } = {}
) => {
  bookshelf.plugin(modelbase.pluggable);

  const proto = bookshelf.Model.prototype;

  // eslint-disable-next-line no-param-reassign
  bookshelf.Model = bookshelf.Model.extend({
    hasTimestamps: timestamps,

    where(firstArg, ...otherArgs) {
      // example: .where({ id: 1 })
      if (firstArg && typeof firstArg === 'object') {
        return proto.where.call(this, this.format(firstArg));
      }

      // example: .where(id, 1)
      if (firstArg && typeof firstArg === 'string') {
        const tmp = { [firstArg]: null };
        const formatedKey = Object.keys(this.format(tmp))[0];
        return proto.where.call(this, formatedKey, ...otherArgs);
      }

      return proto.where.call(this, firstArg, ...otherArgs);
    },
  });
};
