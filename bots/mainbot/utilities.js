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

utilities.log = (self, message) => {
	self.log(`Round ${self.me.turn} - ${message}`);
}

export default utilities;