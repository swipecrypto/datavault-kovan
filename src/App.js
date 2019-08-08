import React, {useEffect} from "react";
import "./App.css";
import { Route, HashRouter } from "react-router-dom";
import UserLayout from "./layouts/User";
import HomeUser from "./pages/user/Home";
import HomeAdmin from "./pages/admin/Home";
import StakingRegistrationPage from "./pages/user/StakingRegistration";
import connector from './util/connector';
import {GlobalStateProvider,useGlobalState} from './util/state';
import localstorage from "./util/localstorage";

const App=() => {
  return (
    <GlobalStateProvider>
      <RouteApp/>
    </GlobalStateProvider>
  );
}


const RouteApp = () => {
  const [address, setAddress] = useGlobalState("address");
  const [network, setNetwork] = useGlobalState("network");
  const [web3, setWeb3] = useGlobalState("web3");

  const savedAddress = localstorage.getAddress();
  const savedNetwork = localstorage.getNetwork();

  if(savedAddress !== null) {
    setAddress(savedAddress);
    getWeb3();
  }

  if(savedNetwork !== null) {
    setNetwork(savedNetwork);
  }

  async function getWeb3() {
    let web3Instance;
    try{
      web3Instance = await connector.getWeb3();
    }catch(err){
        window.alert(err);
        return;
    }
    setWeb3(web3Instance);
  }

  async function connect(){
    if (!connector.haveMetamask()) {
      window.alert('Please install MetaMask first.');
        return;
    }
    let web3Instance;

    try{
      web3Instance = await connector.getWeb3();
    }catch(err){
        window.alert(err);
        return;
    }
    setWeb3(web3Instance);

    const coinbase = await web3Instance.eth.getCoinbase();
    if (!coinbase) {
        window.alert('Please activate MetaMask first.');
        return;
    }
    
    const publicAddress = coinbase.toLowerCase();
    setAddress(publicAddress);
    localstorage.setAddress(publicAddress);
  }

  return (
    <HashRouter>
      <UserLayout onConnect={connect} address={address} network={network}>
        <Route path="/" exact component={HomeUser}/>
        <Route path="/stake"  component={StakingRegistrationPage}/>
        <Route path="/admin"  component={HomeAdmin}/>
      </UserLayout>
    </HashRouter>
  );
};

export default App;
