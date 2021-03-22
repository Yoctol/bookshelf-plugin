const omit = require('lodash/omit');

const paranoia = require('./paranoia');

module.exports = (bookshelf, { omitOptions = [] } = {}) => {
  bookshelf.plugin(paranoia);

  const proto = bookshelf.Model.prototype;

  async function cascadeDelete(transacting, options) {
    const dependents = this.dependents || [];

    if (dependents.length > 0) {
      await this.load(dependents, { transacting });

      try {
        await Promise.all(
          dependents.map(async (dependent) => {
            const modelOrCollection = this.related(dependent);

            if (!modelOrCollection) return;

            // is relations collection
            if (Array.isArray(modelOrCollection.models)) {
              const collection = modelOrCollection;

              if (collection.models.length === 0) return;

              return Promise.all(
                collection.models.map((model) =>
                  collection.model
                    // delete without created_at, updated_at
                    // TODO: use model.destroy when https://github.com/bsiddiqui/bookshelf-paranoia/pull/38 ready
                    .forge({
                      id: model.id,
                    })
                    .destroy({ ...omit(options, omitOptions), transacting })
                )
              );
            }

            const model = modelOrCollection;

            // is relation model and relation exists
            if (!model.isNew()) {
              // delete without created_at, updated_at
              // TODO: use model.destroy when https://github.com/bsiddiqui/bookshelf-paranoia/pull/38 ready
              return model.constructor
                .forge({
                  id: model.id,
                })
                .destroy({ ...omit(options, omitOptions), transacting });
            }
          })
        );
      } catch (err) {
        console.error(err);
        throw err;
      }
    }

    return proto.destroy.call(this, { ...options, transacting });
  }

  // eslint-disable-next-line no-param-reassign
  bookshelf.Model = bookshelf.Model.extend({
    destroy(options = {}) {
      if (options.transacting) {
        return cascadeDelete.call(
          this,
          options.transacting,
          omit(options, ['cascade'])
        );
      }

      return bookshelf.knex.transaction((transacting) =>
        cascadeDelete.call(this, transacting, omit(options, ['cascade']))
      );
    },
  });
};
