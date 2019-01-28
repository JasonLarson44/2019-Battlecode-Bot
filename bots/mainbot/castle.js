'use strict';

import {BCAbstractRobot, SPECS} from 'battlecode';
import utilities from './utilities.js' ;
import nav from './nav.js' ;

const castle = {};
const pilgrims ={};

//pilgrim.destn = undefined;
pilgrims.number = 0;

castle.takeTurn = (self) => {
    self.log('castle taking turn')
	//const visible = self.getVisibleRobots();
	//self.log('the visbile robots are:' + visible) ;
	
	
	var getBuildDir = function(buildpilgrims) {
        var options = nav.rotate_arr.filter((d) => {
            return nav.isPassable(nav.applyDir(self.me, d), self.getPassableMap(), self.getVisibleRobotMap())
        })
        return options[0];
	}
	
	if (self.me['turn'] == 1)
	{
		var d = getBuildDir(self.me);
        if (!(d === undefined)){
            self.log('Building a pilgrim at ' + (self.me.x+1) + ',' + (self.me.y+1));
            pilgrims.number++;
            return self.buildUnit(SPECS.PILGRIM, d.x, d.y);
        }
	
	}

	else if (self.me['turn'] == 2)
	{
		var d = getBuildDir(self.me);
        if (!(d === undefined)){
            self.log('Building a pilgrim at ' + (self.me.x+1) + ',' + (self.me.y+1));
            pilgrims.number++;
            return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
        }
	}

	else if (self.me['turn'] == 3)
	{
		var d = getBuildDir(self.me);
        if (!(d === undefined)){
            self.log('Building a pilgrim at ' + (self.me.x+1) + ',' + (self.me.y+1));
            pilgrims.number++;
            return self.buildUnit(SPECS.PROPHET, d.x, d.y);
        }
	}

	else if (pilgrims.number < 2 &&
		 self.fuel > SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_FUEL'] + 10
		&& self.karbonite >= SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_KARBONITE'] )
		{
        var d = getBuildDir(self.me);
        if (!(d === undefined)){
            self.log('Building a pilgrim at ' + (self.me.x+1) + ',' + (self.me.y+1));
            pilgrims.number++;
            return self.buildUnit(SPECS.PILGRIM, d.x, d.y);
        }
    } 
   
	else
	if( (self.fuel > SPECS['UNITS'][SPECS['CRUSADER']]['CONSTRUCTION_FUEL'] + 10
	&& self.karbonite >= SPECS['UNITS'][SPECS['CRUSADER']]['CONSTRUCTION_KARBONITE']))

	{
        {
			var d = getBuildDir(self.me);
			if (!(d === undefined)){
				self.log('Building a crusadder at ' + (self.me.x+1) + ',' + (self.me.y+1));
				pilgrims.number++;
				return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
			}
	 
    	}	 

	}	  
};

/* if (pilgrims.number <=2  ) {
		self.log("inside building pilgrim" );
		if (pilgrims.destn === undefined )
		{
		self.log(self.me.x +','+ self.me.y)
		pilgrim.destn.x === self.me.x + 1;
		pilgrim.destn.y === self.me.y + 1;
	}
//		self.log(pilgrim.destn.x)
		var d = pilgrims.build(self, pilgrims.destn);
//		self.log('value of d is' + d.x + ',' + d.y)
		if(! (d === undefined))
		{
			self.log('direction is' + (d.x) + ',' (d.y) )	
        	self.log('Building a pilgrim at ' + (self.me.x+1) + ',' + (self.me.y+1));
			pilgrims.number++;
			return self.buildUnit(SPECS.PILGRIM, d.x, d.y);
		}
    } */ 


  /*pilgrims.build = (self, target) => {
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

	if (utilities.isOpen(self, {x: self.me.x + dx, y: self.me.y + dy})) {
		utilities.log(self, "Building at  " + dx + ", " + dy );
		return self.build(dx, dy);
	} else {
		utilities.log(self, "Path occupied.");
	}

} */

export default castle;

