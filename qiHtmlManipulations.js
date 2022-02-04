function buildGenerator(i) {
  var template = $("#generator-template").clone();
  template.attr("id","generator-" + i);

  //if is levelled or previous one is levelled, show
  var previousGeneratorIdx = i-1;
  if (previousGeneratorIdx < 0) {
    previousGeneratorIdx = 0;
  }
  if (generators[previousGeneratorIdx].level > 0) {
    template.show();
  }
  if (generators[i].level > 0) {
    template.addClass(generators[i].bgClass);
  }

  //setup buy button on click
  var btn = template.find("[class='cultivate-button']");
  btn.prop('disabled', true);
  btn.on('click', function () {
    buyGeneratorLevel(i)
  });

  //setup location name, level, background, progress bar action
  template.find("[class='location']").html(generators[i].name);
  template.find("[class='level']").html("lvl " + generators[i].level);
  template.find("[class='progress-bar']").html(generators[i].action);

  if (i < 10) {
    template.find("img[name='qi-image']").prop('src', './Assets/qi-0.png')
    template.appendTo("#earth-container");
  }
  else if (i < 20) {
    template.find("img[name='qi-image']").prop('src', './Assets/qi-1.png')
    template.appendTo("#netherworld-container");
  }
} 

function buildMission(i) {
  var template = $("#mission-template").clone();
  template.attr("id", "mission-" + i);
  template.show();
  template.appendTo("#mission-container");
  setMission(i);
}

function buildSectMember(i) {
  var template = $("#member-template").clone();
  template.attr("id", "member-" + i);
  template.show();
  template.appendTo("#member-container");
  setSectMember(i);
}

function disableBreakthroughButton() {
  var btn = $("#breakthrough-button");
  btn.prop("disabled", true);
}

function disableBuyButton(i) {
  var div = getGeneratorDiv(i);
  var btn = $(div).find("button[class='cultivate-button']");
  btn.prop("disabled", true);
}

function disableReforgeButton() {
  var btn = $("#reforge-button");
  btn.prop("disabled", true);
}

function enableBreakthroughButton() {
  var btn = $("#breakthrough-button");
  btn.prop("disabled", false);
}

function enableBuyButton(i) {
  var div = getGeneratorDiv(i);
  var btn = $(div).find("button[class='cultivate-button']");
  btn.prop("disabled", false);
}

function enableJoinSectButton() {
  var btn = $("#join-sect-button");
  btn.prop("disabled", false);
}

function enableReforgeButton() {
  var btn = $("#reforge-button");
  btn.prop("disabled", false);
}

function getAddedQiSection(i) {
  var div = getGeneratorDiv(i);
  var addedQiSection = $(div).find("[class='added-qi']");
  return addedQiSection;
}

function getGeneratorDiv(i) {
  return $("#generator-" + i);
}

function getMission(i) {
  return $("#mission-" + i);
}

function getMissionButton(i) {
  return getMission(i).find("[name='mission-button']");
}

function getMissionTimer(i) {
  return getMission(i).find("[name='mission-duration']");
}

function getProgressBar(i) {
  var div = getGeneratorDiv(i);
  var bar = $(div).find("div[class='progress-bar']");
  return bar;
}

function getSectMember(i) {
  return $("#member-" + i);
}

function getSectMemberMission(i) {
  return getSectMember(i).find("[name='member-mission']");
}

function getTalentNode(type) {
  var candidates = $(".talent-tree-node").filter("[data-talent-type='" + type + "']");
  for (var i = 0; i < candidates.length; i++) {
    var id = candidates[i].id;
    if (id.indexOf('clone') != -1) {
      return candidates[i];
    }
  }
  return null;
}

function hideAscension() {
  $("#ascension-div").hide();
}

function hideMissionButton(i) {
  var btn = getMissionButton(i);
  btn.hide();
}

function hideMemberTrainingButton(i) {
  var member = getSectMember(i);
  var btn = member.find("[name='member-training-button']");
  btn.hide();
}

function hideNetherworldTab() {
  $("#netherworld-tab").html("???");
  $("#netherworld-tab").prop('disabled', true);
}

function popAndFade(elem) {
  $(elem).show();
  $(elem).fadeOut(700);
}

function resetBaseHtml() {
  $("#one-times").select();
  changeBuyAmount(1);
  //ensure missions are all present
}

function setAvatar(stage) {
  // var url = getAvatarUrl(stage);
  // var avatarImg = $("#avatar");
  // avatarImg.prop('src', url);

  //TODO LATER HWEN I HAVE GOOD AVATARS
}

function setGeneratorCost(i) {
  var div = getGeneratorDiv(i);
  var costSpan = $(div).find("span[class='cost']");
  costSpan.html(bigDisplay(generators[i].cost));
}

