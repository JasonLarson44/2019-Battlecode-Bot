'use strict';

const utilities = {}

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
}

// Prepend the round number before logging. May extend to log more information
utilities.log = (self, message) => {
	self.log(`Round ${self.me.turn} - ${message}`);
}

utilities.isAdjacent = (loc1, loc2) => {
	return Math.abs(loc1.x - loc2.x) <= 1 && Math.abs(loc1.y - loc2.y) <= 1
}

export default utilities;