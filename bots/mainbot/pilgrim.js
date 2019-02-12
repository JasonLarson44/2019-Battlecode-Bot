'use strict';

import {SPECS} from 'battlecode';
import utilities from './utilities.js'
import movement from './movement.js'

const pilgrim = {};

pilgrim.mission = undefined;// Current mission to fulfill
pilgrim.target = undefined;	// Location of resource we are mining
pilgrim.home = undefined;	// Location of originating castle
pilgrim.blacklist = [];		// List of resource locations to ignore

	
// Find the closest resource deposit that has not been blacklisted to my 
// current location
// Parameters: 
//		map - Either this.fuel_map or this.karbonite_map
//		blacklist - A list of locations to ignore when searching for resources
// Returns: Object with x and y properties specifying the coordinates of the
// closest resource deposit
pilgrim.findClosestResource = (self, map, blacklist=[]) => {
	var closestLocation = undefined;
	var closestDistance = Infinity;
	
	var i, j;
	for (i = 0; i < map.length; i++) {
		for (j = 0; j < map[i].length; j++) {
			if (map[i][j]) {
				var distance = Math.pow(self.me.x - j, 2) + Math.pow(self.me.y - i, 2);
				if (distance < closestDistance) {
					var blacklisted = false;

					for (var loc of pilgrim.blacklist) {
						if (loc.x == j && loc.y == i) {
							// Blacklisted
							blacklisted = true;
							break;
						}
					}

					if (!blacklisted) {
						closestDistance = distance;
						closestLocation = {x: j, y: i};
					}					
				}
			}
		}
	}

	utilities.log(self, `Found resource at (${closestLocation.x}, ${closestLocation.y})`);
	return closestLocation;
}

pilgrim.takeTurn = (self) => {
	// Record location of castle to give collected resources to
	if (pilgrim.home === undefined) {
		for (var robot of self.getVisibleRobots()) {
			if (robot.unit === SPECS.CASTLE) {
				pilgrim.home = {x: robot.x, y: robot.y};
				utilities.log(self, `Home castle at (${pilgrim.home.x}, ${pilgrim.home.y})`);
				break;
			}
		}

		// Unable to locate a castle within this robots visible range.
		// Shouldn't happen under normal circumstances.
		if (pilgrim.home === undefined) {
			utilities.log(self, "ERROR! No castle found!");
		}
	}

	if (pilgrim.mission === undefined) {
		if (self.karbonite < 500) {
			pilgrim.mission = 'karbonite'
			pilgrim.target = pilgrim.findClosestResource(self, self.karbonite_map);
		} else {
			pilgrim.mission = 'fuel'
			pilgrim.target = pilgrim.findClosestResource(self, self.fuel_map);
		}
		utilities.log(self, `Pilgrim on ${pilgrim.mission} mission at (${pilgrim.target.x}, ${pilgrim.target.y})`)
	}

	switch (pilgrim.mission) {
		case 'karbonite':
		case 'fuel':
			// On top of a resource deposit
			if (pilgrim.target.x === self.me.x && pilgrim.target.y === self.me.y) {
				// Mine until we're full
				if (self.me.fuel < SPECS.UNITS[SPECS.PILGRIM].FUEL_CAPACITY && 
					self.me.karbonite < SPECS.UNITS[SPECS.PILGRIM].KARBONITE_CAPACITY) {
					utilities.log(self, `Mining ${pilgrim.mission} at (${self.me.x}, ${self.me.y}) (Current: ${Math.max(self.me.fuel, self.me.karbonite)})`);
					return self.mine();

				// Reached maximum capacity, return to home castle
				} else {
					utilities.log(self, `Max ${pilgrim.mission} capacity reached. Returning home.`);
					pilgrim.mission = 'return';
					pilgrim.move(self, pilgrim.home);
				}

			// Move toward the targeted resource deposit
			} else {
				if (utilities.isAdjacent(self.me, pilgrim.target) &&
				    !utilities.isOpen(self, pilgrim.target)) {
					// Resource occupied. Blacklist it and try another one.
					utilities.log(self, `Resource at (${pilgrim.target.x}, ${pilgrim.target.y}) occupied!`)
					pilgrim.blacklist.push(pilgrim.target);
					pilgrim.mission = undefined;
					return pilgrim.takeTurn(self);
				} else {
					utilities.log(self, `Target: (${pilgrim.target.x}, ${pilgrim.target.y})    Location: ${[self.me.x, self.me.y]}`)
					return pilgrim.move(self, pilgrim.target);
				}
			}
			break;

		// Return to home castle to deposit mined resources
		case 'return':
			// Adjacent to castle. Deposit resources
			if (utilities.isAdjacent(self.me, pilgrim.home)) {
				pilgrim.mission = undefined;
				utilities.log(self, `Giving ${self.me.karbonite} karbonite to castle at (${pilgrim.home.x}, ${pilgrim.home.y}), delta (${self.me.x - pilgrim.home.x}, ${self.me.y - pilgrim.home.y})`)
				return self.give(pilgrim.home.x - self.me.x, pilgrim.home.y - self.me.y, self.me.karbonite, self.me.fuel);

			// Move toward home castle
			} else {
				utilities.log(self, `Moving from (${self.me.x}, ${self.me.y}) toward home at (${pilgrim.home.x}, ${pilgrim.home.y}) - adjacent? ${utilities.isAdjacent(self.me, pilgrim.home)}`);
				return pilgrim.move(self, pilgrim.home);
			}
	}
}

