var deathQueue = [];
var basicQueue = [];
var activeQueue = [];


function runSim() {
  var oCombatLog = document.getElementById("combatLog");
  var numSims = document.getElementById("numSims").value;
  var roundNum = 0;
  var winCount = 0;
  var orderOfAttack = [];
  var numOfHeroes = 0;
  var result = {};
  var monsterResult = "";
  var someoneWon = "";
  var endRoundDesc = "";
  var numLiving = 0;
  
  var attMonsterName = document.getElementById("attMonster").value;
  var attMonster = new baseMonsterStats[attMonsterName]["className"](attMonsterName, "att");
  
  var defMonsterName = document.getElementById("defMonster").value;
  var defMonster = new baseMonsterStats[defMonsterName]["className"](defMonsterName, "def");
  
  oCombatLog.innerHTML = "";
  
  for (var i = 0; i < attHeroes.length; i++) {
    attHeroes[i]._damageDealt = 0;
    attHeroes[i]._damageHealed = 0;
  }
  
  for (var i = 0; i < defHeroes.length; i++) {
    defHeroes[i]._damageDealt = 0;
    defHeroes[i]._damageHealed = 0;
  }
  
  for (var simIterNum = 1; simIterNum <= numSims; simIterNum++) {
    // @ start of single simulation
    
    if(numSims == 1) {oCombatLog.innerHTML += "<p class ='logSeg'>Simulation #" + formatNum(simIterNum) +" Started.</p>"};
    someoneWon = "";
    attMonster._energy = 0;
    defMonster._energy = 0;
    
    // snapshot stats as they are
    orderOfAttack = [];
    
    numOfHeroes = attHeroes.length;
    for (var i = 0; i < numOfHeroes; i++) {
      if (attHeroes[i]._heroName != "None") {
        attHeroes[i].snapshotStats();
        attHeroes[i]._buffs = {};
        attHeroes[i]._debuffs = {};
        orderOfAttack.push(attHeroes[i]);
      }
    }
    
    numOfHeroes = defHeroes.length;
    for (var i = 0; i < numOfHeroes; i++) {
      if (defHeroes[i]._heroName != "None") {
        defHeroes[i].snapshotStats();
        defHeroes[i]._buffs = {};
        defHeroes[i]._debuffs = {};
        orderOfAttack.push(defHeroes[i]);
      }
    }
    
    for (roundNum = 1; roundNum <= 15; roundNum++) {
      // @ start of round
      
      // Output detailed combat log only if running a single simulation
      if(numSims == 1) {oCombatLog.innerHTML += "<p class='logSeg'>Round " + formatNum(roundNum) + " Start</p>";}
      
      orderOfAttack.sort(speedSort);
      
      for (var orderNum = 0; orderNum < orderOfAttack.length; orderNum++) {
        // @ start of hero action
        deathQueue = [];
        basicQueue = [];
        activeQueue = [];
        
        if (orderOfAttack[orderNum]._currentStats["totalHP"] > 0) {
        
          if(numSims == 1) {oCombatLog.innerHTML += "<p></p>";}
          
          // decide on action
          if (orderOfAttack[orderNum]._currentStats["energy"] >= 100) {
            // do active
            result = orderOfAttack[orderNum].doActive();
            if(numSims == 1) {oCombatLog.innerHTML += "<div>" + result + "</div>";}
            
            if (orderOfAttack[orderNum]._attOrDef == "att") {
              if (attMonster._monsterName != "None") {
                monsterResult = "<div>" + attMonster.heroDesc() + " gained " + formatNum(10) + " energy. ";
                attMonster._energy += 10;
                monsterResult += "Energy at " + formatNum(attMonster._energy) + ".</div>"
                if(numSims == 1) {oCombatLog.innerHTML += monsterResult;}
              }
            } else {
              if (defMonster._monsterName != "None") {
                monsterResult = "<div>" + defMonster.heroDesc() + " gained " + formatNum(10) + " energy. ";
                defMonster._energy += 10;
                monsterResult += "Energy at " + formatNum(defMonster._energy) + ".</div>"
                if(numSims == 1) {oCombatLog.innerHTML += monsterResult;}
              }
            }
            
            // process active queue
            for (var e in activeQueue) {
              temp = alertDidActive(activeQueue[e][0], activeQueue[e][1]);
              if(numSims == 1) {oCombatLog.innerHTML += temp;}
            }
          } else {
            // do basic
            result = orderOfAttack[orderNum].doBasic();
            if(numSims == 1) {oCombatLog.innerHTML += "<div>" + result + "</div>";}  
            
            // process basic queue
            for (var e in basicQueue) {
              temp = alertDidBasic(basicQueue[e][0], basicQueue[e][1]);
              if(numSims == 1) {oCombatLog.innerHTML += temp;}
            }
          }
            
          temp = processDeathQueue(oCombatLog);
          if(numSims == 1) {oCombatLog.innerHTML += temp;}
          
          someoneWon = checkForWin();
          
          // @ end of hero action
          
          if (someoneWon != "") {break;}
        }
      }
      
      if (someoneWon != "") {break;}
      
      // trigger end of round stuff
      if(numSims == 1) {oCombatLog.innerHTML += "<p></p><div class='logSeg'>End of round " + formatNum(roundNum) + ".</div>";}
      
      // handle monster stuff
      if (attMonster._monsterName != "None") {
        monsterResult = "<p></p><div>" + attMonster.heroDesc() + " gained " + formatNum(20) + " energy. ";
        attMonster._energy += 20;
        monsterResult += "Energy at " + formatNum(attMonster._energy) + ".</div>"
      
        if (attMonster._energy >= 100) {
          monsterResult += attMonster.doActive();
        }
        
        if(numSims == 1) {oCombatLog.innerHTML += monsterResult;}
      }
      
      temp = processDeathQueue(oCombatLog);
      if(numSims == 1) {oCombatLog.innerHTML += temp;}
      
      someoneWon = checkForWin();
      if (someoneWon != "") {break;}
      
      if (defMonster._monsterName != "None") {
        monsterResult = "<p></p><div>" + defMonster.heroDesc() + " gained " + formatNum(20) + " energy. ";
        defMonster._energy += 20;
        monsterResult += "Energy at " + formatNum(defMonster._energy) + ".</div>"
      
        if (defMonster._energy >= 100) {
          monsterResult += defMonster.doActive();
        }
        
        if(numSims == 1) {oCombatLog.innerHTML += monsterResult;}
      }
      
      temp = processDeathQueue(oCombatLog);
      if(numSims == 1) {oCombatLog.innerHTML += temp;}
      
      someoneWon = checkForWin();
      if (someoneWon != "") {break;}
      
      // handle buffs and debuffs
      for (var h in orderOfAttack) {
        if(numSims == 1) {oCombatLog.innerHTML += orderOfAttack[h].tickBuffs();}
      }
      
      for (var h in orderOfAttack) {
        if(numSims == 1) {oCombatLog.innerHTML += orderOfAttack[h].tickDebuffs();}
      }
      
      temp = processDeathQueue(oCombatLog);
      if(numSims == 1) {oCombatLog.innerHTML += temp;}
      
      someoneWon = checkForWin();
      if (someoneWon != "") {break;}
      
      // get number of living heroes for shared fate enable
      numLiving = 0;
      for (var h in orderOfAttack) {
        if (orderOfAttack[h]._currentStats["totalHP"] > 0) { numLiving++; }
      }
      
      // trigger E3 enables
      for (var h in orderOfAttack) {
        if (orderOfAttack[h]._currentStats["totalHP"] > 0) { 
          if(numSims == 1) {oCombatLog.innerHTML += orderOfAttack[h].tickEnable3(numLiving);}
        }
      }
      
      // @ end of round
    }
    
    if (someoneWon == "att") {
      winCount++;
      if(numSims == 1) {oCombatLog.innerHTML += "<p class='logSeg'>Attacker wins!</p>";}
    } else {
      if(numSims == 1) {oCombatLog.innerHTML += "<p class='logSeg'>Defender wins!</p>";}
    }
    
    
    numOfHeroes = attHeroes.length;
    for (var i = 0; i < numOfHeroes; i++) {
      if (attHeroes[i]._heroName != "None") {
        attHeroes[i]._damageDealt += attHeroes[i]._currentStats["damageDealt"];
        attHeroes[i]._currentStats["damageDealt"] = 0;
        attHeroes[i]._damageHealed += attHeroes[i]._currentStats["damageHealed"];
        attHeroes[i]._currentStats["damageHealed"] = 0;
      }
    }
    
    numOfHeroes = defHeroes.length;
    for (var i = 0; i < numOfHeroes; i++) {
      if (defHeroes[i]._heroName != "None") {
        defHeroes[i]._damageDealt += defHeroes[i]._currentStats["damageDealt"];
        defHeroes[i]._currentStats["damageDealt"] = 0;
        defHeroes[i]._damageHealed += defHeroes[i]._currentStats["damageHealed"];
        defHeroes[i]._currentStats["damageHealed"] = 0;
      }
    }
    
    if(numSims == 1) {oCombatLog.innerHTML += "<p class='logSeg'>Simulation #" + formatNum(simIterNum) +" Ended.</p>"};
    
    // @ end of simulation
  }
  
  oCombatLog.innerHTML += "<p class='logSeg'>Attacker won " + winCount + " out of " + numSims + " (" + formatNum((winCount/numSims * 100).toFixed(2)) + "%).</p>";
  
  // damage summary
  oCombatLog.innerHTML += "<p><div class='logSeg'>Attacker average damage summary.</div>";
  for (var i = 0; i < attHeroes.length; i++) {
    if (attHeroes[i]._heroName != "None") {
      oCombatLog.innerHTML += "<div>" + attHeroes[i].heroDesc() + ": " + formatNum(Math.floor(attHeroes[i]._damageDealt / numSims)) + "</div>";
    }
  }
  if (attMonster._monsterName != "None") {
    oCombatLog.innerHTML += "<div>" + attMonster.heroDesc() + ": " + formatNum(Math.floor(attMonster._currentStats["damageDealt"] / numSims)) + "</div>";
  }
  oCombatLog.innerHTML += "</p>";
  
  oCombatLog.innerHTML += "<p><div class='logSeg'>Defender average damage summary.</div>";
  for (var i = 0; i < defHeroes.length; i++) {
    if (defHeroes[i]._heroName != "None") {
      oCombatLog.innerHTML += "<div>" + defHeroes[i].heroDesc() + ": " + formatNum(Math.floor(defHeroes[i]._damageDealt / numSims)) + "</div>";
    }
  }
  if (defMonster._monsterName != "None") {
    oCombatLog.innerHTML += "<div>" + defMonster.heroDesc() + ": " + formatNum(Math.floor(defMonster._currentStats["damageDealt"] / numSims)) + "</div>";
  }
  oCombatLog.innerHTML += "</p>";
  
  // healing and damage prevention summary
  oCombatLog.innerHTML += "<p><div class='logSeg'>Attacker average healing and damage prevention summary.</div>";
  for (var i = 0; i < attHeroes.length; i++) {
    if (attHeroes[i]._heroName != "None") {
      oCombatLog.innerHTML += "<div>" + attHeroes[i].heroDesc() + ": " + formatNum(Math.floor(attHeroes[i]._damageHealed / numSims)) + "</div>";
    }
  }
  if (attMonster._monsterName != "None") {
    oCombatLog.innerHTML += "<div>" + attMonster.heroDesc() + ": " + formatNum(Math.floor(attMonster._currentStats["damageHealed"] / numSims)) + "</div>";
  }
  oCombatLog.innerHTML += "</p>";
  
  oCombatLog.innerHTML += "<p><div class='logSeg'>Defender average healing and damage prevention summary.</div>";
  for (var i = 0; i < defHeroes.length; i++) {
    if (defHeroes[i]._heroName != "None") {
      oCombatLog.innerHTML += "<div>" + defHeroes[i].heroDesc() + ": " + formatNum(Math.floor(defHeroes[i]._damageHealed / numSims)) + "</div>";
    }
  }
  if (defMonster._monsterName != "None") {
    oCombatLog.innerHTML += "<div>" + defMonster.heroDesc() + ": " + formatNum(Math.floor(defMonster._currentStats["damageHealed"] / numSims)) + "</div>";
  }
  oCombatLog.innerHTML += "</p>";
  
  oCombatLog.scrollTop = 0;
}


