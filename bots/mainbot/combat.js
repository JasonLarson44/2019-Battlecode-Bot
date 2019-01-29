'use strict';
import {SPECS} from 'battlecode';
import utilities from "./utilities.js";

const combat = {};

combat.attackBot = (self, target) => {
    let dx = target.x - self.me.x;
    let dy = target.y - self.me.y;

    return self.attack(dx, dy);
};

export default combat;