function setGeneratorLevel(i) {
  var div = getGeneratorDiv(i);
  var levelSpan = $(div).find("span[class='level']");
  levelSpan.html("lvl " + bigDisplay(generators[i].level));
}

function setBuyAmount(i) {
  var div = getGeneratorDiv(i);
  var buyAmountSpan = $(div).find("span[class='level-up-amount']");
  var amount = buyAmount;
  if (buyAmount == "-1") {
    amount = maxAmounts[i];
  }
  buyAmountSpan.html("LVL UP x" + bigDisplay(amount));
}

function setCurrentPrestigeQi(qi){
  $("#current-prestige-qi").html(bigDisplay(qi));
}

function setCurrentSectPoints() {
  var pts = currentSectPoints;
  $("#sect-points").html(pts);
}

function setGeneratorBackground(i) {
  var div = getGeneratorDiv(i);
  div.addClass(generators[i].bgClass);
}

function setGeneratorQps(i, qps) {
  var div = getGeneratorDiv(i);
  var qpsSpan = div.find("[class='qps']");
  qpsSpan.html(bigDisplay(qps) + " qps");
}

function setGlobalMultipliers(talent, stage, sect, roots, total) {
  $("#stage-multiplier").html(bigDisplay(stage));
  if (isTalentTreeUnlocked()) {
    $("#talent-multiplier").html(bigDisplay(talent));
  }
  if (isSectUnlocked()) {
    $("#sect-multiplier").html(bigDisplay(sect));
  }
  $("#roots-multiplier").html(bigDisplay(roots));
  $("#global-multiplier").html(bigDisplay(total));
}

function setMemberMission(i) {
  var member = sectMembers[i];
  if (member == null) {
    return;
  }
  var elem = getSectMemberMission(i);
  if (member.mission == null || member.mission < 0) {
    elem.html("");
    showMemberTraining(i);
    return;
  }
  var mission = missions[member.mission];
  var location = generators[mission.location].name;
  var action = actionNames[mission.action]
  elem.html(action + " in " + location);
  showMemberMission(i);
}

function setMemberTrainingTimeLeft(i, timeLeft) {
  var elem = getSectMember(i);
  $(elem).find("[name='member-training-time']").html(displayTime(timeLeft));
}

function setMission(i){
  var elem = getMission(i);
  var mission = missions[i];
  if (mission == null) {
    return;
  }
  //setup location name, reward, duration, action
  elem.find("[name='mission-action']").html(actionNames[mission.action]);
  elem.find("[name='mission-location']").html(generators[mission.location].name);
  elem.addClass(generators[mission.location].bgClass);
  elem.find("[name='mission-reward']").html(mission.reward);
  elem.find("[name='mission-duration']").html(mission.duration);

  //set up mission buton
  var btn = elem.find("[name='mission-button']");
  btn.off('click');
  btn.on('click', function () {
    missionButtonClick(i);
  });
  if (mission.state == 0) {
    setMissionButtonToStart(i);
  }

  if (mission.state == 1) {
    startMission(i);
    hideMissionButton(i);
    setMissionButtonToComplete(i);
  }
  if (mission.state == 2) {
    setMissionButtonToComplete(i);
  }
}

function setMissionButtonToStart(i) {
  var btn = getMissionButton(i);
  btn.html("Start");
}

function setMissionButtonToComplete(i) {
  var btn = getMissionButton(i);
  btn.html("Complete");
}

function setMissionTimer(i, duration) {
  var timer = getMissionTimer(i);
  timer.html(duration);
}

function setRoots(talent){
  $("#roots").html(getSpiritualRoots(talent));
}

function setSectMember(i) {
  var elem = getSectMember(i);
  var member = sectMembers[i];
  //load name and stage
  elem.find("[name='member-name']").html(member.name);
  elem.find("[name='member-stage']").html(stageArray[member.stage]);
  //load avatar
  elem.find("[name='member-avatar']").prop('src', sectMemberAvatarUrls[i]);
  //load button
  var btn = elem.find("[name='member-training-button']");
  btn.off('click');
  btn.on('click', function () {
    trainingButtonOnClick(i);
  });
  elem.find("[name='member-training-cost']").html(bigDisplay(trainingBaseCosts[member.stage]));
  elem.find("[name='member-training-time']").html(displayTime(trainingBaseTime[member.stage]));
  updateMemberStrengthDisplay(i);
  setMemberMission(i);
}

function setReforge(talent) {
  $("#reforge-reward").html(bigDisplay(talent));
}

function setStage(stage){
  $("#stage").html(stageArray[stage]);
}

