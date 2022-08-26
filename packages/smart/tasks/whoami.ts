import { task } from "hardhat/config";
import { makeSigner } from "./deploy";

task("whoami", "Prints the default account's address", async (args, hre) => {
  const signer = await makeSigner(hre);
  const address = await signer.getAddress();

  console.log(`You are: ${address}`);
});
