import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { FNDNFTMarket, MockNFT } from "../../../typechain-types";
import { ONE_DAY } from "../../helpers/constants";
import { deployContracts } from "../../helpers/deploy";

describe("NFTMarket / auction / createReserveAuction", () => {
  let deployer: SignerWithAddress;
  let creator: SignerWithAddress;
  let market: FNDNFTMarket;
  let nft: MockNFT;
  let tx: ContractTransaction;
  const price = ethers.utils.parseEther("1");

  beforeEach(async () => {
    [deployer, creator] = await ethers.getSigners();
    ({ nft, market } = await deployContracts({ deployer, creator }));
    await nft.mint();
    await nft.connect(creator).setApprovalForAll(market.address, true);
    tx = await market.connect(creator).createReserveAuction(nft.address, 1, price);
  });

  it("can create auction", async () => {
    await expect(tx)
      .to.emit(market, "ReserveAuctionCreated")
      .withArgs(
        creator.address, // seller
        nft.address, // token
        1, // tokenID
        ONE_DAY, // duration
        60 * 15, // extensionDuration
        price, // reservePrice
        1, // auctionId
      );
  });

  it("NFT is in escrow", async () => {
    expect(await nft.ownerOf(1)).to.eq(market.address);
  });
});
