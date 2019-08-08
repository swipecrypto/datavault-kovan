import React from "react";
import AddRewards from "../../components/AddRewards";
import RewardTransaction from "../../components/RewardTransaction";

const Home = props => {
  return (
    <React.Fragment>
      <AddRewards />
      <RewardTransaction />
    </React.Fragment>
  );
};

export default Home;
