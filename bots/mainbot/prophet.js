import {BCAbstractRobot, SPECS} from 'battlecode';
import movement from './movement.js'
import utilities from './utilities.js'
import combat from './combat.js'

const prophet = {};

prophet.takeTurn = (self) => {
    self.log("Prophet turn")
    // let enemies = utilities.enemiesInRange(self);
    // if (self.moveQueue === undefined) {
    //     self.moveQueue = [];
    // }
    // if(enemies.length > 0){
    //     for(let i = 0; i < enemies.length; ++i){
    //         if(enemies[i].unit === SPECS.CASTLE){
    //             self.log("Attacking Castle");
    //             return combat.attackBot(self, enemies[i]);
    //         }
    //     }
    // }
    // if (self.step === 0 ){
    //     self.log("Searching for castle on horizontal symmetric map");
    //     self.moveQueue = movement.moveTo(self, (self.map[0].length - self.me.x), (self.me.y))
    // }
    // if (self.moveQueue.length !== 0) {
    //     let move = self.moveQueue.shift();
    //     self.log("moving to " + (move.x) + ', ' + (move.y));
    //     return self.move((move.x - self.me.x), (move.y - self.me.y));
    // }
    // else if(self.step !== 0 && enemies.length < 1){
    //     self.log("Searching for castle on vertically symmetric map");
    //     self.moveQueue = movement.moveTo(self, (self.map[0].length - self.me.x), (self.map.length - self.me.y))
    // }


};

export default prophet;
