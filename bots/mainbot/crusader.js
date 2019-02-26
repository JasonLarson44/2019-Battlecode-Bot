import {BCAbstractRobot, SPECS} from 'battlecode';
import movement from './movement.js'
import utilities from './utilities.js'
import combat from './combat.js'

const crusader = {};


crusader.takeTurn = (self) => {
	let enemies = utilities.enemiesInRange(self);
	let phase = utilities.getCastleSignal(self);

	utilities.log(self, "Phase " + phase);

	if (phase === 0){
		return crusader.buildPhase(self, enemies);
	}
	else if(phase === 1){
		return crusader.attackPhase(self, enemies);
	}
	else{
		utilities.log(self, "Unknown phase");
	}

};

crusader.attackPhase = (self, enemies) => {
	utilities.log(self, "Executing Attack Phase turn");
    if (self.moveQueue === undefined) {
        self.moveQueue = [];
    }
    if(enemies.length > 0){
        for(let i = 0; i < enemies.length; ++i){
            if(enemies[i].unit === SPECS.CASTLE){
                self.log("Attacking Castle");
            }
            return combat.attackBot(self, enemies[i]);
        }
    }
    // Set up first search for horizontal castle
    if (self.step === 0 ){
        self.log("Searching for castle on horizontal symmetric map");
        self.horizontalCastle = {x: (self.map[0].length - self.me.x), y: self.me.y};
        self.verticalCastle = {x: self.me.x, y: (self.map.length - self.me.y)};
        self.targetCastle = self.horizontalCastle;
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
        }
    }
    else{
        self.log("Moving to target castle at x: " + self.targetCastle.x + ", y: " + self.targetCastle.y);
        self.moveQueue = movement.moveTo(self, self.targetCastle.x, self.targetCastle.y)
    }

};

crusader.buildPhase = (self, enemies) => {
    utilities.log(self, "Executing Build Phase turn");

};

export default crusader;
