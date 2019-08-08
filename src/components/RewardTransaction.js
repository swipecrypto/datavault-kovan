import React,{useState} from "react";
import {useGlobalState} from "../util/state";
import dataVaultAbi from '../contract/dataVaultAbi';
const contractAddress ='0xcb9c842b1813c941bb5ab97f147170b959308ac4';

const RewardTransaction = () => {

  const [address] = useGlobalState("address");
  const [web3] = useGlobalState("web3");
  const [rewardTrxId,setRewardTrxId] = useState(0);


  async function rewardTransaction(){
    if(!web3){
      window.alert('please connect first');
      return;
    }
    let contract = new web3.eth.Contract(dataVaultAbi,contractAddress);
    await contract.methods.rewardTransaction(rewardTrxId).send({from: address})

  }

  return (
    <React.Fragment>
      <section id="data-vault-admin">
        <div className="section-wrapper data-vault-admin-wrapper">
          <div className="dv-widget-wrapper admin-add-reward-wrapper">
            <div className="dv-widget-title admin-add-reward-title">
              <span>Reward Transaction</span>
            </div>
            <div className="dv-widget-body admin-add-reward-body">
              <form>
                <div className="form-group sr-form-group row">
                  <label className="col-4 col-form-label sr-label">Transaction ID</label>
                  <div className="col-8">
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control form-control-lg sr-form-control"
                        placeholder="Transaction ID"
                        aria-label="Transaction ID"
                        value={rewardTrxId}
                        onChange={e=>setRewardTrxId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group sr-form-group row">
                  <label className="col-4 col-form-label sr-label" />
                  <div className="col-8">
                    <button className="btn btn-sm btn-primary" onClick={rewardTransaction}>Proccess</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default RewardTransaction;
