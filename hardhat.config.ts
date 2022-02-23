import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import { HardhatUserConfig } from "hardhat/types";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1337,
      },
    },
  },
  typechain: {
    target: "ethers-v5",
    externalArtifacts: ["node_modules/@manifoldxyz/royalty-registry-solidity/build/contracts/*.json"],
  },
};

export default config;
