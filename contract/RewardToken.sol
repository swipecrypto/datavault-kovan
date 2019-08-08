pragma solidity ^0.5.0;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/release-v2.3.0/contracts/token/ERC20/ERC20Detailed.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/release-v2.3.0/contracts/token/ERC20/ERC20Burnable.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/release-v2.3.0/contracts/token/ERC20/ERC20Mintable.sol";

contract RewardToken is ERC20Detailed, ERC20Mintable {

    constructor () public ERC20Detailed("Reward Token", "USDR", 0) {
        _mint(msg.sender, 1000000000 * (10 ** uint256(decimals())));
    }
    
}