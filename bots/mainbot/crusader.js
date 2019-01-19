import {BCAbstractRobot, SPECS} from 'battlecode';

const crusader = {};

crusader.takeTurn = (self) => {
	self.log("Crusader health: " + self.me.health);
	const choices = [[0,-1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
	const choice = choices[Math.floor(Math.random()*choices.length)]
	return self.move(...choice);

}

export default crusader;
