import 'hardhat/types/config'

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    chugSplash?: {
      executor?: string
    }
  }

  interface HardhatConfig {
    chugSplash?: {
      executor?: string
    }
  }
}
