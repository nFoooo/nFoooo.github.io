var treeConfig = {
  container: "#talent-tree",

};

var roots_node = {
  innerHTML : "#spiritual-roots-talent-node"
};

var basic_speed_node = {
  parent: roots_node,
  innerHTML : "#basic-speed-talent-node"
};
var basic_efficiency_node = {
  parent: roots_node,
  innerHTML : "#basic-efficiency-talent-node"
};
var intermediate_speed_node = {
  parent: basic_speed_node,
  innerHTML : "#intermediate-speed-talent-node"
};
var intermediate_efficiency_node = {
  parent: basic_efficiency_node,
  innerHTML : "#intermediate-efficiency-talent-node"
};
var advanced_speed_node = {
  parent: intermediate_speed_node,
  innerHTML : "#advanced-speed-talent-node"
};
var advanced_efficiency_node = {
  parent: intermediate_efficiency_node,
  innerHTML : "#advanced-efficiency-talent-node"
};

var simple_chart_config = [
  treeConfig, roots_node,
  basic_speed_node, basic_efficiency_node, intermediate_speed_node, intermediate_efficiency_node, advanced_speed_node, advanced_efficiency_node
];

class Talent {
  constructor(rank, maxRank, cost, type) {
    this.rank = rank;
    this.maxRank = maxRank;
    this.cost = cost;
    this.type = type;
  }
}

var rootTalent = new Talent(0, 10, 25, "roots");
var basicSpeedTalent = new Talent(0, 10, 10, "basic-speed");
var basicEfficiencyTalent = new Talent(0, 50, 10, "basic-efficiency");
var intermediateSpeedTalent = new Talent(0, 10, 10, "intermediate-speed");
var intermediateEfficiencyTalent = new Talent(0, 50, 10, "intermediate-efficiency");
var advancedSpeedTalent = new Talent(0, 10, 10, "advanced-speed");
var advancedEfficiencyTalent = new Talent(0, 50, 10, "advanced-efficiency");

function getEfficiencyTalentMultiplier(i) {
  if (i < 3) {
    return 1 + basicEfficiencyTalent.rank * .25;
  }
  else if (i < 6) {
    return 1 + intermediateEfficiencyTalent.rank * .25;
  }
  else {
    return 1 + advancedEfficiencyTalent.rank * .25;
  }
}

function getSpeedTalentMultiplier(i) {
  if (i < 3) {
    return 1 - basicSpeedTalent.rank * .05;
  }
  else if (i < 6) {
    return 1 - intermediateSpeedTalent.rank * .05;
  }
  else {
    return 1 - advancedSpeedTalent.rank * .05;
  }
}