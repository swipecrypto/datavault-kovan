pragma solidity ^0.5.0;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/release-v2.3.0/contracts/token/ERC20/ERC20.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/release-v2.3.0/contracts/lifecycle/Pausable.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/release-v2.3.0/contracts/ownership/Ownable.sol";

contract DataVaultContract is Ownable, Pausable {
  
   /**  
    * @dev Details of each stake 
    * @param contract_ contract address of ER20 token to transfer 
    * @param to_ sender account 
    * @param amount_ number of tokens to stake
    * @param active_ if the stake is active
    * @param reward_ number of reward tokens
    */  
    struct Stake {  
        address to_;  
        uint amount_;  
        uint stakeExpiry_;
        bool active_;  
        uint reward_;
        bool rewarded_;
    }
    
    mapping(address=>uint256[]) mapUserTrxs;
    ERC20 token;
    ERC20 rewardToken;
    uint256 unclaimedReward;

    constructor (ERC20 _token, ERC20 _rewardToken) public{
        token=_token;
        rewardToken = _rewardToken;
        unclaimedReward = 0;
    }
    
    /**  
     * @dev a list of all transfers successful or unsuccessful 
     */  
    Stake[] public transactions;  
    
    /**  
     * @dev Event to notify if transfer successful or failed 
     * after staking verified
     */  
    event TransferSuccessful(address indexed from_, address indexed to_, uint256 amount_);  
    
    event TransferFailed(address indexed from_, address indexed to_, uint256 amount_);  
    
    /**  
     * @dev method that handles staking of SWIPE/data token 
     * it assumes the calling address has approved this contract 
     * as spender
     * @param _amount numbers of token to transfer 
     */  
    function stake(uint256 _amount, uint _duration) public whenNotPaused returns (uint256){  
        require(_amount > 0);
        require(_amount <= checkAllowance());  

        uint256 transactionId = transactions.push(  
            Stake({  
                to_: msg.sender,  
                stakeExpiry_: now + _duration, // expiry date can be set + x days etc in seconds
                amount_: _amount,  
                active_: true,
                reward_: 0,
                rewarded_: false
            })  
        )-1;  
        
        mapUserTrxs[msg.sender].push(transactionId);
        token.transferFrom(msg.sender, address(this), _amount);
        return transactionId;
    }
    
    /**  
     * @dev method to withdraw stake token and reward
     * reward is transferred if balance is sufficent
     * @param _transactionId transaction Id for withdrawal
     */  
    function withdraw(uint256 _transactionId) public  {
        require(transactions[_transactionId].to_ == msg.sender);
        require(transactions[_transactionId ].stakeExpiry_ < now, 
            "Stake is not expired!");
        require(transactions[_transactionId].active_ == true);
        token.transfer(msg.sender, transactions[_transactionId].amount_);
        transactions[_transactionId].active_ = false;
        
        emit TransferSuccessful(address(this), msg.sender, transactions[_transactionId].amount_);  
        
        if (rewardBalance() >= transactions[_transactionId].reward_ ) {
            _disburseReward(_transactionId);
        }

        
    }
    
    /**
     * @dev disburse rewards for staking
     * @param _transactionId transactionId of the staking
     */ 
    function _disburseReward (uint256 _transactionId) internal {
        require(transactions[_transactionId].active_ == false);
        require(transactions[_transactionId].rewarded_ == false);
        require(rewardBalance() >= transactions[_transactionId].reward_);
        if (transactions[_transactionId].reward_ > 0) {
            rewardToken.transfer(transactions[_transactionId].to_, transactions[_transactionId].reward_);
            
            unclaimedReward -= transactions[_transactionId].reward_;
            emit TransferSuccessful(address(this), transactions[_transactionId].to_, transactions[_transactionId].reward_);  
        }
        transactions[_transactionId].rewarded_ = true;
    }
    
    /**
     * @dev manual disbursement of rewards for staking
     * @param _transactionId transactionId of the staking
     */
    function rewardTransaction (uint256 _transactionId) public onlyOwner {
        _disburseReward(_transactionId);
    }
    
    /**
     * @dev add reward to the transaction upon mission completion
     * @param _transactionId transactionId to receive reward
     * @param _reward no of reward
     */
    function addReward(uint256 _transactionId, uint _reward) public onlyOwner {
        transactions[_transactionId].reward_ += _reward;
        unclaimedReward += _reward;
    }
    
    /**
     * @dev withdraw reward from contract
     * @param _beneficiary address to receive reward coin/token
     * @param _amount withdrawal amount
     */
    function withdrawReward(address _beneficiary, uint256 _amount) public onlyOwner {
        rewardToken.transfer(_beneficiary, _amount);
    }
    
    /**  
     * @dev allow contract to receive funds 
     */  
    function() external payable { }
  
    /**  
     * @dev withdraw funds from this contract 
     * @param _beneficiary address to receive ether 
     */  
    function withdrawAll(address payable _beneficiary) public payable onlyOwner {  
        _beneficiary.transfer(address(this).balance);  
    }
    
    /**
     * @dev get transaction ids from sender 
     */
    function checkTrxsId() public view returns (uint256[] memory){
        return mapUserTrxs[msg.sender];
    }
    
    /**
     * @dev check sender allowance for staking
     */
    function checkAllowance () public view whenNotPaused returns (uint256){
        return token.allowance(msg.sender, address(this));
    }
    
    /**
     * @dev check whether staking transaction has expired
     * Expired staking allow withdrawal and reward redemption
     * @param _transactionId transaction id of the staking
     */
    function hasExpired (uint256 _transactionId) public view returns (bool) {
        require(transactions[_transactionId].to_ == msg.sender || isOwner());
        return transactions[_transactionId].stakeExpiry_ < now;
    }
    
    /**
     * @dev check the balance of rewards of the contract
     */
    function rewardBalance() public view whenNotPaused returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }
    
    /**
     * @dev check the unclaimed rewards of the contract
     */
    function checkUnclaimedReward() public view whenNotPaused returns (uint256) {
        return unclaimedReward;
    }
    
    /**
     * @dev get stake details based on tx ID
     * @param _transactionId transactionId of the staking
     */
    function detailStake(uint256 _transactionId) public view returns (uint,uint,bool,uint,bool){
         require(transactions[_transactionId].to_ == msg.sender || isOwner());
         Stake memory s = transactions[_transactionId];
         return (s.amount_,s.stakeExpiry_,s.active_,s.reward_,s.rewarded_);
    }
    
    function setExpiry(uint256 _transactionId, uint _expiry) public onlyOwner {
        transactions[_transactionId].stakeExpiry_ = _expiry;
    }
}