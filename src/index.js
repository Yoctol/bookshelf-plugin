const modelbaseEnhance = require('./plugins/modelbase-enhance');
const accessibleAttributes = require('./plugins/accessible-attributes');
const saveRefresh = require('./plugins/save-refresh');
const softDelete = require('./plugins/soft-delete');
const touch = require('./plugins/touch');

module.exports = (bookshelf, { touchMethod } = {}) => {
  bookshelf.plugin('visibility');
  bookshelf.plugin('case-converter');
  bookshelf.plugin('virtuals');

  bookshelf.plugin(softDelete);
  bookshelf.plugin(modelbaseEnhance);
  bookshelf.plugin(touch, { touchMethod });
  bookshelf.plugin(accessibleAttributes);
  bookshelf.plugin(saveRefresh);
};
