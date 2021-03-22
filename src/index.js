const jsonColumns = require('bookshelf-json-columns');

const encryptColumnsPlugin = require('./plugins/encrypt-columns');
const softDelete = require('./plugins/soft-delete');
const modelbaseEnhance = require('./plugins/modelbase-enhance');
const touch = require('./plugins/touch');
const accessibleAttributes = require('./plugins/accessible-attributes');

module.exports = (
  bookshelf,
  {
    touchMethod,
    saveOptions,
    caseConverter = true,
    timestamps,
    encryptColumns = null,
    omitOptions = [],
  } = {}
) => {
  if (caseConverter) {
    bookshelf.plugin('bookshelf-case-converter-plugin');
  }
  bookshelf.plugin('bookshelf-virtuals-plugin');
  bookshelf.plugin(jsonColumns);

  if (encryptColumns) {
    bookshelf.plugin(encryptColumnsPlugin, { ...encryptColumns });
  }
  bookshelf.plugin(softDelete, { omitOptions });
  bookshelf.plugin(modelbaseEnhance, { timestamps });
  bookshelf.plugin(touch, { touchMethod, saveOptions });
  bookshelf.plugin(accessibleAttributes);
};
