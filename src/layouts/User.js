import React from "react";
import { useGlobalState } from "../util/state";

const UserLayout = props => {
  const [address] = useGlobalState("address");
  const [network] = useGlobalState("network");

  function butttonOrAddress() {
    if (address == null) {
      return (
        <button
          className="btn btn-outline-info my-2 my-sm-0"
          type="submit"
          onClick={() => {
            props.onConnect();
          }}
        >
          Connect
        </button>
      );
    } else {
      return (
        <label style={{ overflow: "hidden", textOverflow: "ellipsis", color: "gray" }}>
          {address.substring(0,6)}...{address.substr(address.length-4,4)}
        </label>
      );
    }
  }

  return (
    <React.Fragment>
      <nav className="navbar navbar-light bg-light" style={{ backgroundColor: "#FFF !important" }}>
        <a href="/#" className="navbar-brand">
          <img style={{ width: 200 }} src="./img/swipe-logo2.png" alt="" />
        </a>
        
        {butttonOrAddress()}
      </nav>

      <div>{props.children}</div>
    </React.Fragment>
  );
};

export default UserLayout;
