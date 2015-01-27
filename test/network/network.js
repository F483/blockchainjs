var events = require('events')

var expect = require('chai').expect

var blockchainjs = require('../../src')

var notImplementedMethods = [
  'getHeader',
  'getChunk',
  'getTx',
  'getMerkle',
  'sendTx',
  'getHistory',
  'getUnspent',
  'subscribeAddress'
]


describe('network.Network', function () {
  var network

  beforeEach(function () {
    network = new blockchainjs.network.Network()
  })

  it('inherits events.EventEmitter', function () {
    expect(network).to.be.instanceof(events.EventEmitter)
    expect(network).to.be.instanceof(blockchainjs.network.Network)
  })

  it('supportVerificationMethods', function () {
    expect(network.supportVerificationMethods()).to.be.false
  })

  it('getCurrentHeight', function () {
    expect(network.getCurrentHeight()).to.equal(-1)
  })

  it('getCurrentBlockHash', function () {
    var result = network.getCurrentBlockHash().toString('hex')
    expect(result).to.equal(blockchainjs.util.zfill('', 64))
  })

  notImplementedMethods.forEach(function (method) {
    it(method, function (done) {
      network[method]()
        .catch(function (e) { return e })
        .then(function (result) {
          expect(result).to.be.instanceof(blockchainjs.errors.NotImplementedError)
          done()
        })
    })
  })
})