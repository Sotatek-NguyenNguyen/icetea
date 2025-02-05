require('dotenv').config()
const server = require('abci')
const startup = require('./abcihandler')
const { versions, abciServerPort } = require('./config')
const semver = require('semver')
const debug = require('debug')('icetea')

if (!semver.satisfies(process.versions.node, versions.node)) {
  throw new Error(`Icetea requires Node version ${versions.node}, your current version is ${process.versions.node}.`)
}

startup().then(handler => {
  server(handler).listen(abciServerPort, () => {
    debug(`ABCI server listening on port ${abciServerPort}!`)
  })
})
