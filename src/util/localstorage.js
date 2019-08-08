const setAddress = address => localStorage.setItem("address", address);

const getAddress = () => localStorage.getItem("address") || null;

const setNetwork = network => localStorage.setItem("network", network);

const getNetwork = () => localStorage.getItem("network") || null;

export default {
  setAddress,
  getAddress,
  setNetwork,
  getNetwork
};
