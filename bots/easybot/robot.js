import {BCAbstractRobot, SPECS} from 'battlecode';

var step = -1;

class MyRobot extends BCAbstractRobot {
    turn() {
        step++;


    }
}

var robot = new MyRobot();
