'use strict';

import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js' ;
import utilities from './utilities.js'
import combat from './combat.js'

const castle = {};
const pilgrims ={};


pilgrims.number = 0;

var first_castle = true ;
var castle_locs = [];


castle.takeTurn = (self) => {
	self.log('castle taking turn')
	
	var robotsnearme = self.getVisibleRobots();

	var getBuildDir = function(buildunit) {
        var options = nav.rotate_arr.filter((d) => {
            return nav.isPassable(nav.applyDir(self.me, d), self.getPassableMap(), self.getVisibleRobotMap())
        })
        return options[0];
	}

	var attackable = robotsnearme.filter((r) => {
        if (! self.isVisible(r)){
            return false;
        }
        const dist = (r.x-self.me.x)**2 + (r.y-self.me.y)**2;
        if (r.team !== self.me.team
            && SPECS.UNITS[self.me.unit].ATTACK_RADIUS[0] <= dist
            && dist <= SPECS.UNITS[self.me.unit].ATTACK_RADIUS[1] ){
            return true;
        }
        return false;
	});
	
	if (attackable.length>0){
        // attack first robot
        var r = attackable[0];
        self.log('' +r);
        self.log('attacking!(red team) ' + r + ' at loc ' + (r.x - self.me.x, r.y - self.me.y));
        return self.attack(r.x - self.me.x, r.y - self.me.y);
    }


		if(self.me['turn'] == '1')
		{
			utilities.log(self, `Castle Location: ${[self.me.x, self.me.y]}`)
			for(var i=0 ;i< robotsnearme.length; i++)
			{
				if(robotsnearme[i].castle_talk)
				{
					first_castle = false;
				//	self.log('Checking castles')
				//	castle_locs.push((robotsnearme[i].castle_talk))
				}
			}
		self.castleTalk(self.id % 256)

		var d = getBuildDir(self.me);
			if (!(d === undefined)){
				self.log('Building a pilgrim at ' + (self.me.x+1) + ',' + (self.me.y+1));
				pilgrims.number++;
				return self.buildUnit(SPECS.PILGRIM, d.x, d.y);
			}
		
		}

		if(self.me['turn'] == 2)
		{
			//self.log(`robotslength: , ${robotsnearme.length}`)
			//self.log(first_castle)
			var robotsnear = self.getVisibleRobots();
			for (var i = 0 ; i < robotsnear.length ; i++)
			{
				if(robotsnear[i].castle_talk)
				{
					
					castle_locs.push((robotsnear[i].castle_talk))
					self.log('pushing castle locs')
				}
			}
		var d = getBuildDir(self.me);
        	if (!(d === undefined)){
            	self.log('Building a crusader at ' + (self.me.x+1) + ',' + (self.me.y+1));
            	return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
        	}
		
		}

		if(first_castle)
		{
			var d = getBuildDir(self.me);
				if (!(d === undefined)){
					self.log('Building a prophet at ' + (self.me.x+1) + ',' + (self.me.y+1));
					 return self.buildUnit(SPECS.PROPHET, d.x, d.y);
				}
				var d = getBuildDir(self.me);
				if (!(d === undefined)){
					self.log('Building a prophet at ' + (self.me.x+1) + ',' + (self.me.y+1));
					 return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
				}
		} 
	
	// this is just to checks the castle_locs	
	if(self.me['turn'] == 3)
	{
		self.log(`castle_locs length:, ${castle_locs.length}`)
		self.log([castle_locs])
		for( i = 0 ; i < castle_locs.length ;i++)
		{
		//	utilities.log(self , `Castles recorder Location: ${[castle_locs[x], castle_locs[y]]}` )
			self.log(`castle  recorded locations:' , ${castle_locs[i]}`)
		}
				var d = getBuildDir(self.me);
				if (!(d === undefined)){
					self.log('Building a prophet at ' + (self.me.x+1) + ',' + (self.me.y+1));
					 return self.buildUnit(SPECS.PROPHET, d.x, d.y);
				}	
	}

	
	if (pilgrims.number < 4 &&
		self.fuel > SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_FUEL'] + 10
	   && self.karbonite >= SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_KARBONITE'] )
	   {
	   var d = getBuildDir(self.me);
	   if (!(d === undefined)){
		   self.log('Building a pilgrim at(blue team) ' + (self.me.x+1) + ',' + (self.me.y+1));
		   pilgrims.number++;
		   return self.buildUnit(SPECS.PILGRIM, d.x, d.y);
		   }
	   } 
	   
	   if (self.me.turn > 10 && self.karbonite > 30 && self.fuel > 150 && Math.random() < .3333)
	   {
		   var d = getBuildDir(self.me);
	   if (!(d === undefined)){
		   self.log('Building a prophet at(blue team) ' + (self.me.x+1) + ',' + (self.me.y+1));
		   pilgrims.number++;
		   return self.buildUnit(SPECS.PROPHET, d.x, d.y);
		   }
	   }
	   
	   if (self.me.turn > 10 && self.karbonite > 30 && self.fuel > 150 && Math.random() < .3333)
	   {
		   var d = getBuildDir(self.me);
		   if (!(d === undefined)){
			   self.log('Building a crusader at ' + (self.me.x+1) + ',' + (self.me.y+1));
			   pilgrims.number++;
			   return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
			   }	
	   }		

	//var enemies = utilities.enemiesInRange(self);
/*	if(enemies.length > 0){
        for(let i = 0; i < enemies.length; ++i){
    //	if(enemies[i].unit === SPECS.CASTLE){
       // 		self.log("Attacking Castle");
        		return combat.attackBot(self, enemies[i]);
			}
		}
//	} */

};

export default castle;