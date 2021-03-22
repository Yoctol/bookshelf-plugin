// refactored from https://github.com/scoutforpets/bookshelf-encrypt-columns/tree/1dafc88d9dcee66953f43a76bac50e967f91f70d/src

const crypto = require('crypto');

const { isEmpty } = require('lodash');

function encrypt({ algorithm, key, ivLength, value }) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted =
    iv.toString('hex') +
    cipher.update(value, 'utf8', 'hex') +
    cipher.final('hex');

  return encrypted;
}

function decrypt({ algorithm, key, ivLength, value }) {
  const iv = Buffer.from(value.slice(0, ivLength * 2), 'hex');
  const ciphertext = value.slice(ivLength * 2);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  const decrypted =
    decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8');

  return decrypted;
}

module.exports = (bookshelf, options) => {
  const proto = bookshelf.Model.prototype;

  const cipherOptions = {
    key: null,
    ivLength: 16,
    algorithm: 'aes-256-cbc',
    ...options,
  };

  // Create a unused cipher to validate the cipher options are valid.
  crypto.createCipheriv(
    cipherOptions.algorithm,
    cipherOptions.key,
    crypto.randomBytes(cipherOptions.ivLength)
  );

  // eslint-disable-next-line no-param-reassign
  bookshelf.Model = bookshelf.Model.extend({
    initialize(...args) {
      if (!this.encryptedColumns) {
        return proto.initialize.apply(this, args);
      }

      // Encrypt specified columns on create.
      this.on('saving', (model, attrs, _options = {}) => {
        if (this.encryptedColumns) {
          this.encryptedColumns.forEach((column) => {
            if (this.attributes[column]) {
              const encrypted = encrypt({
                ...cipherOptions,
                value: this.attributes[column],
              });
              if (_options.patch === true) {
                // eslint-disable-next-line no-param-reassign
                attrs[column] = encrypted;
              } else {
                this.attributes[column] = encrypted;
              }
            }
          });
        }
      });

      // Decrypt encrypted columns when fetching an individual record.
      this.on('fetched', () => {
        if (this.encryptedColumns) {
          this.encryptedColumns.forEach((column) => {
            if (this.attributes[column]) {
              this.attributes[column] = decrypt({
                ...cipherOptions,
                value: this.attributes[column],
              });
            }
          });
        }
      });

      // Decrypt encrypted columns when fetching a collection of records.
      this.on('fetched:collection', (collection) => {
        if (this.encryptedColumns) {
          this.encryptedColumns.forEach((column) => {
            if (!isEmpty(collection)) {
              collection.models.forEach((model) => {
                if (model.has(column)) {
                  // eslint-disable-next-line no-param-reassign
                  model.attributes[column] = decrypt({
                    ...cipherOptions,
                    value: model.attributes[column],
                  });
                }
              });
            }
          });
        }
      });

      return proto.initialize.apply(this, args);
    },
  });
};