function processDeathQueue(oCombatLog) {
  var temp = "";
  
  while (deathQueue.length > 0) {
    temp += alertHeroDied(deathQueue[0][0], deathQueue[0][1]);
    deathQueue.shift();
  }
  
  return temp;
}


// alerters to trigger other heroes in response to an action

// tell all heroes a hero did a basic attack and the outcome
function alertDidBasic(source, target) {
  var result = "";
  var temp = "";
  
  for (var i = 0; i < source._allies.length; i++) {
    temp = source._allies[i].eventAllyBasic(source, target);
    if (temp != "") {
      result += "<div>" + temp + "</div>";
    }
  }
  
  for (var i = 0; i < source._enemies.length; i++) {
    temp = source._enemies[i].eventEnemyBasic(source, target);
    if (temp != "") {
      result += "<div>" + temp + "</div>";
    }
  }
  
  return result;
}


// tell all heroes a hero did an active and the outcome
function alertDidActive(source, target) {
  var result = "";
  var temp = "";
  
  for (var i = 0; i < source._allies.length; i++) {
    temp = source._allies[i].eventAllyActive(source, target);
    if (temp != "") {
      result += "<div>" + temp + "</div>";
    }
  }
  
  for (var i = 0; i < source._enemies.length; i++) {
    temp = source._enemies[i].eventEnemyActive(source, target);
    if (temp != "") {
      result += "<div>" + temp + "</div>";
    }
  }
  
  return result;
}
  
  
// tell all heroes a hero died
function alertHeroDied(source, target) {
  var result = "";
  var temp = "";
  
  for (var i = 0; i < target._allies.length; i++) {
    temp = target._allies[i].eventAllyDied(source, target);
    if (temp != "") {
      result += "<div>" + temp + "</div>";
    }
  }
  
  for (var i = 0; i < target._enemies.length; i++) {
    temp = target._enemies[i].eventEnemyDied(source, target);
    if (temp != "") {
      result += "<div>" + temp + "</div>";
    }
  }
  
  return result;
}


