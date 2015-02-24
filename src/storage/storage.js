var Q = require('q')
var _ = require('lodash')

var NotImplementedError = require('../errors').NotImplementedError


/**
 * Abstract storage for verified blockchain
 *
 * You can save all hashes, but that needed store a large size
 *  on 20 February 2015 mainnet have more that 344k blocks
 *  thats mean you need store minimum 80 * 344000 / 1024 / 1024 = 26.24 MB
 *    or 52.48 MB if you store data in hex
 *  but for example in localStorage you can save only 2.5 MB ...
 *
 * We offer store maximum 2015 blocks hashes and sha256x2 hash for every chunk
 *  it's required nearly 105.31 KB for 344k blocks (impressive, really?)
 *  if you need block hash you can:
 *   - get from storage if it belongs to last not complete unhashed chunk
 *   - get chunk from network, calculate hash and compare with saved in storage,
 *       use block hashes from chunk and save it in memory if you needed this
 *  besides you can use pre-saved chunk hashes from Storage.prototype,
 *   it's saved user traffic and accelerate blockchain initialization
 *   pre-saved data has next structure:
 *    {lastHash: string, chunkHashes: string[]}
 *
 * But at least you can use both options, it's your right
 *   just remember, what sometimes you can't store all data that you needed ...
 *
 * All methods return Q.Promise,
 *  this is done for asynchronous storages such as: File, WebSQL
 *
 * Also all methods represent hashes in hex strings, not Buffer
 *
 * @class Storage
 * @param {Object} [opts]
 * @param {boolean} [opts.useCompactMode=false]
 */
function Storage(opts) {
  opts = _.extend({useCompactMode: false}, opts)
  this._useCompactMode = opts.useCompactMode
}

// load pre-saved data
Storage.prototype.preSavedChunkHashes = {
  bitcoin: require('./hashes/bitcoin'),
  testnet: require('./hashes/testnet')
}

/**
 * Return boolean, that indicate which mode uses by storage
 *
 * @return {boolean}
 */
Storage.prototype.isUsedCompactMode = function () {
  return this._useCompactMode
}

/**
 * @throws
 */
Storage.prototype.checkCompactModeAvailable = function () {
  if (!this.isUsedCompactMode()) {
    throw new
  }
}

/**
 * Return last header hash as hex string
 *
 * @abstract
 * @return {Q.Promise<string>}
 */
Storage.prototype.getLastHash = function () {
  return Q.reject(new NotImplementedError('Storage.getLastHash'))
}

/**
 * Set last header hash (hex string needed)
 *
 * @abstract
 * @param {string} lastHash
 * @return {Q.Promise}
 */
Storage.prototype.setLastHash = function () {
  return Q.reject(new NotImplementedError('Storage.setLastHash'))
}

/**
 * Return total available chunk hashes
 *
 * @abstract
 * @return {Q.Promise<number>}
 */
Storage.prototype.getChunkHashesCount = function () {
  return Q.reject(new NotImplementedError('Storage.getChunkHashesCount'))
}

/**
 * Get chunk hash for given `index`
 *
 * @abstract
 * @param {number} index
 * @return {Q.Promise<string>}
 */
Storage.prototype.getChunkHash = function () {
  return Q.reject(new NotImplementedError('Storage.getChunkHash'))
}

/**
 * Put chunk hash to storage
 *
 * @param {string} chunkHash
 * @return {Q.Promise}
 */
Storage.prototype.putChunkHash = function (chunkHash) {
  return this.putChunkHashes([chunkHash])
}

/**
 * Put chunk hashes to storage
 *
 * @abstract
 * @param {string[]} chunkHashes
 * @return {Q.Promise}
 */
Storage.prototype.putChunkHashes = function () {
  return Q.reject(new NotImplementedError('Storage.putChunkHashes'))
}

/**
 * Truncate number of saved chunk hashes
 *
 * @abstract
 * @param {number} limit
 * @return {Q.Promise}
 */
Storage.prototype.truncateChunkHashes = function () {
  return Q.reject(new NotImplementedError('Storage.truncateChunkHashes'))
}

/**
 * Return total available headers
 *
 * @abstract
 * @return {Q.Promise<number>}
 */
Storage.prototype.getHeadersCount = function () {
  return Q.reject(new NotImplementedError('Storage.getHeadersCount'))
}

/**
 * Return hex header for given `index`
 *
 * @abstract
 * @param {number} index
 * @return {Q.Promise<string>}
 */
Storage.prototype.getHeader = function () {
  return Q.reject(new NotImplementedError('Storage.getHeader'))
}

/**
 * Put hex header to storage
 *
 * @param {string} header
 * @return {Q.Promise}
 */
Storage.prototype.putHeader = function (hexHeader) {
  return this.putBlockHashes(hexHeader)
}

/**
 * Put hex headers to storage
 *
 * @abstract
 * @param {string[]} headers
 * @return {Q.Promise}
 */
Storage.prototype.putHeaders = function () {
  return Q.reject(new NotImplementedError('Storage.putHeaders'))
}

/**
 * Truncate number of saved headers
 *
 * @abstract
 * @param {number} limit
 * @return {Q.Promise}
 */
Storage.prototype.truncateHeaders = function () {
  return Q.reject(new NotImplementedError('Storage.truncateBlockHashes'))
}

/**
 * Remove all data
 *
 * @abstract
 * @return {Q.Promise}
 */
Storage.prototype.clear = function () {
  return Q.reject(new NotImplementedError('Storage.clear'))
}


module.exports = Storage
