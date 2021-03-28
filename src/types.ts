export interface DeployTransaction {
  action: 'deploy'
  contract: string
  name?: string
  arguments?: any[]
  gasLimit: number
}

export interface CallTransaction {
  action: 'call'
  target: string
  function: string
  arguments?: any[]
  gasLimit: number
}

export type BundleTransaction = DeployTransaction | CallTransaction

export interface RawBundleTransaction {
  to: string | null
  data: string
  gasLimit: number
}

export interface CompiledBundleTransaction {
  nextTransactionHash: string
  isCreate: boolean
  target: string
  gasLimit: number
  data: string
}

export interface TransactionBundle {
  hash: string
  transactions: CompiledBundleTransaction[]
}

export const isDeployTransaction = (
  tx: BundleTransaction
): tx is DeployTransaction => {
  return tx.action === 'deploy'
}

export const isCallTransaction = (
  tx: BundleTransaction
): tx is CallTransaction => {
  return tx.action === 'call'
}
