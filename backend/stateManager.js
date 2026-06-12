const matchState = {
  team: "IND",
  runs: 0,
  wickets: 0,
  balls: 0,

  p1Name: "V. Kohli",
  p1Runs: 0,

  p2Name: "KL Rahul",
  p2Runs: 0,

  thisOverTimeline: []
};

module.exports = {
  getState: () => matchState,

  updateState: (newState) => {
    Object.assign(matchState, newState);
    return matchState;
  },

  resetState: () => {
    matchState.team = "IND";
    matchState.runs = 0;
    matchState.wickets = 0;
    matchState.balls = 0;

    matchState.p1Name = "V. Kohli";
    matchState.p1Runs = 0;

    matchState.p2Name = "KL Rahul";
    matchState.p2Runs = 0;

    matchState.thisOverTimeline = [];

    return matchState;
  }
};