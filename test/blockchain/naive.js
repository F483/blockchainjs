/* global describe, it, afterEach, beforeEach */
/* globals Promise:true */

var expect = require('chai').expect
var bitcoin = require('bitcoinjs-lib')
var Promise = require('bluebird')

var blockchainjs = require('../../lib')
var helpers = require('../helpers')
var fixtures = require('../data/connector.json')

describe('blockchain.Naive', function () {
  this.timeout(30000)

  var connector
  var blockchain

  beforeEach(function (done) {
    connector = new blockchainjs.connector.Chromanode({networkName: 'testnet'})
    connector.on('error', helpers.ignoreConnectorErrors)
    connector.once('connect', done)
    connector.connect()
    blockchain = new blockchainjs.blockchain.Naive(connector, {networkName: 'testnet'})
    blockchain.on('error', helpers.ignoreConnectorErrors)
  })

  afterEach(function (done) {
    connector.on('newReadyState', function (newState) {
      if (newState !== connector.READY_STATE.CLOSED) {
        return
      }

      connector.removeAllListeners()
      connector.on('error', function () {})

      blockchain.removeAllListeners()
      blockchain.on('error', function () {})

      connector = blockchain = null

      done()
    })
    connector.disconnect()
  })

  it('inherits Blockchain', function () {
    expect(blockchain).to.be.instanceof(blockchainjs.blockchain.Blockchain)
    expect(blockchain).to.be.instanceof(blockchainjs.blockchain.Naive)
  })

  it('connector property', function () {
    expect(blockchain.connector).to.equal(connector)
  })

  it('latest', function (done) {
    var expected = {blockid: blockchainjs.util.zfill('', 64), height: -1}
    expect(blockchain.latest).to.deep.equal(expected)
    blockchain.once('newBlock', function () {
      expect(blockchain.latest.height).to.at.least(300000)
      done()
    })
  })

  it('getHeader 0 by height', function (done) {
    blockchain.getHeader(fixtures.headers[0].height)
      .then(function (header) {
        expect(header).to.deep.equal(fixtures.headers[0])
      })
      .done(done, done)
  })

  it('getHeader 300000 by id', function (done) {
    blockchain.getHeader(fixtures.headers[300000].blockid)
      .then(function (header) {
        expect(header).to.deep.equal(fixtures.headers[300000])
      })
      .done(done, done)
  })

  it('getHeader (not-exists -- wrong height)', function (done) {
    blockchain.getHeader(987654)
      .then(function () { throw new Error('Unexpected Behavior') })
      .catch(function (err) {
        expect(err).to.be.instanceof(blockchainjs.errors.Blockchain.HeaderNotFound)
        expect(err.message).to.match(/987654/)
      })
      .done(done, done)
  })

  it('getHeader (not-exists -- wrong blockHash)', function (done) {
    var blockHash = '000000008c0c4d9f3f1365dc028875bebd0344307d63feae16ec2160a50dce23'

    blockchain.getHeader(blockHash)
      .then(function () { throw new Error('Unexpected Behavior') })
      .catch(function (err) {
        expect(err).to.be.instanceof(blockchainjs.errors.Blockchain.HeaderNotFound)
        expect(err.message).to.match(new RegExp(blockHash))
      })
      .done(done, done)
  })

  it('getTx (confirmed tx)', function (done) {
    var txId = '9854bf4761024a1075ebede93d968ce1ba98d240ba282fb1f0170e555d8fdbd8'

    blockchain.getTx(txId)
      .then(function (txHex) {
        var responseTxId = blockchainjs.util.hashEncode(
          blockchainjs.util.sha256x2(new Buffer(txHex, 'hex')))
        expect(responseTxId).to.equal(txId)
      })
      .done(done, done)
  })

  it('getTx (unconfirmed tx)', function (done) {
    helpers.getUnconfirmedTxId()
      .then(function (txId) {
        return blockchain.getTx(txId)
          .then(function (txHex) {
            var responseTxId = blockchainjs.util.hashEncode(
              blockchainjs.util.sha256x2(new Buffer(txHex, 'hex')))
            expect(responseTxId).to.equal(txId)
          })
      })
      .done(done, done)
  })

  it('getTx (not-exists tx)', function (done) {
    var txId = '74335585dadf14f35eaf34ec72a134cd22bde390134e0f92cb7326f2a336b2bb'

    blockchain.getTx(txId)
      .then(function () { throw new Error('Unexpected Behavior') })
      .catch(function (err) {
        expect(err).to.be.instanceof(blockchainjs.errors.Blockchain.TxNotFound)
        expect(err.message).to.match(new RegExp(txId))
      })
      .done(done, done)
  })

  it('getTxBlockId (confirmed tx)', function (done) {
    var txId = '9854bf4761024a1075ebede93d968ce1ba98d240ba282fb1f0170e555d8fdbd8'
    var expected = {
      source: 'blocks',
      data: {
        blockid: '00000000ba81453dd2839b8f91b61be98ee82bee5b7697f6dab1f6149885f1ff',
        height: 279774
      }
    }

    blockchain.getTxBlockId(txId)
      .then(function (response) {
        expect(response).to.deep.equal(expected)
      })
      .done(done, done)
  })

  it('getTxBlockId (unconfirmed tx)', function (done) {
    helpers.getUnconfirmedTxId()
      .then(function (txId) {
        return blockchain.getTxBlockId(txId)
      })
      .then(function (response) {
        expect(response).to.deep.equal({source: 'mempool'})
      })
      .done(done, done)
  })

  it('getTxBlockId (non-exists tx)', function (done) {
    var txId = '74335585dadf14f35eaf34ec72a134cd22bde390134e0f92cb7326f2a336b2bb'

    blockchain.getTxBlockId(txId)
      .then(function () { throw new Error('Unexpected Behavior') })
      .catch(function (err) {
        expect(err).to.be.instanceof(blockchainjs.errors.Blockchain.TxNotFound)
        expect(err.message).to.match(new RegExp(txId))
      })
      .done(done, done)
  })

  it('sendTx', function (done) {
    helpers.createTx()
      .then(function (tx) {
        return blockchain.sendTx(tx.toHex())
      })
      .done(done, done)
  })

  it('addressesQuery (history)', function (done) {
    var fixture = fixtures.history[0]
    blockchain.addressesQuery(fixture.addresses)
      .then(function (res) {
        expect(res).to.be.an('object')
        expect(res.transactions).to.deep.equal(fixture.transactions)
        expect(res.latest).to.be.an('object')
        expect(res.latest.height).to.be.at.least(300000)
        expect(res.latest.blockid).to.have.length(64)
      })
      .done(done, done)
  })

  /* @todo
  it.skip('getUnspents', function (done) {
    var address = 'n1YYm9uXWTsjd6xwSEiys7aezJovh6xKbj'
    var addressCoins = [
      {
        txId: '75a22bdb38352ba6deb7495631335616a308a2db8eb1aa596296d3be5f34f01e',
        outIndex: 0,
        value: 5000000000
      }
    ]

    blockchain.getUnspents(address)
      .then(function (coins) {
        expect(coins).to.deep.equal(addressCoins)
      })
      .done(done, done)
  })
  */

  it('subscribeAddress', function (done) {
    new Promise(function (resolve, reject) {
      helpers.createTx()
        .then(function (tx) {
          var address = bitcoin.Address.fromOutputScript(
            tx.outs[0].script, bitcoin.networks.testnet).toBase58Check()

          blockchain.on('touchAddress', function (touchedAddress, txId) {
            if (touchedAddress === address && txId === tx.getId()) {
              resolve()
            }
          })

          return blockchain.subscribeAddress(address)
            .then(function () {
              return blockchain.sendTx(tx.toHex())
            })
        })
        .catch(reject)
    })
    .done(done, done)
  })
})
