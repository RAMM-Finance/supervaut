pragma solidity ^0.8.4;


import {Auth} from "../auth/Auth.sol";
import {ERC4626} from "../mixins/ERC4626.sol";

import {SafeCastLib} from "../utils/SafeCastLib.sol";
import {SafeTransferLib} from "../utils/SafeTransferLib.sol";
import {FixedPointMathLib} from "../utils/FixedPointMathLib.sol";

import {ERC20} from "../tokens/ERC20.sol";
import {Instrument} from "../instrument.sol";
import {tVault} from "./tVault.sol"; 
import {TrancheMaster} from "./tranchemaster.sol"; 
import "@openzeppelin/contracts/utils/math/Math.sol";
import "hardhat/console.sol";


/// @notice tokens for junior/senior tranches, no funds 
/// are stored in this contract, but are all escrowed to 
/// the splitter contract, only to be redeemed at maturity. 
abstract contract tToken is ERC4626{

  //   modifier onlySplitter() {
  //   require(msg.sender == splitter, "!Splitter");
  //    _;
  // }

  // Splitter splitter; 
  // ERC20 asset; 
  // bool isSenior; 
  // uint256 immutable vaultId; 
  // address tMaster; 

  // /// @notice asset is the tVault  
  // constructor(
  //     ERC20 _asset, 
  //     string memory _name,
  //     string memory _symbol, 
  //     address _splitter, 
  //     bool _isSenior,  //internal senior or junior 
  //     uint256 _vaultId, //internal vaultId 
  //   ) ERC4626(
  //       _asset.want(), //the underlying of the vault, i.e wETH, usdc, etc
  //       _name,
  //       _symbol
  //   )  {
  //       asset = _asset;
  //       splitter = Splitter(_splitter); 
  //       vaultId = _vaultId; 
  //       tMaster = splitter.trancheMasterAd(); 
  // }

  // function trustedMint(address receiver, uint256 amount) public onlySplitter {
  //   _mint(receiver, amount); 
  // }

  // function trustedBurn(address receiver, uint256 amount) public onlySplitter {
  //   _burn(receiver, amount); 
  // }

  // function deposit(uint256 assets, address receiver) public virtual returns (uint256 shares) {
  //   // Check for rounding error since we round down in previewDeposit.
  //   require((shares = previewDeposit(assets)) != 0, "ZERO_SHARES");

  //   // Need to transfer before minting or ERC777s could reenter.
  //   asset.safeTransferFrom(msg.sender, address(this), assets);

  //   _mint(receiver, shares);

  //   emit Deposit(msg.sender, receiver, assets, shares);

  //   afterDeposit(assets, shares, receiver);
  // }

  // function withdraw(
  //     uint256 assets,
  //     address receiver,
  //     address owner
  // ) public virtual returns (uint256 shares) {
  //   shares = previewWithdraw(assets); // No need to check for rounding error, previewWithdraw rounds up.

  //   if (msg.sender != owner) {
  //       uint256 allowed = allowance[owner][msg.sender]; // Saves gas for limited approvals.

  //       if (allowed != type(uint256).max) allowance[owner][msg.sender] = allowed - shares;
  //   }

  //   beforeWithdraw(assets, shares);

  //   _burn(owner, shares);

  //   emit Withdraw(msg.sender, receiver, owner, assets, shares);

  //   asset.safeTransfer(receiver, assets);
  // }

  // /// @notice need to get total assets denominated in the want token, 
  // /// but since this contract is not holding any funds, instead calculate it 
  // /// implicitly by supply * P_ju or P_su 
  // function totalAssets() public view override returns(uint256){
  //   uint price = !isSenior? splitter.getPju() : splitter.getPsu(); 
  //   return totalSupply.mulDivDown(price, splitter.PRICE_PRECISION()); 
  // } 

  // /// @notice contains key logic for investing into this tranche from the underlying of its parent
  // /// vault, which involves minting the parent vault, splitting and swapping 
  // /// @dev assets is denominated in want, 
  // function afterDeposit(uint256 assets, uint256 shares, address receiver) internal override {

  //   asset.approve(tMaster, assets); 

  //   // Buying will transfer assets back to the splitter, and mint this token to this address 
  //   // so need to transfer the minted tokens back to the tVault, 
  //   transfer(
  //     receiver,
  //     TrancheMaster(tMaster).buy_tranche(vaultId, assets, isSenior) 
  //     ); 
  // }

  // function beforeWithdraw(uint256 assets, uint256 shares) internal override{

  // }


}

