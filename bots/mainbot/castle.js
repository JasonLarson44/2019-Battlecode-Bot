'use strict';

import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js' ;
import utilities from './utilities.js'
import combat from './combat.js'

const castle = {};
const pilgrims ={};

pilgrims.number = 0;

castle.takeTurn = (self) => {
    self.log('castle taking turn')
	const visible = self.getVisibleRobots();
    castle.countUnits(self, visible);
    let enemies = utilities.enemiesInRange(self);
    castle.incrementBuildCounter(self);

    utilities.log(self, `Current unit counts: Crusaders: ${self.crusader_count}, Prophets: ${self.prophet_count}, Pilgrims: ${self.pilgrim_count}`)
    utilities.log(self, `Current build count is: ${self.builtItems}`)

	if(self.strategy === 'crusaderRush' && self.crusader_count >= 3){
        self.signal(0x01, 5);
        utilities.log(self, "Castle setting attack phase")
	}
    if(self.strategy === 'prophetArmy' && self.prophet_count >= 6){
        self.signal(0x01, 5);
        utilities.log(self, "Castle setting attack phase")
	}

	var robotsnearme = self.getVisibleRobots();

	var getBuildDir = function(buildunit) {
        var options = nav.rotate_arr.filter((d) => {
            return nav.isPassable(nav.applyDir(self.me, d), self.getPassableMap(), self.getVisibleRobotMap())
        });
        return options[0];
	};

	if (enemies.length>0){
        // attack first robot
        combat.attackBot(self, enemies[0])
    }

	if(self.me.turn == '1')
	{
		utilities.log(self, `Castle Location: ${[self.me.x, self.me.y]}`)
		self.castle_count = visible.length;
		utilities.log(self, `Found ${self.castle_count} castles`);
        if(self.map.length <= 40 || self.castle_count === 1){
            self.strategy = 'crusaderRush'
        }
        else{
            self.strategy = 'prophetArmy'
        }
        self.builtItems = 0;

        if(self.castle_count === 1){
            // IF only one castle set the queuePos to 0.
            // Anything mod the
            self.queue = [self.id];
        }
        else{
            // Sort by ids
            let castleIds = []
            for(let i = 0; i < visible.length; ++i){
                castleIds.push(visible[i].id)
            }
            self.queue = castleIds.sort(function(a, b){return a - b})
            return
        }
	}
    if( self.queue[(self.builtItems % self.castle_count)] === self.id){
        return castle.buildUnits(self);
    }
    else{
        return undefined
    }

};

// Lets us split up the function for building. If it's not this castle's turn we
// Can skip all of the build logic
castle.buildUnits = (self) => {
    switch (self.strategy) {
        case 'crusaderRush':
            return castle.crusaderRush(self);
            break;
        case 'prophetArmy':
            return castle.prophetArmy(self);
            break;
        default:
    }
};

castle.crusaderRush = (self) => {

    // If we have less than enough pilgrims and we have the resources
    if (pilgrims.number < 3 &&
        self.fuel > SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_FUEL'] + 10 &&
	    self.karbonite >= SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_KARBONITE'] ){
           var d = castle.getBuildDir(self);
           if (!(d === undefined)){
               utilities.log(self, `Building pilgrim at: ${d.x}, ${d.y}`)
               pilgrims.number++;
               // Let other castles know we built
               self.castleTalk(0x01);
               self.builtItems += 1;
               return self.buildUnit(SPECS.PILGRIM, d.x, d.y);
           }
       }
       // If we have enough pilgrims just build prophets
    if (self.fuel > SPECS['UNITS'][SPECS['CRUSADER']]['CONSTRUCTION_FUEL'] &&
        self.karbonite > SPECS['UNITS'][SPECS['CRUSADER']]['CONSTRUCTION_KARBONITE']){
            let d = castle.getBuildDir(self);
            if(d !== undefined){
                utilities.log(self, `Building crusader at: ${d.x}, ${d.y}`)
                self.castleTalk(0x01);
                self.builtItems += 1;
                return self.buildUnit(SPECS.CRUSADER, d.x, d.y)
            }
        }
};

castle.prophetArmy = (self) => {

    // If we have less than enough pilgrims and we have the resources
    if (pilgrims.number < 4 &&
        self.fuel > SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_FUEL'] + 10 &&
	    self.karbonite >= SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_KARBONITE'] ){
           var d = castle.getBuildDir(self);
           if (!(d === undefined)){
               utilities.log(self, `Building pilgrim at: ${d.x}, ${d.y}`)
               pilgrims.number++;
               // Let other castles know we built
               self.castleTalk(0x01);
               self.builtItems += 1;
               return self.buildUnit(SPECS.PILGRIM, d.x, d.y);
           }
       }
       // If we have enough pilgrims just build prophets
    if (self.fuel > SPECS['UNITS'][SPECS['PROPHET']]['CONSTRUCTION_FUEL'] &&
        self.karbonite > SPECS['UNITS'][SPECS['PROPHET']]['CONSTRUCTION_KARBONITE']){
            let d = castle.getBuildDir(self);
            if(d !== undefined){
                utilities.log(self, `Building prophet at: ${d.x}, ${d.y}`)
                self.castleTalk(0x01);
                self.builtItems += 1;
                return self.buildUnit(SPECS.PROPHET, d.x, d.y)
            }
        }
};

// Counts bots castle can see.
castle.countUnits = (self, visibleBots) => {
    let bot = undefined;
    // Zero the counts
    self.crusader_count = 0;
    self.pilgrim_count = 0;
    self.prophet_count = 0;
    for (let i = 0; i < visibleBots.length; ++i){
        bot = visibleBots[i];
        // utilities.log(self, `Bot at ${i} has unit ${bot.unit} and castleTalk ${bot.castleTalk}`);
        switch (bot.unit) {
			case SPECS.CRUSADER:
				self.crusader_count +=1;
				break;
			case SPECS.PILGRIM:
				self.pilgrim_count +=1;
				break;
			case SPECS.PROPHET:
				self.prophet_count +=1;
				break;
			default:
				break;
		}
    }
};

// Increment the build counter if another castle built a unit
castle.incrementBuildCounter = (self) => {
    let otherCastle = undefined;
    if(self.queue !== undefined){
        for(let i = 0; i < self.queue.length; ++i){
                if(self.queue[i] !== self.id){
                otherCastle = self.getRobot(self.queue[i]);
                utilities.log(self, `Reading castle talk: ${otherCastle.castle_talk}`)
                if (otherCastle === null){
                    // Castle was destroyed
                    self.castle_count -= 1;
                    self.friendlyCastles.splice(i, 1)
                }
                else if(otherCastle.castle_talk === 0x01){
                    self.builtItems += 1;
                }
            }
        }
    }
};

castle.getBuildDir = (self) => {
    let options = nav.rotate_arr.filter((d) => {
        return nav.isPassable(nav.applyDir(self.me, d), self.getPassableMap(), self.getVisibleRobotMap())
    });
    return options[0];
};

export default castle;
