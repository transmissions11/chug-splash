import { HardhatUserConfig } from 'hardhat/config'

import './src/chug-splash'

const config: HardhatUserConfig = {
  paths: {
    sources: './contracts',
  },
  solidity: {
    version: '0.7.4',
  },
}

export default config
