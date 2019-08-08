import React, { useEffect, useState } from "react";
import { useGlobalState } from "../util/state";
import erc20Abi from "../contract/erc20Abi";
import dataVaultAbi from "../contract/dataVaultAbi";
import moment from "moment";
import swal from "@sweetalert/with-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

const tokenAddress = "0x13d71cfc90a83cd1cc0e59675c3f4b90d4162a8b";
const contractAddress = "0xcb9c842b1813c941bb5ab97f147170b959308ac4";

const HomeUser = props => {
  const [address] = useGlobalState("address");
  const [web3] = useGlobalState("web3");
  const [balance, setBalance] = useState(0);
  const [symbol, setSymbol] = useState("SWIPE");
  const [loaded, setLoaded] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (address && loaded == false && web3) {
      init();
      setLoaded(true);
    }
  });

  async function init() {
    if (web3) {

      web3.eth.net.getId().then(netId => {
        switch (netId) {
          case 42:
            console.log('This is the kovan test network.')
            break
          default:
            swal("Invalid network","You must change your connection to Kovan Testnet", "warning")
        }
      })

      let erc20 = new web3.eth.Contract(erc20Abi, tokenAddress);
      let symbol = await erc20.methods.symbol().call();
      setSymbol(symbol);
      let balance = await erc20.methods.balanceOf(address).call();
      let decimals = await erc20.methods.decimals().call();
      balance = balance / 10 ** decimals;
      setBalance(balance.toLocaleString(navigator.language, { minimumFractionDigits: 0 }));
      getTrx(decimals);
    }
  }

  async function getTrx(decimals) {
    const stakeContract = new web3.eth.Contract(dataVaultAbi, contractAddress);
    let listTrx = await stakeContract.methods.checkTrxsId().call({ from: address });
    let worker = [];
    let ids = [];
    //console.log(listTrx);
    listTrx.forEach(item => {
      worker.push(stakeContract.methods.detailStake(item).call({ from: address }));
      ids.push(item);
    });

    Promise.all(worker).then(results => {
      console.log(results);
      let listTrx = [];

      results.forEach((item, index) => {
        listTrx.push({
          trxId: ids[index],
          amount: item[0] / 10 ** decimals,
          expiry: item[1],
          active: item[2] == true ? "Active" : "Completed",
          reward: item[3],
          rewarded: item[4],
          canWithdraw: !item[4] && new Date().getTime() / 1000 > item[1]
        });
      });
      // console.log(new Date().getTime())
      setTransactions(listTrx);
    });
  }

  async function withdraw(trxId) {
    // console.log('transaction id = ',trxId);
    try {
      const stakeContract = new web3.eth.Contract(dataVaultAbi, contractAddress);
      let result = await stakeContract.methods.withdraw(trxId).send({ from: address });

      const txHash = result.transactionHash;
      const etherScanURL = "https://kovan.etherscan.io/tx/" + txHash;
      const el = document.createElement("div");
      el.innerHTML = "<a target='_blank' href=" + etherScanURL + ">View on Etherscan </a>";
      swal({
        title: "Transaction Withdrawal is Successful",
        content: el,
        icon: "success",
        button: "Ok"
      });
      init();
      // console.log(result);
    } catch (error) {
      console.log("error message", error.message);
      let errorMessage;
      if (error && error.message) {
        if (error.message === "Returned error: Error: MetaMask Tx Signature: User denied transaction signature.") {
          errorMessage = "Transaction Rejected";
        } else {
          errorMessage = error.message;
        }
      }
      swal(errorMessage, "Error", "error");
    }
  }

  return (
    <React.Fragment>
      <section id="data-vault-home">
        <div className="section-wrapper data-vault-home-wrapper">
          <div className="dv-widget-body">
            <div className="data-vault-home-header">
              <div className="home-balance-wrapper">
                <span className="home-balance-title text-muted">Balance :</span> <br />
                <span className="home-balance-amount">
                  {balance}
                  <span className="home-balance-currency"> {symbol}</span>
                </span>
              </div>
              <div className="home-add-stake-wrapper text-right">
                <a href="/#/stake" className="btn btn-sm btn-outline-info my-2 my-sm-0">
                  Add Stake
                </a>
              </div>
            </div>

            <br />

            <div className="dv-transaction-wrapper">
              <div className="dv-transaction-title mb-2 mb-sm-0">
                <strong>Current Staking Transactions</strong>
                <br />
              </div>
              <div className="dv-transaction-body">
                <Table className="table">
                  <Thead>
                    <Tr>
                      <Th>Trx ID</Th>
                      <Th>Amount</Th>
                      <Th>Reward</Th>
                      <Th>Expiry Date</Th>
                      <Th>Status</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {transactions.map((item, index) => {
                      return (
                        <Tr key={item.trxId}>
                          <Td>{item.trxId}</Td>
                          <Td>{item.amount.toLocaleString(navigator.language, { minimumFractionDigits: 0 })}</Td>
                          <Td>{item.reward.toLocaleString(navigator.language, { minimumFractionDigits: 0 })}</Td>
                          <Td>{moment.unix(item.expiry).format("DD MMM YYYY HH:mm")}</Td>
                          <Td>{item.active}</Td>
                          {item.canWithdraw == false && <Td>-</Td>}
                          {item.canWithdraw == true && (
                            <Td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                  withdraw(item.trxId);
                                }}
                              >
                                {" "}
                                withdraw
                              </button>
                            </Td>
                          )}
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default HomeUser;