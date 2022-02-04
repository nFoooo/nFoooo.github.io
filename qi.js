var generators = [];
var generatorIntervals = [];
var breakthroughCost = [5000, 0, 0, 0, 0];
var buyAmount = 1;
var globalMultiplier = 1;
var maxAmounts= [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var memberTrainingIntervals = [];
var missionTimers = [];
var progressIntervals = [];
var currentTalentPoints = 0;
var totalTalentPoints = 0;
var currentSectPoints = 0;
var totalSectPoints = 0;
var reforgeReward = 0;
var stage = 0;
var currentQi = [0, 0, 0, 0, 0];
var totalQi = [0, 0, 0, 0, 0];
var currentPrestigeQi = [0, 0, 0, 0, 0];
var totalProd = [0, 0, 0, 0, 0];
var sectStrength = 0;
var logOffLength = 0;
var ascensionLevel = 0;

class Generator {
  constructor(level, baseCost, name, baseProduction, baseSpeed, bgClass, action, growthRate, qiType, localMultiplier) {
    this.level = level;
    this.baseCost = baseCost;
    this.name = name;
    this.baseProduction = baseProduction;
    this.production = baseProduction;
    this.baseSpeed = baseSpeed;
    this.bgClass = bgClass;
    this.action = action;
    this.cost = baseCost;
    this.growthRate = growthRate;
    this.qiType = qiType;
    this.localMultiplier = localMultiplier;
  }
}

$(function () {
  //Load Stats and talents
  loadStats();
  loadTalents();
  //Load Multipliers
  loadGenerators();
  //Start Generators
  buildGenerators();
  startGenerators();
  updateGeneratorsQps();
  //Start Auto-Save
  setInterval(function () {
    saveGenerators();
    saveSect();
    saveStats();
    saveTalents();
  }, 1000);
  //Set Html to base state
  resetBaseHtml();
  // Load sect
  loadSect();
  loadTalentTree();
  loadAscension();
})

function addNewRandomMission(i) {
  var randomReward = Math.floor(Math.random() * 100) + 1;
  var randomDuration = 60 + Math.floor(Math.random() * 540);
  var randomLocation = Math.floor(Math.random() * 9); //between 0 and 8
  var randomAction = Math.floor(Math.random() * 9);
  missions[i] = new Mission(randomDuration, randomReward, randomAction, randomLocation);
}

function addQi(qi, type) {
  if (isNaN(qi)) {
    return;
  }
  currentQi[type] = Number(currentQi[type]) + Number(qi);
  if (qi > 0) {
    totalQi[type] = Number(totalQi[type]) + Number(qi);
    currentPrestigeQi[type] = Number(currentPrestigeQi[type]) + Number(qi);
    updateCurrentPrestigeQiDisplay();
  }
  updateCurrentQiDisplay();
  updateDisplay();

  var talent = getTalentPotential();
  setReforge(talent);
}

function addSectPoints(pts) {
  if (isNaN(pts)) {
    return;
  }
  currentSectPoints = Number(currentSectPoints) + Number(pts);
  if (pts > 0) {
    totalSectPoints = Number(totalSectPoints) + Number(pts);
  }
  setCurrentSectPoints();
}

function ascend() {
  ascensionLevel = ascensionLevel + 1;
  hideAscension();
  if (ascensionLevel == 1) {
    showNetherworldTab();
    addQi(10, 1);
  }
}

function autoCultivate(i) {
  var addedQi = 0;
  addedQi += generators[i].production;
  showAddedQi(i, addedQi);
  progressBarForceReset(i);
  addQi(addedQi, generators[i].qiType);
}

function breakthrough() {
  for (var i = 0; i < breakthroughCost.length; i++) {
    if (currentQi[i] < breakthroughCost[i]) {
      toastr.info("Not enough qi")
      return;
    } 
  }

  for (var i = 0; i < breakthroughCost.length; i++) {
    addQi(-breakthroughCost, i);
  }
  
  stage = stage + 1;
  setStage(stage);
  disableBreakthroughButton();
  calculateBreakthroughCost();
  calculateGlobalMultipliers();
  loadAscension();
}

function buildGenerators() {
  for (var i = 0; i < generators.length; i++) {
    buildGenerator(i);
  }
}

function buyGeneratorLevel(i) {
  var cost = generators[i].cost;
  var qiType = generators[i].qiType;
  var increase = buyAmount;
  if (increase == "-1"){
    increase = maxAmounts[i];
  }
  if (currentQi[qiType] < cost) {
    return;
  } 
  addQi(-cost, qiType);

  var wasZero = generators[i].level == 0;
  generators[i].level = generators[i].level + increase;
  if (wasZero) {
    loadNextGenerator(i);
  }

  var currentMilestone = getMilestone(generators[i].level);
  var newMilestone = getMilestone(generators[i].level);
  if (newMilestone > currentMilestone) {
    calculateMilestone(i);
  }

  updateGenerator(i);
}

function calculateGeneratorCost(i) {
  var newCost = 0;
  var amount = buyAmount;
  if (buyAmount == "-1") {
    amount = getMaxLevelsAffordable(i);
    if (amount == 0) {
      amount = 1;
      disableBuyButton(i);
    }
    maxAmounts[i] = amount;
  } 
  newCost = getCost(i, amount);
  generators[i].cost = newCost;
  setGeneratorCost(i);
}

function calculateGeneratorCosts(updateButtons) {
  for (var i = 0; i < generators.length; i++) {
    calculateGeneratorCost(i);
  }
  if (updateButtons){
    updateDisplay();
  }
}

function calculateGeneratorProd(i) {
  if (generators[i].level == 0) {
    generators[i].production = 0;
    updateGeneratorQps(i);
    return;
  }
  var localMultiplier = generators[i].localMultiplier;
  var talentMultiplier = getEfficiencyTalentMultiplier(i);
  var newRate = generators[i].baseProduction * generators[i].level * globalMultiplier * localMultiplier * talentMultiplier;
  generators[i].production = Math.floor(newRate);
  updateGeneratorQps(i);
}

function calculateGeneratorProds() {
  for (var i = 0; i < generators.length; i++){
    calculateGeneratorProd(i);
  }
}

function calculateGenerators() {
  for (var i = 0; i < generators.length; i++) {
    calculateGeneratorProd(i);
  }
}

function calculateBreakthroughCost() {
  var newCost = 0;
  var desiredStage = stage + 1;
  newCost = getBreakthroughCost(desiredStage);
  breakthroughCost[0] = newCost;
  updateBreakthroughCostDisplay();
}

function calculateGlobalMultipliers() {
  var rootMulti = Math.pow(rootTalent.rank, 2);
  if (rootMulti == 1) {
    rootMulti = 2;
  }
  if (rootMulti == 0) {
    rootMulti = 1;
  }
  var historicTalentMulti = 1 + totalTalentPoints * .1;
  var stageMulti = 1 + (.5 * stage) + Math.floor((stage + 2) / 3); //for every major stage (1, 4, 7, etc.) we give 1.5 instead of .5
  var sectMulti = 1;
  if (isSectUnlocked()) {
    sectMulti = sectStrength / 1000;
  }
  var total = historicTalentMulti * stageMulti * sectMulti * rootMulti;
  globalMultiplier = total;
  setGlobalMultipliers(historicTalentMulti, stageMulti, sectMulti, rootMulti, total);
  calculateGeneratorProds();
}

function calculateMilestone(i) {
  if (generators[i].level >= 25) {
    var currentMilestone = getMilestone(generators[i].level);
    var milestoneIndex = getMilestoneIndex(currentMilestone);
    generators[i].localMultiplier = baseLocalMultipliers[i][milestoneIndex];
  }
}

function calculateMilestones() {
  for (var i = 0; i < generators.length; i++) {
    calculateMilestone(i);
  }
}

function calculateSectMemberStrength(i) {
  return sectMembers[i].stage * 110 + (Math.floor((sectMembers[i].stage + 2) / 3) * 490); //Give 500 strength for each major stage (1,4,7, etc.)
}

function changeBuyAmount(amount) {
  buyAmount = amount;
  if (amount == "-1") {
    maxBuys = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  calculateGeneratorCosts(true);
}

function completeMission(i) {
  addSectPoints(missions[i].reward);
  for (var j = 0; j < sectMembers.length; j++) {
    if (sectMembers[j].mission == i)
    {
      sectMembers[j].mission = null;
      setSectMember(j);
    }
  }
  addNewRandomMission(i);
  setMission(i);
}

function completeTraining(i) {
  var member = sectMembers[i];
  member.stage = Number(member.stage) + 1;
  var newStage = stageArray[member.stage];
  member.mission = null;
  member.trainingStartTime = null;
  clearInterval(memberTrainingIntervals[i]);
  toastr.info(member.name + " has finished their training. They are now a " + newStage + ".");
  setSectMember(i);
  showMemberTrainingButton(i);
  loadSectStrength();                                                                                                                                                                                                                    
}

function getBreakthroughCost(desiredStage) {
  var r = 128.815;
  var e = Math.E;
  return r * Math.pow(e, 3.65882 * desiredStage);
}

function getCost(i, amount) {
  var b = generators[i].baseCost;
  var r = generators[i].growthRate;
  var k = generators[i].level;
  var n = amount;
  return getCostCalculation(b, r, k, n);
}

function getCostCalculation(b, r, k, n) {
  var newCost = b * ((Math.pow(r,k)*(Math.pow(r, n) - 1)) / (r - 1))
  return Math.floor(newCost);
}

function getGeneratorSpeed(i) {
  var baseSpeed = generators[i].baseSpeed;
  var speedTalentMultiplier = getSpeedTalentMultiplier(i);
  return baseSpeed * speedTalentMultiplier;
}

function getMaxLevelsAffordable(i) {
  var b = generators[i].baseCost;
  var r = generators[i].growthRate;
  var c = currentQi[generators[i].qiType];
  var k = generators[i].level;
  return Math.floor((Math.log(((c * (r-1)) / (b * Math.pow(r, k))) + 1)) / Math.log(r));
}

function getTalentArray() {
  return [rootTalent, basicSpeedTalent, basicEfficiencyTalent, intermediateSpeedTalent, intermediateEfficiencyTalent, advancedSpeedTalent, advancedEfficiencyTalent];
}

function getTalentPotential() {
  var res = 0;
  for (var i = 0; i < currentPrestigeQi.length; i++) {
    if (currentPrestigeQi[i] > 0) {
      res = res + (Math.floor(1 + Math.log(currentPrestigeQi[i])));
    }
  }
  return res;
}

function findTalent(type) {
  var talentArray = getTalentArray();
  return talentArray.find(x => x.type == type);
}

function hasEnoughForBreakthrough() {
  for (var i = 0; i < currentQi.length; i++) {
    if (currentQi[i] < breakthroughCost[i])
    {
      return false;
    }
  }
  return true;
}

function joinSect() {
  if (stage < 4 && !(talent > 0)){
    toastr.info("You are not talented enough to join youngster!");
    return;
  }
  loadSect();
}

function isSectUnlocked() {
  return stage >= 4 || totalTalentPoints > 0;
}

function isTalentTreeUnlocked() {
  return totalTalentPoints > 0;
}

function loadAscension() {
  if (generators[9].level > 0 && ascensionLevel < 1) {
    updateAscensionButton();
    showAscension();
  }

  if (ascensionLevel < 1) {
    hideNetherworldTab();
  }
  else {
    showNetherworldTab();
  }

  updateQiStatsByAscension();
}

function loadBaseStateGenerators() {
  generators = [
    new Generator(1, 10, "Training field", 8, 2, "training-bg", "jogging...", 1.08, 0, 1),
    new Generator(0, 120, "Sparring grounds", 68, 4.2, "sparring-bg", "practicing...", 1.08, 0, 1),
    new Generator(0, 1550, "Isolated mountain", 418, 6.4, "mountain-bg", "meditating...", 1.09, 0, 1),
    new Generator(0, 20040, "Library", 2500, 9.3, "library-bg", "reading...", 1.1, 0, 1),
    new Generator(0, 259130, "Eerie forest", 21976, 19.4, "hunting-bg", "hunting...", 1.09, 0, 1),
    new Generator(0, 3350760, "Tournament arena", 193178, 40.8, "tournament-bg", "fighting...", 1.12, 0, 1),
    new Generator(0, 43328110, "Pocket dimension", 1700742, 85.8, "pocket-bg", "exploring...", 1.11, 0, 1),
    new Generator(0, 560268450, "Ancient burial grounds", 13308844, 180.1, "burial-bg", "raiding...", 1.12, 0, 1),
    new Generator(0, 7244736510, "Dreamworld", 105459210, 302.56, "dreamworld-bg", "dreaming...", 1.13, 0, 1),
    new Generator(0, 93680461830, "Primordial realm", 928513374, 635, "primordial-bg", "cultivating...", 1.14, 0, 1),

    new Generator(0, 10, "Nether field", 8, 2, "training-bg", "jogging...", 1.08, 1, 1),
    new Generator(0, 120, "Nether grounds", 68, 4.2, "sparring-bg", "practicing...", 1.08, 1, 1),
    new Generator(0, 1550, "Nether mountain", 418, 6.4, "mountain-bg", "meditating...", 1.09, 1, 1),
    new Generator(0, 20040, "Nether", 2500, 9.3, "library-bg", "reading...", 1.1, 1, 1),
    new Generator(0, 259130, "Nether forest", 21976, 19.4, "hunting-bg", "hunting...", 1.09, 1, 1),
    new Generator(0, 3350760, "Nether arena", 193178, 40.8, "tournament-bg", "fighting...", 1.12, 1, 1),
    new Generator(0, 43328110, "Nether dimension", 1700742, 85.8, "pocket-bg", "exploring...", 1.11, 1, 1),
    new Generator(0, 560268450, "Nether burial grounds", 13308844, 180.1, "burial-bg", "raiding...", 1.12, 1, 1),
    new Generator(0, 7244736510, "Nether", 105459210, 302.56, "dreamworld-bg", "dreaming...", 1.13, 1, 1),
    new Generator(0, 93680461830, "Nether realm", 928513374, 635, "primordial-bg", "cultivating...", 1.14, 1, 1),
  ];
}

function loadGenerators() {
  var storedGenerators = localStorage.getItem('cultivation-generators');
  var parsedGenerators = null;
  if (storedGenerators) {
    parsedGenerators= JSON.parse(storedGenerators);
  }
  if (parsedGenerators && parsedGenerators.length > 0) {
    generators = parsedGenerators;
    calculateGeneratorCosts(true);
    calculateMilestones();
    for (var i = 0; i < generators.length; i++) {
      setGeneratorLevel(i);
    }
  }
  else {
    loadBaseStateGenerators();
  }
  calculateGenerators();
  $("[name='buy-amount']").on('click', function (e) {
    var i = $(e.target).data('amount')
    changeBuyAmount(i)
  })
}

function loadMissions() {
  var missingMissions = 3 - missions.length;
  for (var i = 0; i < missingMissions; i++) {
    addNewRandomMission(i);
  }
  for (var i = 0; i < missions.length; i++) {
    buildMission(i);
  }
}

function loadMembers() {
  for (var i = 0; i < sectMembers.length; i++) {
    buildSectMember(i);
  }
  startTrainingIntervals();
}

function loadNextGenerator(i) {
  startGenerator(i);
  showNextGenerator(i);
  setGeneratorBackground(i);
  if (i == 9) {
    loadAscension();
    addQi(10, 1);
  }
}

function loadSect() {
  if (!isSectUnlocked()) {
    return;
  }
  $("#sect-hider").hide();
  $("#sect-container").show();
  $("#sect-multiplier-div").show();
  var storedMissions = localStorage.getItem('cultivation-missions');
  if (storedMissions){
    missions = JSON.parse(storedMissions);
    toastr.info("logoff length = " + logOffLength);
    if (logOffLength > 0) {
      for(var i = 0; i < missions.length; i++) {
        missions[i].progress = Math.min(missions[i].duration - 1, missions[i].progress + logOffLength).toFixed(0);
      }
    }
  }
  var storedMembers = localStorage.getItem('cultivation-sect-members');
  if (storedMembers){
    var parsedMembers = JSON.parse(storedMembers);
    if (parsedMembers.length > 0) {
      sectMembers = parsedMembers;
    }
  }
  var storedCurrentSectPoints = localStorage.getItem('cultivation-current-sect-points');
  var storedTotalSectPoints = localStorage.getItem('cultivation-total-sect-points');
  if (storedCurrentSectPoints) {
    currentSectPoints = Number(storedCurrentSectPoints);
  }
  if (storedTotalSectPoints){
    totalSectPoints = Number(storedTotalSectPoints);
  }
  setCurrentSectPoints();
  loadMissions();
  loadMembers();
  loadSectStrength();
}

function loadSectStrength() {
  sectStrength = 0;
  for (var i = 0; i < sectMembers.length; i++) {
    sectStrength = sectStrength + calculateSectMemberStrength(i);
  }
  updateSectStrengthDisplay();
  calculateGlobalMultipliers();
}

function loadStats() {
  var storedCurrentQi = localStorage.getItem('cultivation-current-qi');
  var storedTotalQi = localStorage.getItem('cultivation-total-qi');
  var storedCurrentPrestigeQi = localStorage.getItem('cultivation-current-prestige-qi');
  var storedStage = localStorage.getItem('cultivation-stage');
  var storedCurrentTalentPoints = localStorage.getItem('cultivation-current-talent-points');
  var storedTotalTalentPoints = localStorage.getItem('cultivation-total-talent-points');
  var storedTotalProd = localStorage.getItem('cultivation-total-production');
  var storedLogoffTime = localStorage.getItem('cultivation-logoff-time');
  var storedAscensionLevel = localStorage.getItem('cultivation-ascension-level');

  if (storedCurrentQi) {
    var parsedCurrentQi = JSON.parse(storedCurrentQi);
    if (parsedCurrentQi && parsedCurrentQi.length > 0) {
      currentQi = parsedCurrentQi;
    }
  }
  if (storedStage) {
    stage = Number(storedStage);
  }
  if (storedCurrentTalentPoints) {
    currentTalentPoints = Number(storedCurrentTalentPoints);
  }
  if (storedTotalTalentPoints) {
    totalTalentPoints = Number(storedTotalTalentPoints);
  }
  if (storedTotalQi){
    totalQi = Number(storedTotalQi);
  }

  if (storedTotalQi) {
    var parsedTotalQi = JSON.parse(storedTotalQi);
    if (parsedTotalQi && parsedTotalQi.length > 0) {
      totalQi = parsedTotalQi;
    }
  }

  if (storedCurrentPrestigeQi){
    var parsedCurrentPrestigeQi = JSON.parse(storedCurrentPrestigeQi);
    if (parsedCurrentPrestigeQi && parsedCurrentPrestigeQi.length > 0) {
      currentPrestigeQi = parsedCurrentPrestigeQi;
    }
  }

  if (storedLogoffTime) {
    var currentTimeStamp = Date.now();
    var intervalInMs = (currentTimeStamp - storedLogoffTime);
    if (intervalInMs > 10000) {
      var intervalInSeconds = intervalInMs / 1000;
      logOffLength = intervalInSeconds;
    }
  }
  else {
    logOffLength = 0;
  }
  if (storedTotalProd && logOffLength > 0) {
    var parsedTotalProd = JSON.parse(storedTotalProd);
    var offlineProdMsg = "Offline production for " + bigDisplay(intervalInSeconds) + "s gives ";
    for (var i = 0; i < parsedTotalProd.length; i++) {
      var offlineProd = intervalInSeconds * Number(parsedTotalProd[i]);
      addQi(offlineProd, i);
      offlineProdMsg = offlineProdMsg + bigDisplay(offlineProd) + " " + qiNames[i] + " qi, ";
    }

    toastr.info(offlineProdMsg);
  }

  if (storedAscensionLevel) {
    ascensionLevel = storedAscensionLevel;
  }
  updateCurrentQiDisplay();
  updateCurrentPrestigeQiDisplay();
  setStage(stage);
  calculateBreakthroughCost();
  calculateGlobalMultipliers();
  setAvatar(stage);
  updateCurrentTalentPointsDisplay();
}

function loadTalents() {
  var loadedRootTalent = JSON.parse(localStorage.getItem('cultivation-root-talent'));
  if (loadedRootTalent) {
    rootTalent = loadedRootTalent;
  }
  var loadedBasicSpeedTalent = JSON.parse(localStorage.getItem('cultivation-basic-speed-talent'));
  if (loadedBasicSpeedTalent) {
    basicSpeedTalent = loadedBasicSpeedTalent;
  }
  var loadedBasicEfficiencyTalent = JSON.parse(localStorage.getItem('cultivation-basic-efficiency-talent'));
  if (loadedBasicEfficiencyTalent) {
    basicEfficiencyTalent = loadedBasicEfficiencyTalent;
  }
  var loadedIntermediateSpeedTalent = JSON.parse(localStorage.getItem('cultivation-intermediate-speed-talent'));
  if (loadedIntermediateSpeedTalent) {
    intermediateSpeedTalent = loadedIntermediateSpeedTalent;
  }
  var loadedIntermediateEfficiencyTalent = JSON.parse(localStorage.getItem('cultivation-intermediate-efficiency-talent'));
  if (loadedIntermediateEfficiencyTalent) {
    intermediateEfficiencyTalent = loadedIntermediateEfficiencyTalent;
  }
  var loadedAdvancedSpeedTalent = JSON.parse(localStorage.getItem('cultivation-advanced-speed-talent'));
  if (loadedAdvancedSpeedTalent) {
    advancedSpeedTalent = loadedAdvancedSpeedTalent;
  }
  var loadedAdvancedEfficiencyTalent = JSON.parse(localStorage.getItem('cultivation-advanced-efficiency-talent'));
  if (loadedAdvancedEfficiencyTalent) {
    advancedEfficiencyTalent = loadedAdvancedEfficiencyTalent;
  }
  updateRootsDisplay();
}

function loadTalentTree() {
  if (!isTalentTreeUnlocked()){
    return;
  }
  $("#talent-tree-hider").hide();
  $("#talent-tree-container").show();
  $("#talent-multiplier-div").show();
  var chart = new Treant(simple_chart_config, function() { setTalentTree() }, $ );
}

function missionButtonClick(i) {
  var mission = missions[i];
  //if in progress, return
  if (mission.state == 1){
    return;
  }

  //if not started, start
  if (mission.state == 0) {
    startMission(i);
  }

  //if ended, complete
  if (mission.state == 2) {
    completeMission(i);
  }
}

function progressBar(i) {
  var bar = getProgressBar(i);
  var valueNow = Number(bar.attr('aria-value-now'));
  if (valueNow >= 100) {
    bar.attr('aria-value-now', 0)
    bar.width('0%');
  } else {
    bar.attr('aria-value-now', valueNow + 1);
    bar.width(valueNow + 1 + '%');
  }
}

function progressBarForceReset(i) {
  var bar = getProgressBar(i);
  bar.attr('aria-value-now', 0)
  bar.width('0%');
}

function rankUpTalent(type) {
  var talent = findTalent(type);
  if (talent) {
    talent.rank = talent.rank + 1;
    var factor = 1.5;
    if (talent.type == "roots") {
      factor = 5;
    }
    talent.cost = Math.floor(talent.cost * factor);
  }
  updateRootsDisplay();
  calculateGlobalMultipliers();
  calculateGeneratorProds();
  startGenerators();
  updateCurrentTalentPointsDisplay();
}

function resetSaveState() {
  localStorage.removeItem('cultivation-current-qi');
  localStorage.removeItem('cultivation-current-prestige-qi');
  localStorage.removeItem('cultivation-stage');
  localStorage.removeItem('cultivation-generator-levels');
  localStorage.removeItem('cultivation-total-production');
}

function resetStats() {
  loadBaseStateGenerators();
  breakthroughCost = [5000, 0, 0, 0, 0];
  buyAmount = 1;
  globalMultiplier = 1;
  maxAmounts= [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  progressBarPos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  progressIntervals = [];
  reforgeReward = 0;
  stage = 0;
  currentQi = [0, 0, 0, 0, 0];
  currentPrestigeQi = [0, 0, 0, 0, 0];
}

function startGenerator(i) {
  if (generators[i].level && generators[i].level > 0) {
    startGeneratorInterval(i, getGeneratorSpeed(i) * 1000); //generatorSpeeds are in seconds, frequency is in milisecond
    startProgressBarInterval(i, getGeneratorSpeed(i) * 10.05); //slightly slower than 1% speed, the generator interval forces the sync
  }
}

function startGenerators() {
  for (var i = 0; i < generators.length; i++) {
    startGenerator(i);
  }
}

function saveGenerators() {
  localStorage.setItem('cultivation-generators', JSON.stringify(generators));
}

function saveSect() {
  localStorage.setItem('cultivation-sect-members', JSON.stringify(sectMembers));
  localStorage.setItem('cultivation-missions', JSON.stringify(missions));
  localStorage.setItem('cultivation-current-sect-points', currentSectPoints);
  localStorage.setItem('cultivation-total-sect-points', totalSectPoints);
}

function saveStats() {
  localStorage.setItem('cultivation-current-qi', JSON.stringify(currentQi));
  localStorage.setItem('cultivation-total-qi', JSON.stringify(totalQi));
  localStorage.setItem('cultivation-current-prestige-qi', JSON.stringify(currentPrestigeQi));
  localStorage.setItem('cultivation-stage', stage);
  localStorage.setItem('cultivation-current-talent-points', currentTalentPoints);
  localStorage.setItem('cultivation-total-talent-points', totalTalentPoints);
  localStorage.setItem('cultivation-total-production', JSON.stringify(totalProd));
  localStorage.setItem('cultivation-logoff-time', Date.now());
  localStorage.setItem('cultivation-ascension-level', ascensionLevel);
}

function saveTalents() {
  localStorage.setItem('cultivation-root-talent', JSON.stringify(rootTalent));
  localStorage.setItem('cultivation-basic-speed-talent', JSON.stringify(basicSpeedTalent));
  localStorage.setItem('cultivation-basic-efficiency-talent', JSON.stringify(basicEfficiencyTalent));
  localStorage.setItem('cultivation-intermediate-speed-talent', JSON.stringify(intermediateSpeedTalent));
  localStorage.setItem('cultivation-intermediate-efficiency-talent', JSON.stringify(intermediateEfficiencyTalent));
  localStorage.setItem('cultivation-advanced-speed-talent', JSON.stringify(advancedSpeedTalent));
  localStorage.setItem('cultivation-advanced-efficiency-talent', JSON.stringify(advancedEfficiencyTalent));
}

function startGeneratorInterval(i, frequency) {
  if (generatorIntervals[i]) {
    clearInterval(generatorIntervals[i]);
  }
  generatorIntervals[i] = setInterval(function () {
    autoCultivate(i);
  }, frequency);
}

function startMission(i) {
  var availableMemberIdx = -1;
  //find available member
  for (var j = 0; j < sectMembers.length; j++){
    if (sectMembers[j].mission == null || sectMembers[j].mission == i) {
      availableMemberIdx = j;
      break;
    }
  }
  if (availableMemberIdx == -1) {
    toastr.info('All sect members occupied')
    return;
  }
  missions[i].state = 1;
  sectMembers[availableMemberIdx].mission = i;
  setMemberMission(availableMemberIdx, i);
  var missionInterval = setInterval(function () {
    //increase progress on mission object
    missions[i].progress = Number(missions[i].progress) + 1;
    //decrease visual timer
    setMissionTimer(i, missions[i].duration - missions[i].progress);
    if (missions[i].progress >= missions[i].duration) {
      missions[i].state = 2;
      showMissionButton(i);
      clearInterval(missionInterval);
    }
  }, 1000);

  hideMissionButton(i);
  setMissionButtonToComplete(i);
}

function startProgressBarInterval(i, frequency) {
  if (progressIntervals[i]) {
    clearInterval(progressIntervals[i]);
  }
  progressIntervals[i] = setInterval(function () {
    progressBar(i);
  }, frequency);
}

function startTraining(i) {
  //Set training start date for member
  sectMembers[i].trainingStartTime = Date.now();
  //Set mission to -1 so he is not available
  sectMembers[i].mission = -1;
  //Start an interval (needs to be a function so can be called on load page)
  startTrainingInterval(i);
}

function startTrainingInterval(i) {
  var member = sectMembers[i];
  if (member.trainingStartTime == null || member.mission != -1){
    return;
  }
  //update HTML to show training in progress + time left
  hideMemberTrainingButton(i);
  if (memberTrainingIntervals[i]) {
    clearInterval(memberTrainingIntervals[i]);
  }
  memberTrainingIntervals[i] = setInterval(function () {
    var trainingTimeInMs = trainingBaseTime[member.stage] * 1000;
    var remainingTime = trainingTimeInMs - (Date.now() - member.trainingStartTime);
    setMemberTrainingTimeLeft(i, Math.floor(remainingTime / 1000));
    //check startdate compare to date now if we have elapsed enough time, if so complete training
    if (Date.now() - member.trainingStartTime >= trainingBaseTime[member.stage] * 1000) {
      completeTraining(i);
    }
  }, 1000);
}

function startTrainingIntervals() {
  for (var i = 0; i < sectMembers.length; i++) {
    startTrainingInterval(i);
  }
}

function reforge() {
  var addedTalentPoints = getTalentPotential();
  currentTalentPoints = currentTalentPoints + addedTalentPoints;
  totalTalentPoints = totalTalentPoints + addedTalentPoints;
  resetStats();
  saveGenerators();
  saveStats();
  resetSaveState();
  resetBaseHtml();
  //TODO do better than a simple refresh
  window.location.reload();
}

function talentButtonOnClick(e) {
  var type = $(e.target).parents(".talent-tree-node").data("talent-type");
  var talent = findTalent(type);
  var cost = talent.cost;
  if (cost > currentTalentPoints){
    toastr.info("Not enough talent points");
  }
  else if (talent.rank >= talent.maxRank) {
    toastr.info("Max rank achieved")
  }
  else {
    currentTalentPoints = currentTalentPoints - cost;
    rankUpTalent(type);
    setTalentNode(talent);
  }
}

function trainingButtonOnClick(i) {
  //check if funds available
  var member = sectMembers[i];
  var cost = trainingBaseCosts[member.stage];
  if (currentSectPoints < cost) {
    toastr.info("Not enough sect points");
    return;
  }
  //remove costs and start training
  currentSectPoints = currentSectPoints - cost;
  startTraining(i);
}

function updateDisplay() {
  if (buyAmount == "-1") {
    calculateGeneratorCosts(false);
  }

  if (hasEnoughForBreakthrough()) {
    enableBreakthroughButton();
  }
  else {
    disableBreakthroughButton();
  }

  for (var i = 0; i < generators.length; i++) {
    setBuyAmount(i);
    if (currentQi[generators[i].qiType] < generators[i].cost){
      disableBuyButton(i);
    }
    else {
      enableBuyButton(i);
    }
  }

  if (stage > 5) {
    enableReforgeButton();
  }

  updateTotalProduction();

  if (!isSectUnlocked() && stage >= 4) {
    enableJoinSectButton();
  }
}

function updateGenerator(i) {
  calculateGeneratorCost(i);
  calculateGeneratorProd(i);
  setGeneratorLevel(i);
}


function updateGeneratorQps(i) {
  var qps = generators[i].production / getGeneratorSpeed(i);
  setGeneratorQps(i, qps);
}

function updateGeneratorsQps() {
  for (var i = 0; i < generators.length; i++) {
    if (generators[i].level > 0){
      updateGeneratorQps(i);
    }
  }
}

function updateTotalProduction() {
  var newTotalProd = [0, 0, 0, 0, 0];
  for (var i = 0; i < generators.length; i++) {
    if (generators[i].level > 0) {
      var qiType = generators[i].qiType;
      newTotalProd[qiType] = newTotalProd[qiType] + generators[i].production / getGeneratorSpeed(i);
    }
  }
  for (var i = 0; i < totalProd.length; i++) {
    totalProd[i] = newTotalProd[i];
  }
  updateTotalProductionDisplay();
}