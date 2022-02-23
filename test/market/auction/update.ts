import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { FNDNFTMarket, MockNFT } from "../../../typechain-types";
import { deployContracts } from "../../helpers/deploy";
import { constants } from "ethers";

describe("Market / auction / create", () => {
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
    await market.connect(creator).createReserveAuction(nft.address, 1, price);
    tx = await market.connect(creator).updateReserveAuction(1, 15);
  });

  it("can update auction", async () => {
    await expect(tx).to.emit(market, "ReserveAuctionUpdated").withArgs(
      1,
      15, // reservePrice
    );
  });
  it("can read auction info", async () => {
    const auctionInfo = await market.getReserveAuction(1);
    expect(auctionInfo.nftContract).to.eq(nft.address);
    expect(auctionInfo.tokenId).to.eq(1);
    expect(auctionInfo.seller).to.eq(creator.address);
    expect(auctionInfo.endTime).to.eq(0);
    expect(auctionInfo.bidder).to.eq(constants.AddressZero);
    expect(auctionInfo.amount).to.eq(15);
  });
});
