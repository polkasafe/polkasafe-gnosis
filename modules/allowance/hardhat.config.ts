import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.7.6",
  networks: {
    goerli: {
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: ["4a63f272cde077274fe8a917a24d79eeb6e6fb83c1fc831b953c64ccb4dba79b"],
    },
  },
};

export default config;