function speedSort(heroA, heroB) {
  if (heroA._currentStats["speed"] > heroB._currentStats["speed"]) {
    return -1;
  } else if (heroA._currentStats["speed"] < heroB._currentStats["speed"]) {
    return 1;
  } else if (heroA._attOrDef == "att" && heroB._attOrDef == "def") {
    return -1;
  } else if (heroA._attOrDef == "def" && heroB._attOrDef == "att") {
    return 1;
  } else if (heroA._heroPos < heroB._heroPos) {
    return -1;
  } else {
    return 1;
  }
}


function checkForWin() {
  var attAlive = 0;
  var defAlive = 0;
  var numOfHeroes = 0;
  
  numOfHeroes = attHeroes.length;
  for (var i = 0; i < numOfHeroes; i++) {
    if (attHeroes[i]._currentStats["totalHP"] > 0) {
      attAlive++;
    }
  }
  
  numOfHeroes = defHeroes.length;
  for (var i = 0; i < numOfHeroes; i++) {
    if (defHeroes[i]._currentStats["totalHP"] > 0) {
      defAlive++;
    }
  }
  
  if (attAlive == 0 && defAlive >= 0) {
    return "def";
  } else if (attAlive > 0 && defAlive == 0) {
    return "att";
  } else {
    return "";
  }
}