/// @notice Accepts ERC20 and splits them into senior/junior tokens
/// Will hold the ERC20 token in this contract
/// Before maturity, redemption only allowed for a pair, 
/// After maturity, redemption allowed for individual tranche tokens, with the determined conversion rate
/// @dev new instance is generated for each vault
contract Splitter{
  // using SafeCastLib for uint256; 
  // using SafeTransferLib for ERC20;
  // using FixedPointMathLib for uint256;

  // tVault underlying; 
  // tToken senior;
  // tToken junior;  

  // //weight is in PRICE_PRECISION 6, i.e 5e5 = 0.5
  // uint256 junior_weight; 
  // uint256 public PRICE_PRECISION; 
  // uint256 promised_return; 
  // uint256 immutable vaultId; 

  // //Redemption Prices 
  // uint256 s_r; 
  // uint256 j_r;

  // address public immutable trancheMasterAd;

  // constructor(
  //   tVault _underlying, //underlying vault token to split 
  //   uint256 _vaultId, 
  //   address _trancheMasterAd
  //   ){
  //   underlying = _underlying; 

  //   senior = new tToken(_underlying, 
  //     "senior", 
  //     string(abi.encodePacked("se_", _underlying.symbol())), 
  //     address(this), 
  //     true,
  //     _vaultId);

  //   junior = new tToken(_underlying,
  //     "junior", 
  //     string(abi.encodePacked("ju_", _underlying.symbol())), 
  //     address(this), 
  //     false,
  //     _vaultId);

  //   junior_weight = underlying.getJuniorWeight(); 
  //   promised_return = underlying.getPromisedReturn(); 
  //   PRICE_PRECISION = underlying.PRICE_PRECISION(); 
  //   vaultId = _vaultId; 
  //   trancheMasterAd = _trancheMasterAd; 
  // }

  // /// @notice accepts token_to_split and mints s,j tokens
  // /// ex. 1 vault token-> 0.3 junior and 0.7 senior for weight of 0.3, 0.7
  // function split(ERC20 token_to_split, uint256 amount) external returns(uint, uint) {
  //   require(token_to_split == underlying, "Wrong Splitter");

  //   token_to_split.safeTransferFrom(msg.sender, address(this), amount); 

  //   uint junior_token_mint_amount = (amount * junior_weight)/PRICE_PRECISION;  
  //   uint senior_token_mint_amount = amount - junior_token_mint_amount; 

  //   junior.trustedMint(msg.sender, junior_token_mint_amount); 
  //   senior.trustedMint(msg.sender, senior_token_mint_amount);

  //   return (junior_token_mint_amount, senior_token_mint_amount); 

  // }

  // /// @notice aceepts junior and senior token and gives back token_to_merge(tVault tokens)
  // /// Function to call when redeeming before maturity
  // /// @param token_to_merge is the valut token
  // /// @param junior_amount is amount of junior tokens user want to redeem
  // /// @dev senior amount is automiatically computed when given junior amount 
  // function merge(ERC20 token_to_merge, uint256 junior_amount) external returns(uint){
  //   require(token_to_merge == underlying, "Wrong Splitter");
  //   uint senior_multiplier = (PRICE_PRECISION *(PRICE_PRECISION - junior_weight))/junior_weight; //ex 2.3e6
  //   uint senior_amount = (senior_multiplier * junior_amount)/PRICE_PRECISION; 
  //   require(senior.balanceOf(msg.sender) >= senior_amount, "Not enough senior tokens"); 

  //   junior.trustedburn(msg.sender, junior_amount);
  //   senior.trustedburn(msg.sender, senior_amount);
  //   underlying.transfer(msg.sender, junior_amount+senior_amount); 
  //   return junior_amount + senior_amount; 
  // }


  // /// @notice only can called after set maturity by tranche token holders
  // function redeem_after_maturity(tToken _tToken, uint256 amount) external {
  //   require(underlying.isMatured(), "Vault not matured");
  //   require(address(_tToken) == address(senior) || address(_tToken) == address(junior), "Wrong Tranche Token");
  //   require( (s_r>=0 || j_r>=0), "redemption price not set"); 

  //   bool isSenior = (address(_tToken) == address(senior)) ? true : false; 
  //   uint redemption_price = isSenior? s_r: j_r; 
  //   uint token_redeem_amount = (redemption_price * amount)/PRICE_PRECISION; 

  //   _tToken.trustedburn(msg.sender, amount); 
  //   underlying.transfer(msg.sender, token_redeem_amount); 
      
  // }


  // /// @notice calculate and store redemption Price for post maturity 
  // /// @dev should be only called once right after tToken matures, as totalSupply changes when redeeming 
  // /// also should be called by a keeper bot at maturity 
  // function calcRedemptionPrice() public {
  //   require(underlying.isMatured(), "Vault not matured"); 

  //   uint promised_return = underlying.getPromisedReturn(); //in 1e6 decimals i.e 5000 is 0.05

  //   uint real_return = underlying.getCurrentRealReturn(); 

  //   uint _s_r = ((PRICE_PRECISION + promised_return)* PRICE_PRECISION/(PRICE_PRECISION+real_return)); 

  //   uint max_s_r = (PRICE_PRECISION*PRICE_PRECISION/(PRICE_PRECISION - junior_weight));  

  //   s_r = min(_s_r, max_s_r);

  //   uint num = underlying.totalSupply() - senior.totalSupply().mulDivDown(s_r, PRICE_PRECISION); 

  //   j_r = num.mulDivDown(PRICE_PRECISION, junior.totalSupply()); 
  // }

  // /// @notice returns Price of senior vs underlying
  // function getPsu() public view returns(uint256){
  //     return 1; 
  // }

  // /// @notice returns Price of junior vs underlying
  // function getPju() public view returns(uint256){
  //     return 1; 
  // }

  // /// @dev need to return in list format to index it easily 
  // /// 0 is always senior 
  // function getTrancheTokens() public view returns(address[] memory){
  //   address[] memory addresses = new address[](2);
  //   addresses[0] =  address(senior); 
  //   addresses[1] =  address(junior); 
  //   return addresses; 
  // }

  // function getRedemptionPrices() public view returns(uint, uint){
  //     return (s_r, j_r); 
  // }

  // function max(uint256 a, uint256 b) internal pure returns (uint256) {
  //     return a >= b ? a : b;
  // }

  // function min(uint256 a, uint256 b) internal pure returns (uint256) {
  //     return a <= b ? a : b;
  // }
}








  // constructor(
  //     ERC20 _asset, 
  //     string memory _name,
  //     string memory _symbol, 
  //     address _splitter
  // ) ERC20(_name, _symbol, _asset.decimals()) {
  //     asset = _asset;
  //     splitter = _splitter; 
  // }