'use strict';
import {SPECS} from 'battlecode';

const utilities = {};

const LABELS = {};
LABELS[SPECS.CASTLE]   = "CASTLE";
LABELS[SPECS.CHURCH]   = "CHURCH";
LABELS[SPECS.PILGRIM]  = "PILGRIM";
LABELS[SPECS.CRUSADER] = "CRUSADER";
LABELS[SPECS.PROPHET]  = "PROPHET";
LABELS[SPECS.PREACHER] = "PREACHER";

// Returns true if the location is a) passable and b) the current robot can not
// see any robot in that location.
// NOTE: If the location is outside of the current robot's vision range and a
// robot occupies that location, this function will still return true.
utilities.isOpen = (self, location) => {
	if (location.x < 0 || location.y < 0) {
		return false;
	}
	// utilities.log(self, `isOpen(${location.x}, ${location.y}) = ${self.map[location.y][location.x] && (self.getVisibleRobotMap()[location.y][location.x] <= 0)}`);
	return self.map[location.y][location.x] && (self.getVisibleRobotMap()[location.y][location.x] <= 0);
};

// Prepend the round number before logging. May extend to log more information
utilities.log = (self, message) => {
	self.log(`Round ${self.me.turn} - ${LABELS[self.me.unit]} - ${message}`);
};

utilities.enemiesInRange = (self) => {
	let enemies = [];
	let botSpec = SPECS['UNITS'][self.me.unit];
	let minRange = botSpec['ATTACK_RADIUS'][0];
	let maxRange = botSpec['ATTACK_RADIUS'][1];
	let myTeam = self.me.team;
	let robotsInVision = self.getVisibleRobots();
	for(let i = 0; i < robotsInVision.length; ++i){
		if(robotsInVision[i].team !== myTeam && Math.pow(utilities.getDistance(self.me, robotsInVision[i]), 2) < maxRange){
			enemies.push(robotsInVision[i])
		}
	}
	return enemies;
};

utilities.getManhattanDistance = (start, end) => {
    //get the manhattan distance
    return (Math.abs(start.x - end.x) + Math.abs(start.y - end.y));
};

// Returns the SQUARE of the distance between start and end.
// Saves the expensive computation of a square root, and since the square root
// operation is monotonic, you can still accurately compare distances
utilities.getDistance = (start, end) => {
	if(start && end) {
    	return Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2);
	}
};

// Returns true if loc2 is the same or one of the eight adjacent cells to loc1
utilities.isAdjacent = (loc1, loc2) => {
	return Math.abs(loc1.x - loc2.x) <= 1 && Math.abs(loc1.y - loc2.y) <= 1;
}

// Returns true if loc2 is on one of the four sides of the loc1
utilities.isBeside = (loc1, loc2) => {
	return Math.abs(loc1.x - loc2.x) + Math.abs(loc1.y - loc2.y) <= 1;
}

// Returns true if loc can be moved to this turn
utilities.inMovementRange = (self, loc) => {
	return utilities.getDistance(self, loc) <= SPECS.UNITS[self.me.unit].SPEED;
}

export default utilities;
