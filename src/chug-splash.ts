import * as path from 'path'
import { task } from 'hardhat/config'
import {
  TASK_COMPILE_SOLIDITY_COMPILE_JOB,
  TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT,
  TASK_COMPILE_SOLIDITY
} from 'hardhat/builtin-tasks/task-names'

class ChugSplashError extends Error {
  constructor(message: string, public output: any) {
    super(message)
  }
}

export interface ChugSplashConfig {
  [contractName: string]: {
    contractSource: string
    constructorArgs: {
      [key: string]: any
    }
  }
}

export interface ChugSplashRequest {
  sources: any
  config: ChugSplashConfig
}

export interface ChugSplashResponse {
  contracts: {
    [name: string]: {
      address: string
      url: string
    }
  }
}

task("chug-splash")
  .addParam("deploycfg", "Path to a chug splash config")
  .setAction(
    async (taskArguments, hre, runSuper) => {
      const deployConfig = require(path.resolve(process.cwd(), taskArguments.deploycfg))

      let compilerInput: any
      try {
        await hre.run(TASK_COMPILE_SOLIDITY, {
          force: true,
          quiet: false,
        })
      } catch (err) {
        compilerInput = err.output
      }

      console.log({
        compilerInput,
        deployConfig,
      })
    }
  )

task(TASK_COMPILE_SOLIDITY_COMPILE_JOB, async (taskArguments: {
  compilationJob: any
}, hre, runSuper) => {
  const input: any = await hre.run(
    TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT,
    {
      compilationJob: taskArguments.compilationJob,
    }
  )

  throw new ChugSplashError(`ChugSplash'd`, input)
})
