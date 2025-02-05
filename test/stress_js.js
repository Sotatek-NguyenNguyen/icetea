require('dotenv').config()
const { web3, switchEncoding } = require('./helper')
const { TxOp, ContractMode } = require('@iceteachain/common')

const tweb3 = web3.default()

async function testSimpleStore (mode, src, times = 10) {
  const key = process.env.BANK_KEY

  const data = {
    op: TxOp.DEPLOY_CONTRACT,
    mode,
    src: switchEncoding(src, 'utf8', 'base64')
  }

  tweb3.wallet.importAccount(key)
  const result = await tweb3.sendTransactionCommit({ data })
  const tags = tweb3.utils.decodeTxTags(result)
  const to = tags['tx.to']

  // Set value
  const data2 = {
    op: TxOp.CALL_CONTRACT,
    name: 'setValue',
    params: [100]
  }

  const promises = []
  for (let i = 0; i < times; i++) {
    promises.push(tweb3.sendTransactionCommit({ to, data: data2 }))
  }

  console.log('DONE!!!', await Promise.all(promises))
}

async function test (times) {
  const CONTRACT_SRC = `
        @contract class SimpleStore  {
            @state #owner = msg.sender
            @state #value
            getOwner() { return this.#owner }
            getValue() { return this.#value }
            @transaction setValue(value) {
                expect(this.#owner == msg.sender, 'Only contract owner can set value')
                expect(value, 'Invalid value')
                this.#value = value
                this.emitEvent("ValueChanged", {value: this.#value})
            }
        }`

  try {
    await testSimpleStore(ContractMode.JS_DECORATED, CONTRACT_SRC, times)
  } catch (error) {
    console.error(error)
  }

  console.log('Time', Date.now() - START)
  tweb3.close()
}

let times = 50
if (process.argv.length > 2) {
  times = parseInt(process.argv[2]) || times
}

console.log(`Create ${times} transactions...`)
const START = Date.now()
test(times)
