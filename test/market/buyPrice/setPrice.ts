import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { FNDNFTMarket, MockNFT } from "../../../typechain-types";
import { deployContracts } from "../../helpers/deploy";

describe("market / buyPrice / setPrice", function () {
  let market: FNDNFTMarket;
  let nft: MockNFT;
  let deployer: SignerWithAddress;
  let creator: SignerWithAddress;
  let rando: SignerWithAddress;
  let tx: ContractTransaction;
  const price = ethers.utils.parseEther("1");

  beforeEach(async () => {
    [deployer, creator, rando] = await ethers.getSigners();
    ({ nft, market } = await deployContracts({ deployer, creator }));

    // Mint and approve NFT 1 for testing
    await nft.mint();
    await nft.setApprovalForAll(market.address, true);
  });

  it("No price found before it's set", async () => {
    const buyPrice = await market.getBuyPrice(nft.address, 1);
    expect(buyPrice.seller).to.eq(ethers.constants.AddressZero);
    expect(buyPrice.price).to.eq(ethers.constants.MaxUint256);
  });

  it("Only the owner can set a price", async () => {
    await expect(market.connect(rando).setBuyPrice(nft.address, 1, price)).to.be.revertedWith(
      "ERC721: transfer from incorrect owner",
    );
  });

  describe("`setBuyPrice`", () => {
    beforeEach(async () => {
      tx = await market.connect(creator).setBuyPrice(nft.address, 1, price);
    });

    it("Emits BuyPriceSet", async () => {
      await expect(tx).to.emit(market, "BuyPriceSet").withArgs(nft.address, 1, creator.address, price);
    });

    it("Transfers NFT into market escrow", async () => {
      const ownerOf = await nft.ownerOf(1);
      expect(ownerOf).to.eq(market.address);
    });

    it("Can read the price", async () => {
      const buyPrice = await market.getBuyPrice(nft.address, 1);
      expect(buyPrice.seller).to.eq(creator.address);
      expect(buyPrice.price).to.eq(price);
    });

    describe("`setBuyPrice` again to change the price", () => {
      beforeEach(async () => {
        tx = await market.connect(creator).setBuyPrice(nft.address, 1, price.mul(2));
      });

      it("Emits BuyPriceSet", async () => {
        await expect(tx).to.emit(market, "BuyPriceSet").withArgs(nft.address, 1, creator.address, price.mul(2));
      });

      it("Can read the price", async () => {
        const buyPrice = await market.getBuyPrice(nft.address, 1);
        expect(buyPrice.seller).to.eq(creator.address);
        expect(buyPrice.price).to.eq(price.mul(2));
      });
    });
  });
});
