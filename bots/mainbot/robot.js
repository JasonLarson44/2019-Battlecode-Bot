import {BCAbstractRobot, SPECS} from 'battlecode';
import castle from './castle.js'
import crusader from './crusader.js'

class MyRobot extends BCAbstractRobot {
	constructor() {
        super();
        this.myType = undefined;
        this.step = -1;
    }
	
	turn() {
        this.step++;

        switch (this.me.unit) {
        	case SPECS.CASTLE:
				this.myType = castle;
        		break;
			case SPECS.CRUSADER:
				this.myType = crusader;
				break;
        	default:
				break;
        }
		return this.myType.takeTurn(this);
    }
}

var robot = new MyRobot();
