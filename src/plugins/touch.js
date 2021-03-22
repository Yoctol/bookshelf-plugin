module.exports = (
  bookshelf,
  { touchMethod = 'touch', saveOptions = {} } = {}
) => {
  const proto = bookshelf.Model.prototype;

  // eslint-disable-next-line no-param-reassign
  bookshelf.Model = bookshelf.Model.extend({
    initialize(...args) {
      proto.initialize.apply(this, args);

      this.on('saved', async (_, { transacting } = {}) => {
        const touches = this.touches || [];

        if (touches.length > 0) {
          await this.load(touches);

          try {
            await Promise.all(
              touches.map(async (touch) => {
                const modelOrCollection = this.related(touch);

                if (!modelOrCollection) return;

                // is relations collection
                if (Array.isArray(modelOrCollection.models)) {
                  const collection = modelOrCollection;

                  if (collection.models.length === 0) return;

                  return Promise.all(
                    collection.models.map((model) =>
                      model[touchMethod]({ transacting })
                    )
                  );
                }

                const model = modelOrCollection;

                // is relation model and relation exists
                if (!model.isNew()) {
                  return model[touchMethod]({ transacting });
                }
              })
            );
          } catch (err) {
            console.error(err);
            throw err;
          }
        }
      });
    },

    [touchMethod]({ transacting } = {}) {
      const [, updatedAtKey] = this.getTimestampKeys();

      const now = new Date();

      return this.save(
        { [updatedAtKey]: now },
        {
          transacting,
          patch: true,
          ...saveOptions,
        }
      );
    },
  });
};