function setTalentNode(talent) {
  var node = getTalentNode(talent.type);
  if (node == null) {
    toastr.info("Encountered null node while building talent tree for type: " + talent.type);
    return;
  }
  //update rank
  $(node).find("[name='rank']").html(talent.rank);
  //update max rank
  $(node).find("[name='max-rank']").html(talent.maxRank);
  //update cost
  $(node).find("[name='node-cost']").html(talent.cost);
  //update on click
  var btn = $(node).find("[name='node-button']")
  btn.off();
  if (talent.maxRank > talent.rank) {
    btn.on('click', function (e) {
      talentButtonOnClick(e);
    });
  }
  else {
    btn.hide();
  }
  //TODO : update tooltip
}

function setTalentTree() {
  var talentArray = getTalentArray();
  for (var i = 0; i < talentArray.length; i++) {
    setTalentNode(talentArray[i]);
  }
}

function showAscension() {
  $("#ascension-div").show();
}

function showAddedQi(i, addedQi) {
  var elem = getAddedQiSection(i);
  elem.html("<img src='Assets/qi-" + generators[i].qiType + ".png'> " + bigDisplay(addedQi));
  popAndFade(elem);
}

function showMissionButton(i) {
  var btn = getMissionButton(i);
  btn.show();
}

function showMemberTraining(i) {
  var memberTraining = getSectMember(i).find("[name='member-training-div']");
  var memberMission = getSectMember(i).find("[name='member-mission-div']");
  memberMission.hide();
  memberTraining.show();
}

function showMemberTrainingButton(i) {
  var member = getSectMember(i);
  var btn = member.find("[name='member-training-button']");
  btn.show();
}

function showMemberMission(i) {
  var memberMission = getSectMember(i).find("[name='member-mission-div']");
  var memberTraining = getSectMember(i).find("[name='member-training-div']");
  memberTraining.hide();
  memberMission.show();
}

function showNetherworldTab() {
    $("#netherworld-tab").html("Netherworld");
    $("#netherworld-tab").prop('disabled', false);
}

function showNextGenerator(i) {
  var generatorDiv = $("#generator-" + (i + 1));
  if (generatorDiv) {
    generatorDiv.show();
  }
}

function updateAscensionButton() {
  if (stage >= 10 && ascensionLevel < 2) {
    $("#ascend-button").prop('disabled', false);
  }
}

function updateBreakthroughCostDisplay() {
  for (var i = 0; i < breakthroughCost.length; i++) {
    if (breakthroughCost[i] > 0) {
      display = breakthroughCost[i].toFixed(0);
      if (breakthroughCost[i] > 1.0e+5) {
        display = bigDisplay(breakthroughCost[i]);
      }
      $("#breakthrough-cost-" + i).html(display);
      $("#breakthrough-" + i).show();
    }
    else {
      $("#breakthrough-" + i).hide();
    }
  }

  
}

function updateCurrentPrestigeQiDisplay(){
  for (var i = 0; i < currentPrestigeQi.length; i++) {
    $("#current-prestige-qi-" + i).html(bigDisplay(currentPrestigeQi[i]));
  }
}

function updateCurrentQiDisplay(){
  for (var i = 0; i < currentQi.length; i++) {
    $("#current-qi-" + i).html(bigDisplay(currentQi[i]));
  }
}

function updateCurrentTalentPointsDisplay() {
  $("#talent-stones").html(bigDisplay(currentTalentPoints));
}

function updateMemberStrengthDisplay(i) {
  var elem = getSectMember(i);
  var str = calculateSectMemberStrength(i);
  elem.find("[name='member-strength']").html(bigDisplay(str));
}

function updateQiStatsByAscension() {
  for (var i = 0; i < currentQi.length; i++) {
    if (ascensionLevel >= i) { 
      $("#current-prestige-qi-div-" + i).show();
      $("#current-qi-div-" + i).show();
      $("#current-prestige-qi-div-" + i).show();
    } 
    else {
      $("#current-prestige-qi-div-" + i).hide();
      $("#current-qi-div-" + i).hide();
      $("#total-production-div-" + i).hide();
    }
  }
}

function updateRootsDisplay() {
  var rootTalent = findTalent("roots");
  var rootRank = 0;
  if (rootTalent != null) {
    rootRank = rootTalent.rank;
  }
  var roots = spiritualRootsArray[rootTalent.rank];
  $("#roots").html(roots);
}

function updateSectStrengthDisplay() {
  $("#sect-strength").html(bigDisplay(sectStrength));
}


function updateTotalProductionDisplay() {
  for (var i = 0; i < totalProd.length; i++) {
    if (totalProd[i] > 0) {
      $("#total-production-div-" + i).show();
      $("#total-production-" + i).html(bigDisplay(totalProd[i]));
    }
    else {
      $("#total-production-div" + i).hide();
    }
  }
}

function updateTreeStatus() {
  var rootsRank = findTalent("roots").rank;
  //TODO : LOCK TREE NODES IF PREVIOUS HAVENT MET REQUIREMENT
}
