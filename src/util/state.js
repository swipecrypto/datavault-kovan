import { createGlobalState } from 'react-hooks-global-state';

const initialState = { address: null,web3:null, network: null };
const { GlobalStateProvider, useGlobalState } = createGlobalState(initialState);


export { GlobalStateProvider, useGlobalState };
