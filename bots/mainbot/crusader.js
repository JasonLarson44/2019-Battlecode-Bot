import {BCAbstractRobot, SPECS} from 'battlecode';
import movement from './movement.js'
import utilities from './utilities.js'
import combat from './combat.js'

const crusader = {};

crusader.takeTurn = (self) => {
	self.log("crusader turn")
    self.castleTalk(SPECS.CRUSADER)
    if (self.horizontalCastle === undefined){
        self.horizontalCastle = {x: (self.map[0].length - self.me.x), y: self.me.y};
    }
    if (self.verticalCastle === undefined){
        self.verticalCastle = {x: self.me.x, y: (self.map.length - self.me.y)};
    }
    if (self.targetCastle === undefined){
        self.targetCastle = self.horizontalCastle;
    }
    if(self.attacking === undefined){
        self.attacking = false;
    }
    let enemies = utilities.enemiesInRange(self);
    // If attack skip phase check
    if (self.attacking === true){
        utilities.log(self, "Continuing attack phase")
        return crusader.attackPhase(self, enemies);
    }
    // If we aren't attacking check the phase to see if castle has said to attack
	let phase = utilities.getCastleSignal(self);

	if(phase === 1){
        self.attacking = true;
		return crusader.attackPhase(self, enemies);
	}
	else{
		utilities.log(self, "defaulting to build phase");
        return crusader.buildPhase(self, enemies);
	}
};

crusader.attackPhase = (self, enemies) => {
    utilities.log(self, "Executing Attack Phase turn");
    if (self.moveQueue === undefined) {
        self.moveQueue = [];
    }
    utilities.log(self, `Found ${enemies.length} enemies near me`)
    if(enemies.length > 0){
        for(let i = 0; i < enemies.length; ++i){
            if(enemies[i].unit === SPECS.CASTLE){
                self.log("Attacking Castle");
            }
            return combat.attackBot(self, enemies[i]);
        }
    }

    // If we made it to the horizontal location and there is nothing to attack the castle is probably at the vertical loc
    if(self.me.x === self.horizontalCastle.x && self.me.y === self.horizontalCastle.y){
    	self.targetCastle = self.verticalCastle
	}

    if (self.moveQueue.length !== 0) {
        let move = self.moveQueue.shift();
        self.log("moving to " + (move.x) + ', ' + (move.y));
        try{
            return self.move((move.x - self.me.x), (move.y - self.me.y));
		}
		catch (e) {
			utilities.log(self, "Caught an error" + e)
			self.moveQueue = [];
			return movement.random(self);

        }
    }
    else{
        self.log("Moving to target castle at x: " + self.targetCastle.x + ", y: " + self.targetCastle.y);
        self.moveQueue = movement.moveTo(self, self.targetCastle.x, self.targetCastle.y);
        if(self.moveQueue.length === 0){
            self.targetCastle.x += 1;
            self.targetCastle.y += 1;
        }
    }

};

crusader.buildPhase = (self, enemies) => {
    utilities.log(self, "Executing Build Phase turn");
    if(self.home === undefined){
        // Track where the robot spawned
        self.home = utilities.findClosestCastle(self);
    }
    let distFromCastle = Math.sqrt(utilities.getDistance({x: self.me.x, y: self.me.y}, self.home));
    utilities.log(self, `Distance from castle ${distFromCastle}`);
    if(enemies.length > 0){
        return combat.attackBot(self, enemies[0]);
    }
    else if((distFromCastle < 2) || (!((self.me.x % 2 !== 0 && self.me.y % 2 !== 1) || (self.me.x % 2 !== 1 && self.me.y % 2 !== 0)))){
        // Move random until we get away from the castle
        return movement.random(self);
    }
};

export default crusader;
