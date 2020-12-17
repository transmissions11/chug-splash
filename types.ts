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
