import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { FNDNFTMarket, MockNFT } from "../../../typechain-types";
import { deployContracts } from "../../helpers/deploy";
import { increaseTimeTo } from "../../helpers/time";

describe("Market / auction / finalize", () => {
  let deployer: SignerWithAddress;
  let creator: SignerWithAddress;
  let bidder: SignerWithAddress;
  let bidder2: SignerWithAddress;
  let market: FNDNFTMarket;
  let nft: MockNFT;
  let tx: ContractTransaction;
  const nftId = 1;
  const reservePrice = ethers.utils.parseEther("1");

  beforeEach(async () => {
    [deployer, creator, bidder, bidder2] = await ethers.getSigners();
    ({ nft, market } = await deployContracts({ deployer, creator }));
    await nft.mint();
    await nft.connect(creator).setApprovalForAll(market.address, true);
  });

  describe("after the auction has ended", () => {
    beforeEach(async () => {
      await market.connect(creator).createReserveAuction(nft.address, nftId, reservePrice);
      await market.connect(bidder).placeBid(1, { value: reservePrice });
      const auctionInfo = await market.getReserveAuction(1);
      await increaseTimeTo(auctionInfo.endTime.add(1));
      tx = await market.finalizeReserveAuction(1);
    });

    it("emits ReserveAuctionFinalized", async () => {
      await expect(tx).to.emit(market, "ReserveAuctionFinalized").withArgs(
        1,
        creator.address, // seller
        bidder.address, // bidder
        reservePrice.mul(15).div(100),
        reservePrice.mul(85).div(100),
        0,
      );
    });

    it("NFT was transferred to the auction winner", async () => {
      expect(await nft.ownerOf(nftId)).to.eq(bidder.address);
    });

    it("cannot read auction id for this token", async () => {
      expect(await market.getReserveAuctionIdFor(nft.address, nftId)).to.eq(0);
    });
  });
});
