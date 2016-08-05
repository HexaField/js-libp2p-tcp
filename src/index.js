'use strict'

const net = require('net')
const toPull = require('stream-to-pull-stream')
const mafmt = require('mafmt')
const contains = require('lodash.contains')
const isFunction = require('lodash.isfunction')
const Connection = require('interface-connection').Connection
const debug = require('debug')
const log = debug('libp2p:tcp')

const createListener = require('./listener')

module.exports = class TCP {
  dial (ma, options, cb) {
    if (isFunction(options)) {
      cb = options
      options = {}
    }

    if (!cb) {
      cb = () => {}
    }

    const cOpts = ma.toOptions()
    log('Connecting to %s %s', cOpts.port, cOpts.host)
    const socket = toPull.duplex(net.connect(cOpts, cb))

    socket.getObservedAddrs = (cb) => {
      return cb(null, [ma])
    }

    return new Connection(socket)
  }

  createListener (options, handler) {
    if (isFunction(options)) {
      handler = options
      options = {}
    }

    return createListener(handler)
  }

  filter (multiaddrs) {
    if (!Array.isArray(multiaddrs)) {
      multiaddrs = [multiaddrs]
    }
    return multiaddrs.filter((ma) => {
      if (contains(ma.protoNames(), 'ipfs')) {
        ma = ma.decapsulate('ipfs')
      }
      return mafmt.TCP.matches(ma)
    })
  }
}
