import React,{useEffect,useState} from "react";
import {useGlobalState} from "../util/state";
import erc20Abi from '../contract/erc20Abi';
import dataVaultAbi from '../contract/dataVaultAbi';
import swal from '@sweetalert/with-react';

const tokenAddress ='0x13d71cfc90a83cd1cc0e59675c3f4b90d4162a8b';
const contractAddress ='0xcb9c842b1813c941bb5ab97f147170b959308ac4';


const StakingRegistration = (props) => {

  const [address] = useGlobalState("address");
  const [web3] = useGlobalState("web3");
  const [symbol,setSymbol] = useState('SWIPE');
  const [allowance,setAllowance] = useState(0);
  const [decimals,setDecimals] = useState(0);
  const [isLoaded,setLoaded]=useState(false);
  const [erc20Contract,setErc20Contract]=useState(null);
  const [stakingAmount,setStakingAmount] = useState(0);
  const [stakingPeriod,setStakingPeriod] = useState(0);
  const [staking,setStaking] = useState(false);
  const [approving,setApproving] = useState(false);
  const enabled = address != null && allowance >= stakingAmount && stakingAmount > 0;
  const allowed = allowance<stakingAmount;
  useEffect(() => {
    if(address && isLoaded===false){
      init();
    }
  });

  async function init(){
    if(web3) {
      const erc20 = new web3.eth.Contract(erc20Abi,tokenAddress);
      const symbol = await erc20.methods.symbol().call();
      setErc20Contract(erc20);
      setSymbol(symbol);
      let allowance = await erc20.methods.allowance(address,contractAddress).call();
      const decimalPlace = await erc20.methods.decimals().call();
      setDecimals(decimalPlace);
      allowance = allowance/(10**decimalPlace);
      setAllowance(allowance);
      setLoaded(true);
    }
  }

  async function stake(e){
    e.preventDefault();
    if(address==null){
      window.alert("please connect metamask first");
      return;
    }

    if(stakingAmount===0){
      window.alert("stacking amount cannot empty");
      return;
    }

    try {
      // check allowence if not enough add allowence
      if(allowance<stakingAmount){
        let increaseAmount = stakingAmount-allowance;
        if (window.confirm("Increase allowance of "+increaseAmount+" SWIPE token?")) {
          setApproving(true);
          window.document.getElementById('approveBtn').disabled = true;
          const result = await erc20Contract.methods.increaseAllowance(contractAddress,increaseAmount*10**decimals).send({from: address})
          setAllowance(allowance+increaseAmount)

          const txHash = result.transactionHash;
          const etherScanURL = "https://kovan.etherscan.io/tx/" + txHash
          const el = document.createElement('div')
          el.innerHTML = "<a target='_blank' href=" + etherScanURL + ">View on Etherscan </a>";
          swal({
            title: "Increase Allowance is Successful",
            content: el,
            icon: "success",
            button: "Ok",
          });
          setApproving(false);
          return;
        }
      }else{
        setStaking(true);
        window.document.getElementById('stakeBtn').disabled = true;
        const stakeContract = new web3.eth.Contract(dataVaultAbi,contractAddress);
        let result= await stakeContract.methods.stake(stakingAmount*10**decimals, stakingPeriod * 86400).send({from: address});

        setStakingAmount(0);
        setStakingPeriod(0);
        init();
        const txHash = result.transactionHash;
        const etherScanURL = "https://kovan.etherscan.io/tx/" + txHash
        const el = document.createElement('div')
        el.innerHTML = "<a target='_blank' href=" + etherScanURL + ">View on Etherscan </a>";
        
        swal({
          title: "DataVault Staking is Successful ",
          content: el,
          icon: "success",
          button: "Ok",
        }).then(function() {
          window.location = "/#/";
        });
        setStaking(false);
      }
    } catch (error) {
      let errorMessage;
      if (error && error.message) {
        if (error.message === 'Returned error: Error: MetaMask Tx Signature: User denied transaction signature.') {
          errorMessage = "Transaction Rejected";
        } else {
          errorMessage = error.message
        }
      }
      swal(errorMessage, "Error", "error");
      setStakingAmount(0);
      init()
    }

  }


  return (
    <React.Fragment>
      <section id="staking-registration">
        <div className="sr-wrapper">
          <div className="sr-header">
            <span>DataVault (Current Allowance {allowance} {symbol})</span>
          </div>
          <div className="sr-body">
            <p style={{ fontSize: 14 }}>Please enter your Staking Information.</p>
            <form>
              <div className="form-group sr-form-group row">
                <label className="col-4 col-form-label sr-label">Staking Amount</label>
                <div className="col-8">
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control form-control-lg sr-form-control"
                      placeholder="SWIPE Amount"
                      aria-label="SWIPE Amount"
                      aria-describedby="basic-addon2"
                      value={stakingAmount}
                      onChange={e=>setStakingAmount(e.target.value)}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text sr-input-group-text">SWIPE</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group sr-form-group row">
                <label className="col-4 col-form-label sr-label">Staking Period</label>
                <div className="col-8">
                  <div className="input-group">
                    <select className="form-control  form-control-lg sr-form-control" onChange={e => setStakingPeriod(e.target.value)}>
                      <option value="0" selected>Select lockup period</option>
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-group sr-form-group row">
                <label className="col-4 col-form-label sr-label"></label>
                <div className="col-8">
                  <button id="approveBtn" disabled={!allowed} className="btn btn-staking-registration btn-md" onClick={stake}>{approving ? 'Approving...' : 'Approve'}</button>
                  <button id="stakeBtn" disabled={!enabled} className="btn btn-staking-registration btn-md" onClick={stake}>{staking ? 'Staking...' : 'Stake'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default StakingRegistration;
