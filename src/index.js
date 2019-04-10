const jsonColumns = require('bookshelf-json-columns');

const encryptColumnsPlugin = require('./plugins/encrypt-columns');
const softDelete = require('./plugins/soft-delete');
const modelbaseEnhance = require('./plugins/modelbase-enhance');
const touch = require('./plugins/touch');
const accessibleAttributes = require('./plugins/accessible-attributes');
const saveRefresh = require('./plugins/save-refresh');

module.exports = (
  bookshelf,
  { touchMethod, caseConverter = true, timestamps, encryptColumns = null } = {}
) => {
  bookshelf.plugin('visibility');
  if (caseConverter) {
    bookshelf.plugin('case-converter');
  }
  bookshelf.plugin('virtuals');
  bookshelf.plugin(jsonColumns);

  if (encryptColumns) {
    bookshelf.plugin(encryptColumnsPlugin, { ...encryptColumns });
  }
  bookshelf.plugin(softDelete);
  bookshelf.plugin(modelbaseEnhance, { timestamps });
  bookshelf.plugin(touch, { touchMethod });
  bookshelf.plugin(accessibleAttributes);
  bookshelf.plugin(saveRefresh);
};
