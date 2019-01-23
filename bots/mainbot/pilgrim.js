'use strict';

import {BCAbstractRobot, SPECS} from 'battlecode';

const pilgrim = {};

pilgrim.mission = undefined;
pilgrim.target = undefined;
pilgrim.home = undefined;

// Find the closest Karbonite deposit to my current location
pilgrim.findClosestKarbonite = (self) => {
	var closestLocation = undefined;
	var closestDistance = Infinity;
	
	var i, j;
	for (i = 0; i < self.karbonite_map.length; i++) {
		for (j = 0; j < self.karbonite_map[i].length; j++) {
			if (self.karbonite_map[i][j]) {
				var distance = Math.pow(self.me.x - j, 2) + Math.pow(self.me.y - i, 2);
				if (distance < closestDistance) {
					closestDistance = distance;
					closestLocation = {x: j, y: i};
				}
			}
		}
	}

	self.log(`Found karbonite at (${closestLocation.x}, ${closestLocation.y})`);
	return closestLocation;
}
	
// Find the closest fuel deposit to my current location
pilgrim.findClosestFuel = (self) => {
	var closestLocation = undefined;
	var closestDistance = Infinity;
	
	var i, j;
	for (i = 0; i < self.fuel_map.length; i++) {
		for (j = 0; j < self.fuel_map[i].length; j++) {
			if (self.fuel_map[i][j]) {
				var distance = Math.pow(self.me.x - j, 2) + Math.pow(self.me.y - i, 2);
				if (distance < closestDistance) {
					closestDistance = distance;
					closestLocation = {x: j, y: i};
				}
			}
		}
	}

	self.log(`Found fuel at (${closestLocation.x}, ${closestLocation.y})`);
	return closestLocation;
}

pilgrim.takeTurn = (self) => {
	// Record home location of castle to give collected resources to
	if (pilgrim.home === undefined) {
		for (var robot of self.getVisibleRobots()) {
			if (robot.unit === SPECS.CASTLE) {
				pilgrim.home = {x: robot.x, y: robot.y};
				self.log(`Castle at (${pilgrim.home.x}, ${pilgrim.home.y})`);
				break;
			}
		}
		if (pilgrim.home === undefined) {
			self.log("No castle found!");
		}
	}

	switch (pilgrim.mission) {
		case undefined:
			if (self.karbonite < 500) {
				pilgrim.mission = 'karbonite'
			} else {
				pilgrim.mission = 'fuel'
			}
			pilgrim.target = undefined;
			self.log ("Pilgrim " + self.id + " on " + pilgrim.mission + " mission")
			break;
		
		case 'karbonite':
			if (pilgrim.target === undefined) {
				pilgrim.target = pilgrim.findClosestKarbonite(self);
			} else if (pilgrim.target.x === self.me.x && pilgrim.target.y === self.me.y) {
				if (self.me.karbonite < SPECS.UNITS[SPECS.PILGRIM].KARBONITE_CAPACITY) {
					self.log(`Mining Karbonite at (${self.me.x}, ${self.me.y}) (Current: ${self.me.karbonite})`);
					return self.mine();
				} else {
					self.log("Max karbonite capacity reached. Returning home.");
					pilgrim.mission = 'return';
					pilgrim.move(self, pilgrim.home);
				}
			} else {
				self.log(`Target: (${pilgrim.target.x}, ${pilgrim.target.y})    Location: ${[self.me.x, self.me.y]}`)
				return pilgrim.move(self, pilgrim.target);
			}
			break;

		case 'fuel':
			if (pilgrim.target === undefined) {
				pilgrim.target = pilgrim.findClosestFuel(self);
			} else if (pilgrim.target.x === self.me.x && pilgrim.target.y === self.me.y) {
				if (self.me.fuel < SPECS.UNITS[SPECS.PILGRIM].FUEL_CAPACITY) {
					self.log(`Mining fuel at (${self.me.x}, ${self.me.y}) (Current: ${self.me.fuel})`);
					return self.mine();
				} else {
					self.log("Max fuel capacity reached. Returning home.");
					pilgrim.mission = 'return';
					pilgrim.move(self, pilgrim.home);
				}
			} else {
				self.log(`Target: (${pilgrim.target.x}, ${pilgrim.target.y})    Location: ${[self.me.x, self.me.y]}`)
				return pilgrim.move(self, pilgrim.target);
			}
			break;

		case 'return':
			if (Math.abs(self.me.x - pilgrim.home.x + self.me.y - pilgrim.home.y) < 2) {
				pilgrim.mission = undefined;
				self.log(`Giving ${self.me.karbonite} karbonite to castle at (${pilgrim.home.x}, ${pilgrim.home.y}), delta (${self.me.x - pilgrim.home.x}, ${self.me.y - pilgrim.home.y})`)
				return self.give(pilgrim.home.x - self.me.x, pilgrim.home.y - self.me.y, self.me.karbonite, self.me.fuel);
			} else {
				return pilgrim.move(self, pilgrim.home);
			}
			break;
	}
}

pilgrim.move = (self, target) => {
	var dx = 0, dy = 0;
	if (self.me.x < target.x) {
		dx += 1;
	} else if (self.me.x > target.x) {
		dx -= 1;
	}

	if (self.me.y < target.y) {
		dy += 1;
	} else if (self.me.y > target.y) {
		dy -= 1;
	}

	if (self.map[self.me.x + dx][self.me.y + dy]) {
		self.log("Moving from (" + self.me.x + ", " + self.me.y + ") in (" + dx + ", " + dy + ") toward (" + target.x + ", " + target.y + ")");
		return self.move(dx, dy);
	} else {
		self.log("Path occupied.");
	}

}

export default pilgrim;
