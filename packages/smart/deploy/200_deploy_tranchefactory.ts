import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getCollateral, getFees } from "../src/utils/deploy";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { collateralAddress, shareFactor } = await getCollateral(deployments);
  // if (!(await deployments.getOrNull("Collateral"))) {
  //   await deployments.deploy("Collateral", {
  //     contract: "Cash",
  //     from: deployer,
  //     args: ["USDC", "USDC", 6],
  //     log: true,
  //   });
  // }


  await deployments.deploy("TrancheAMMFactory", {
    contract: "TrancheAMMFactory",
    from: deployer,
    args: [],
    log: true,
  });

  await deployments.deploy("SplitterFactory", {
    contract: "SplitterFactory",
    from: deployer,
    args: [],
    log: true,
  });

  const trancheAMMFactory = await deployments.get("TrancheAMMFactory"); 
  const splitterFactory = await deployments.get("SplitterFactory"); 
  const marketFactory = await deployments.get("TrustedMarketFactoryV3"); 

  await deployments.deploy("TrancheFactory", {
    contract: "TrancheFactory",
    from: deployer,
    args: [deployer, trancheAMMFactory.address, splitterFactory.address, marketFactory.address],
    log: true,
  });

  const trancheFactory = await deployments.get("TrancheFactory");

  await deployments.deploy("TrancheMaster", {
    contract: "TrancheMaster",
    from: deployer,
    args: [trancheFactory.address],
    log: true,
  });

  await deployments.deploy("testVault1", {
    contract: "testVault",
    from: deployer,
    args: [collateralAddress],
    log: true,
  });  
  await deployments.deploy("testVault2", {
    contract: "testVault",
    from: deployer,
    args: [collateralAddress],
    log: true,
  });


};

func.tags = ["tranche"];
func.dependencies = [];

export default func;
