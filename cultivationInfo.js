function getAvatarUrl(stage) {
  if (stage == 0) {
    return avatarUrls[0];
  }
  stage = stage - 1;
  var avatarNumber = stage / 3;
  return avatarUrls[Math.floor(avatarNumber)];
}

var qiNames = ["", "Nether", "Elemental", "Space", "Paragon"];

var avatarUrls = [
  "url('./Assets/avatar01.gif')",
  "url('./Assets/avatar02.gif')",
  "url('./Assets/avatar03.gif')",
  "url('./Assets/avatar04.gif')",
  "url('./Assets/avatar05.gif')",
  "url('./Assets/avatar06.gif')",
];

var spiritualRootsArray = [
  "None",
  "Broken",
  "Common",
  "Above-average",
  "Exceptional",
  "Elemental",
  "Tri-elemental",
  "Penta-elemental",
  "Perfected",
  "Prismatic",
  "Transcendental"
];

var stageArray = [
  "Untrained Citizen",
  "Body Tempering - Unstable",
  "Body Tempering - Stable",
  "Body Tempering - Peak",
  "Qi Refining - Unstable",
  "Qi Refining - Stable",
  "Qi Refining - Peak",
  "Foundation Establishment - Unstable",
  "Foundation Establishment - Stable",
  "Foundation Establishment - Peak",
  "Nascent Soul - Unstable",
  "Nascent Soul - Stable",
  "Nascent Soul - Peak",
  "Saint - Unstable",
  "Saint- Stable",
  "Saint - Peak",
  "Ascendant - Unstable",
  "Ascendant - Stable",
  "Ascendant - Peak",
];

var baseBreakthroughCost = 5000;
var breakthroughGrowRate = 1.2; //TODO : Adjust this

var milestoneLevels = [10, 25, 50, 100, 250, 500, 1000, 5000, 10000]
var baseLocalMultipliers = [
  [2, 10, 100, 180, 360, 985, 2000, 10000, 25000, 100000],
  [2, 4, 50, 111, 222, 555, 1020, 2666, 8888, 20000],
  [2, 8, 22, 44, 111, 388, 660, 1800, 4495, 9999],
  [2, 5, 10, 30, 62, 155, 312, 600, 1200, 3333],
  [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
  [2, 4, 7, 14, 28, 55, 100, 212, 444, 895],
  [2, 5, 7, 12, 25, 44, 88, 250, 500, 777],
  [2, 3, 6, 12, 22, 33, 77, 200, 333, 500],
  [2, 4, 6, 12, 20, 29, 66, 112, 180, 250],
  [2, 5, 8, 11, 15, 21, 33, 56, 80, 100],

  [2, 5, 8, 11, 15, 21, 33, 56, 80, 100],
  [2, 5, 8, 11, 15, 21, 33, 56, 80, 100],
  [2, 5, 8, 11, 15, 21, 33, 56, 80, 100],
  [2, 5, 8, 11, 15, 21, 33, 56, 80, 100],
  [2, 5, 8, 11, 15, 21, 33, 56, 80, 100],
  [2, 5, 8, 11, 15, 21, 33, 56, 80, 100],
  [2, 5, 8, 11, 15, 21, 33, 56, 80, 100],
  [2, 5, 8, 11, 15, 21, 33, 56, 80, 100],
  [2, 5, 8, 11, 15, 21, 33, 56, 80, 100],
  [2, 5, 8, 11, 15, 21, 33, 56, 80, 100],
];

function getMilestone(level) {
  //binary search probably useless since nmax = 10
  var i = milestoneLevels.length - 1;
  if (level < 10) {
    return 0;
  }
  while (level < milestoneLevels[i]) {
    i--;
  }
  return milestoneLevels[i];
}

function getMilestoneIndex(level) {
  if (level < 25) {
    return 0;
  }
  
  for (var i = 0; i < milestoneLevels.length; i++) {
    if (milestoneLevels[i] == level) {
      return i;
    }
  }

  return 0;
}

class Mission {
  constructor(duration, reward, action, location, state) {
    this.duration = duration;
    this.reward = reward;
    this.action = action;
    this.location = location;
    this.state = 0;
    this.progress = 0;
  }
}

var missions = [];
var actionNames = [
  "Hunt a demon",
  "Save a sect member",
  "Rescue a princess",
  "Find a rare herb",
  "Slay a dragon",
  "Explore a tomb",
  "Defeat a rival sect",
  "Win a tournament",
  "Heal a patient"
];

class Cultivator {
  constructor(name, stage, avatar) {
    this.name = name;
    this.stage = stage;
    this.avatar = avatar;
    this.mission = null;
    this.trainingStartTime = null;
  }
}
var sectMembers = [
  new Cultivator("Sect Master", 11, 1),
  new Cultivator("Senior Brother", 6, 0),
  new Cultivator("Junior Sister", 4, 1),
];
var sectMemberAvatarUrls = [
  "./Assets/member01.gif",
  "./Assets/member02.gif",
  "./Assets/member03.gif",
]
var trainingBaseCosts = [
  0,0,0,0,500,550,600,2000,2500,3000,12000,13000,14000,60000,65000,70000,240000,300000,500000
];
var trainingBaseTime = [
  0,0,0,0,2800,3200,3600,7200,9000,10800,43200,46800,50400,172800,187200,201600, 604800, 691200,777600
];