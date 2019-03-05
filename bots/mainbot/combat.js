'use strict';
import {SPECS} from 'battlecode';
import utilities from "./utilities.js";

const combat = {};

combat.attackBot = (self, target) => {
    let dx = target.x - self.me.x;
    let dy = target.y - self.me.y;

    utilities.log(self, `Attempting to attack with a dx of ${dx} and dy of ${dy}`)

    return self.attack(dx, dy);
};

export default combat;