// Move toward a target.
pilgrim.move = (self, target) => {
	let path = undefined;

	try {
		utilities.log(self, `Target: (${target.x}, ${target.y})`);
		path = movement.moveTo(self, target.x, target.y);
		utilities.log(self, `Path length: ${path.length}`);
	} catch(e) {
		utilities.log(self, "Path-finding algorithm raised an exception! Reverting to random movement.");
		return pilgrim.random_move(self);
	}
	let i = 0;

	while (i < path.length && !utilities.isOpen(self, path[i])) {
		utilities.log(self, `Step ${i}: (${path[i].x}, ${path[i].y})`)
		i++;
	}

	if (i >= path.length) {
		utilities.log(self, "Failed to find a path! Reverting to random movement.");
		return pilgrim.random_move(self);
	}

	utilities.log(self, "Distance to step: " + utilities.getDistance(self.me, path[i]));
	utilities.log(self, "Max speed: " + SPECS.UNITS[SPECS.PILGRIM].SPEED);
	if (utilities.getDistance(self.me, path[i]) > SPECS.UNITS[SPECS.PILGRIM].SPEED) {
		utilities.log(self, "Distance to far! Reverting to random movement.");
		return pilgrim.random_move(self);
	}

	let step = path[i];

	utilities.log(self, `step: (${step.x}, ${step.y})`);
	let dx = step.x - self.me.x;
	let dy = step.y - self.me.y;

	utilities.log(self, "Moving from (" + self.me.x + ", " + self.me.y + ") stepping (" + dx + ", " + dy + ") toward (" + target.x + ", " + target.y + ")");
	if (utilities.isOpen(self, {x: self.me.x + dx, y: self.me.y + dy})) {
		return self.move(dx, dy);
	} else {
		utilities.log(self, "Path occupied.");
	}
}

// Move in a random direction. Will only move to one of the 8 adjacent spaces around
// the robot's current location. Will not do anything if the location the robot
// wants to move to is impassable or occupied.
pilgrim.random_move = (self) => {
	let dx = Math.floor(Math.random() * 3) - 1;
	let dy = Math.floor(Math.random() * 3) - 1;

	if (utilities.isOpen(self, {x: self.me.x + dx, y: self.me.y + dy})) {
		utilities.log(self, "Randomly moving from (" + self.me.x + ", " + self.me.y + ") stepping (" + dx + ", " + dy + ")");
		return self.move(dx, dy);
	} else {
		utilities.log(self, "Random movement location occupied.");
		return;
	}
}

export default pilgrim;
