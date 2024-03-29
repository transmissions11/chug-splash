/* Imports: External */
import { task, types } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import * as path from 'path'
import yesno from 'yesno'

/* Imports: Internal */
import {
  getTransactionExecutorFactory,
  makeRawTransactions,
  makeTransactionBundle,
  waitForBundleApproval,
} from './helpers'
import './type-extensions'

task('chugsplash-deploy')
  .addParam(
    'deployment',
    'Path to deployment definition JSON file.',
    undefined,
    types.string
  )
  .addOptionalParam(
    'executor',
    'Address of the TransactionBundleExecutor that will execute the deployment.',
    undefined,
    types.string
  )
  .setAction(async (args, hre: HardhatRuntimeEnvironment & { ethers: any }) => {
    const deployment = require(path.resolve(process.cwd(), args.deployment))

    const factory = getTransactionExecutorFactory().connect(
      hre.ethers.provider.getSigner(0)
    )
    const executor = factory.attach(
      hre.config.chugSplash?.executor || args.executor
    )

    const rawTxs = await makeRawTransactions(hre, deployment, executor.address)
    const bundle = makeTransactionBundle(rawTxs)

    console.log(
      `You're about to approve the following transaction bundle (executed top to bottom):`
    )
    console.log('--------------------------------------')
    for (const tx of deployment) {
      for (const field of Object.keys(tx)) {
        console.log(`${field}: ${tx[field]}`)
      }
      console.log('--------------------------------------')
    }

    const ok = await yesno({
      question: `Does this look ok? (y/n)`,
    })

    if (!ok) {
      console.log('rip')
      return
    }

    console.log(`TransactionBundleExecutor address: ${executor.address}`)
    console.log(`Transaction bundle hash: ${bundle.hash}`)
    console.log(
      `Please call TransactionBundleExecutor.approveTransactionBundle with the above bundle hash.`
    )
    console.log(`Waiting for transaction bundle to be approved...`)
    await waitForBundleApproval(bundle.hash, executor)
    console.log(`Bundle approved!`)
    console.log(`Executing bundle...`)

    // TODO:
    // 1. Really need a way to store artifacts. Contract deploy artifacts are easy.
    //     but how do we do transaction artifacts? We want a record of what is executed.
    //     PLUS we also don't necessarily want a record only to be generated by the user
    //     who executes the stuff. bleh? maybe a command that generates a record of everythign?

    for (let i = 0; i < bundle.transactions.length; i++) {
      const tx = bundle.transactions[i]
      console.log(`Executing bundle transaction #${i + 1} ...`)
      console.log(`Submitting transaction...`)
      const result = await executor.executeTransaction(
        tx.nextTransactionHash,
        tx.isCreate,
        tx.target,
        tx.gasLimit,
        tx.data,
        {
          gasLimit: tx.gasLimit + 100_000,
        }
      )
      console.log(`Submitted transaction.`)
      console.log(`Transaction hash: ${result.hash}`)
      console.log(`Waiting for transaction to be mined...`)
      await result.wait()
      console.log(`Transaction mined.`)
    }
  })

task('chugsplash-executor')
  .addOptionalParam(
    'owner',
    'Address that will own the executor once it has been deployed.',
    undefined,
    types.string
  )
  .setAction(async (args, hre: HardhatRuntimeEnvironment & { ethers: any }) => {
    const signer = hre.ethers.provider.getSigner(0)
    const factory = getTransactionExecutorFactory().connect(signer)

    console.log('Creating a new transaction executor.')
    console.log('Submitting deploy transaction...')
    const executor = await factory.deploy(
      args.owner || (await signer.getAddress())
    )
    console.log('Submitted deploy transaction.')
    console.log(`Transaction hash: ${executor.deployTransaction.hash}`)
    console.log(`Waiting for transaction to be mined...`)
    await executor.deployTransaction.wait()
    console.log(`Transaction mined!`)
    console.log(`Executor address: ${executor.address}`)
  })

task('chugsplash-approve')
  .addParam(
    'bundle',
    'Hash of the transaction bundle to execute.',
    undefined,
    types.string
  )
  .addOptionalParam(
    'executor',
    'Address of the TransactionBundleExecutor that will execute the deployment.',
    undefined,
    types.string
  )
  .setAction(async (args, hre: HardhatRuntimeEnvironment & { ethers: any }) => {
    const factory = getTransactionExecutorFactory().connect(
      hre.ethers.provider.getSigner(0)
    )
    const executor = factory.attach(
      hre.config.chugSplash?.executor || args.executor
    )

    console.log(`Submitting approval transaction...`)
    const result = await executor.approveTransactionBundle(args.bundle)
    console.log(`Submitted approval transaction.`)
    console.log(`Transaction hash: ${result.hash}`)
    console.log(`Waiting for transaction to be mined...`)
    await result.wait()
    console.log(`Transaction mined!`)
  })
