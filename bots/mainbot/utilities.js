'use strict';
import {SPECS} from 'battlecode';

const utilities = {};

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
	self.log(`Round ${self.me.turn} - ${message}`);
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

utilities.getDistance = (start, end) => {
    //get the manhattan distance
    return (Math.abs(start.x - end.x) + Math.abs(start.y - end.y))
};

// Returns true if loc2 is the same or one of the eight adjacent cells to loc1
utilities.isAdjacent = (loc1, loc2) => {
	return Math.abs(loc1.x - loc2.x) <= 1 && Math.abs(loc1.y - loc2.y) <= 1
}

export default utilities;