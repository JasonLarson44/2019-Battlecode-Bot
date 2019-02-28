'use strict';

import { BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js' ;
import utilities from './utilities.js'
import combat from './combat.js'

const castle = {};
const pilgrims ={};
pilgrims.number = 0;
var castle_ids = [];
var builds = 0;
var buildunitflag =0 ;
castle.takeTurn = (self) => {
	
	self.log('castle taking turn')
	var robotsnearme = self.getVisibleRobots();

			
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

	if (attackable.length>0 && self.me.health > 50 ){
        // attack first robot
        var r = attackable[0];
        self.log('' +r);
        self.log('attacking! ' + r + ' at loc ' + (r.x - self.me.x, r.y - self.me.y));
        return self.attack(r.x - self.me.x, r.y - self.me.y);
	} 

	var getBuildDir = function(buildunit) {
		var options = nav.rotate_arr.filter((d) => {
			return nav.isPassable(nav.applyDir(self.me, d), self.getPassableMap(), self.getVisibleRobotMap())
		})
		return options[0];
	} 

	if(self.me['turn'] == '1')
	{
		for(var i=0 ;i< robotsnearme.length; i++)
			{
				castle_ids.push((robotsnearme[i].id))
			}
		castle_ids.sort();
		self.log("castle_ids: " + castle_ids)
		// self.castleTalk(1)
	

	}
	
	if(self.me['turn'] > 1  && pilgrims.number < 4 &&
		self.fuel > SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_FUEL'] + 10
			&& self.karbonite >= SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_KARBONITE'])
	{	   
		  var d = getBuildDir(self.me);
		  if (!(d === undefined)){
			  self.log('Building a pilgrim at ' + (self.me.x+1) + ',' + (self.me.y+1));
			  pilgrims.number++;
			  return self.buildUnit(SPECS.PILGRIM, d.x, d.y);
			  }
	} 
	
	if(self.me['turn'] > 1 && castle_ids.length == 1)
	{
		self.log("Im the only castle let me keep building")
		if ( buildunitflag === 0 && self.karbonite > 30 && self.fuel > 100)
	   	{
		   var d = getBuildDir(self.me);
		   if (!(d === undefined)){
			   self.log('Building a crusader ' + (self.me.x+1) + ',' + (self.me.y+1));
			   buildunitflag = (buildunitflag + 1) % 2
			    return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
			   }
				
	   	}
		if (buildunitflag === 1 && self.karbonite > 30 && self.fuel > 100)
		{
				var d = getBuildDir(self.me);
		if (!(d === undefined)){
				self.log('Building a prophet at' + (self.me.x+1) + ',' + (self.me.y+1));
				buildunitflag = (buildunitflag + 1) % 2
				return self.buildUnit(SPECS.PROPHET, d.x, d.y);
				}	
			
		}			
	}

	else if(self.me['turn'] > 1 && castle_ids.length > 1)
	{	
		self.log('More than 1 castle')

		// Check if anybody built something
		for(let id of castle_ids) {
			let castle = self.getRobot(id);

			if (castle === null) {
				// If castle has been destroyed, remove it from the list of castles
				castle_ids.splice(castle_ids.indexOf(id), 1)
			} else {
				// Check if castle built anything
				if (castle.castle_talk === 0x01) {
					self.log("Detected build by " + id)
					builds++;
				}
			}
		}

		self.log('How many castles remain? ' + castle_ids.length)
		if(castle_ids.length === 1)
		{
			self.log("Im the only castle let me keep building")
			if (buildunitflag === 0 && self.karbonite > 30 && self.fuel > 100 )
			{
			   var d = getBuildDir(self.me);
			   if (!(d === undefined)) {
					self.log('Building a crusader ' + (self.me.x+1) + ',' + (self.me.y+1));
					buildunitflag = (buildunitflag + 1) % 2
					return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
				}
			}
			if ( buildunitflag === 1 &&self.karbonite > 30 && self.fuel > 100 )
			{
					var d = getBuildDir(self.me);
			if (!(d === undefined)){
					self.log('Building a prophet at' + (self.me.x+1) + ',' + (self.me.y+1));
					buildunitflag = (buildunitflag + 1) % 2
					return self.buildUnit(SPECS.PROPHET, d.x, d.y);
					}
				
			}			
		}

		// If it's our turn, try building something.
		if (castle_ids[builds%castle_ids.length] === self.me.id) {
			// Build something
						
			if ( buildunitflag === 0 && self.karbonite > 30 && self.fuel > 100)
			{
				var d = getBuildDir(self.me);
				if (!(d === undefined)){
					self.log('Building a crusader at' + (self.me.x+1) + ',' + (self.me.y+1));
					buildunitflag = (buildunitflag + 1) % 2
					return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
					}	
					
			}
			if ( buildunitflag === 1 && self.karbonite > 30 && self.fuel > 100 )
			{
				var d = getBuildDir(self.me);
				if (!(d === undefined)){
					self.log('Building a prophet at' + (self.me.x+1) + ',' + (self.me.y+1));
					buildunitflag = (buildunitflag + 1) % 2
					return self.buildUnit(SPECS.PROPHET, d.x, d.y);
				}	
				
			}
		
			self.log("I built something");
			self.castleTalk(0x01);
		}
	}

	pilgrims.signal = 0;
	for (i =0 ; i < robotsnearme.length ; i++)
	{
		var robot = robotsnearme[i]
		if( robot.castle_talk == 0xFF)
		{
			pilgrims.signal++
		}
	}

	if(self.me['turn'] > 1 &&  pilgrims.signal < 4 &&
		self.fuel > SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_FUEL'] + 10
			&& self.karbonite >= SPECS['UNITS'][SPECS['PILGRIM']]['CONSTRUCTION_KARBONITE'])
	{	   
		  var d = getBuildDir(self.me);
		  if (!(d === undefined)){
			  self.log('Building a pilgrim at ' + (self.me.x+1) + ',' + (self.me.y+1));
			  pilgrims.number++;
			  return self.buildUnit(SPECS.PILGRIM, d.x, d.y);
			  }
	} 

/*
			for(var i = 0 ; i < castle_ids.length ;i++ )
		{
			if(castle_ids[i] % 3 == 0 && robotsnearme[i].castle_talk == 1 )
			{ 
				self.log('Inside mod value == 0')
				if ( self.karbonite > 30 && self.fuel > 150)
	   			{
		   			var d = getBuildDir(self.me);
		   			if (!(d === undefined)){
					   self.log('Building a crusader at' + (self.me.x+1) + ',' + (self.me.y+1));
					 return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
			  		 }	
					crusadernum++	
	   			}
				if ( self.karbonite > 30 && self.fuel > 150 )
				{
					var d = getBuildDir(self.me);
					if (!(d === undefined)){
						self.log('Building a prophet at' + (self.me.x+1) + ',' + (self.me.y+1));
						return self.buildUnit(SPECS.PROPHET, d.x, d.y);
					}	
					prophetnum++
				}			
				self.log('Crusaders built are mod ==0 :' + crusadernum)
				self.log('prophets built are :' + prophetnum)

				if(crusadernum == 5 && prophetnum == 5)
				{
					buildflag = 1
					self.castleTalk(1)
				}
				
			}	
		else if (castle_ids[i] % 3 == 1 && robotsnearme[i].castle_talk == 1)
		{ 
			self.log('Inside mod value == 1')
			if ( self.karbonite > 30 && self.fuel > 150 )
			   {
				   var d = getBuildDir(self.me);
				   if (!(d === undefined)){
				   self.log('Building a crusader at' + (self.me.x+1) + ',' + (self.me.y+1));
				 return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
				   }	
				crusadernum++	
			   }
			if ( self.karbonite > 30 && self.fuel > 150 )
			{
				var d = getBuildDir(self.me);
				if (!(d === undefined)){
					self.log('Building a prophet at' + (self.me.x+1) + ',' + (self.me.y+1));
					return self.buildUnit(SPECS.PROPHET, d.x, d.y);
				}	
				prophetnum++
			}			
			self.log('Crusaders built are mod == 1 :' + crusadernum)
            self.log('prophets built are :' + prophetnum)
			if(crusadernum == 5 && prophetnum == 5)
			{
				buildflag = 1
				self.castleTalk(1)
			}
		}
		else if(castle_ids[i] % 3 == 2 && robotsnearme[i].castle_talk == 1 )
		{
			self.log('Inside mod answer == 2')
		if ( self.karbonite > 30 && self.fuel > 150 )
			   {
				   var d = getBuildDir(self.me);
				   if (!(d === undefined)){
				   self.log('Building a crusader at' + (self.me.x+1) + ',' + (self.me.y+1));
				 return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
				   }	
				crusadernum++	
			   }
			if ( self.karbonite > 30 && self.fuel > 150 )
			{
				var d = getBuildDir(self.me);
				if (!(d === undefined)){
					self.log('Building a prophet at' + (self.me.x+1) + ',' + (self.me.y+1));
					return self.buildUnit(SPECS.PROPHET, d.x, d.y);
				}	
				prophetnum++
			}			
			self.log('Crusaders built are mod ==2 :' + crusadernum)
			self.log('prophets built are :' + prophetnum)
			if(crusadernum == 5 && prophetnum == 5)
			{
				buildflag = 0
				self.castleTalk(1)
			}
	
		}	
	
	}
	
/*	if(self.me['turn'] == 2 )
	{
			var d = getBuildDir(self.me);
			if (!(d === undefined)){
			self.log('Building a pilgrim at ' + (self.me.x+1) + ',' + (self.me.y+1));
			pilgrims.number++;
			return self.buildUnit(SPECS.PILGRIM, d.x, d.y);
		} 	
			
	}
		
	if(self.me['turn'] == 3)
	{
		self.log('Turn 2 for blue team')
				var d = getBuildDir(self.me);
				if (!(d === undefined)){
					self.log('Building a prophet at ' + (self.me.x+1) + ',' + (self.me.y+1));
					 return self.buildUnit(SPECS.PROPHET, d.x, d.y);
				}	
				
			var d = getBuildDir(self.me);
			if (!(d === undefined)){
			self.log('Building a pilgrim at ' + (self.me.x+1) + ',' + (self.me.y+1));
			pilgrims.number++;
			return self.buildUnit(SPECS.PILGRIM, d.x, d.y);
		} 
} */ 
	 
   

/*	if (self.me.turn > 5 && self.me.turn % 2 == 0 && self.karbonite > 30 && self.fuel > 150 && Math.random() < .3333)
	   {
		   var d = getBuildDir(self.me);
	   if (!(d === undefined)){
		   self.log('Building a prophet at(blue team) after 100 turn ' + (self.me.x+1) + ',' + (self.me.y+1));
		   pilgrims.number++;
		   return self.buildUnit(SPECS.PROPHET, d.x, d.y);
		   }
	   }
	   
	   if ( self.me.turn >5 && self.me.turn % 2 != 0 && self.karbonite > 30 && self.fuel > 150 && Math.random() < .3333)
	   {
		   var d = getBuildDir(self.me);
		   if (!(d === undefined)){
			   self.log('Building a crusader at(blue team)  mod 10 ' + (self.me.x+1) + ',' + (self.me.y+1));
			   pilgrims.number++;
			   return self.buildUnit(SPECS.CRUSADER, d.x, d.y);
			   }	
	   }   */
	   
	 /*  var enemies = utilities.enemiesInRange(self);
	   if(enemies.length > 0){
		   for(let i = 0; i < enemies.length; ++i){
	   //	if(enemies[i].unit === SPECS.CASTLE){
		  // 		self.log("Attacking Castle");
				   return combat.attackBot(self, enemies[i]);
			   }
		   } */
	   

};

export default castle;