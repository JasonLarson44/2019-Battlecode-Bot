import {BCAbstractRobot, SPECS} from 'battlecode';

const castle = {};

castle.takeTurn = (self) => {
	if (self.step % 10 === 0) {
		self.log("Building a crusader at " + (self.me.x+1) + ", " + (self.me.y+1));
		return self.buildUnit(SPECS.CRUSADER, 1, 1);
	} else {
		return // this.log("Castle health: " + this.me.health);
	}
}

export default castle;
