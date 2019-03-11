const assert = require('assert').strict;
const rewire = require('rewire');

const bot = rewire('./test_compiled_bot.js');
let utilities = bot.__get__("utilities");
let pilgrim = bot.__get__("pilgrim");
let SPECS = bot.__get__("SPECS");
let nav = bot.__get__("nav");
let castle = bot.__get__("castle");
let combat = bot.__get__("combat");
let movement = bot.__get__("movement");

generate_grid = (x, y, val = false) => {
	let grid = new Array(y);
	for (let i = 0; i < y; i++) {
    grid[i] = new Array(x);
    for (let j = 0; j < x; j++) {
      grid[i][j] = val;
    }
  }

  return grid;
}

// utilities.log = (self, message) => {}; // Disable output from log statements
utilities.log = (self, message) => {console.log(message)}; // Enable output from log statements
describe("utilities", function() {
  describe("#getDistance()", function() {
    it("should return the square of the distance between two points", function() {
      assert.equal(utilities.getDistance({x:2,y:2}, {x:5,y:6}), 25);
      assert.equal(utilities.getDistance({x:2,y:3}, {x:1,y:5}), 5);
      assert.equal(utilities.getDistance({x:5,y:10}, {x:5,y:10}), 0);
    });
  });

  describe("#isAdjacent()", function() {
    it("should return true if the two locations are adjacent or the same", function() {
      assert.equal(utilities.isAdjacent({x:2,y:2}, {x:5,y:6}), false);
      assert.equal(utilities.isAdjacent({x:2,y:3}, {x:1,y:5}), false);
      assert.equal(utilities.isAdjacent({x:11,y:9}, {x:11,y:7}), false);
      assert.equal(utilities.isAdjacent({x:5,y:10}, {x:5,y:10}), true);
      assert.equal(utilities.isAdjacent({x:31,y:8}, {x:32,y:9}), true);
      assert.equal(utilities.isAdjacent({x:16,y:52}, {x:16,y:53}), true);
    });
  });

  describe("#isBeside()", function() {
    it("should return true if the two locations are side-by-side", function() {
      assert.equal(utilities.isBeside({x:2,y:2}, {x:5,y:6}), false);
      assert.equal(utilities.isBeside({x:2,y:3}, {x:1,y:5}), false);
      assert.equal(utilities.isBeside({x:11,y:9}, {x:11,y:7}), false);
      assert.equal(utilities.isBeside({x:31,y:8}, {x:32,y:9}), false);
      assert.equal(utilities.isBeside({x:10,y:20}, {x:9,y:19}), false);
      assert.equal(utilities.isBeside({x:15,y:5}, {x:16,y:4}), false);
      assert.equal(utilities.isBeside({x:3,y:7}, {x:2,y:8}), false);
      assert.equal(utilities.isBeside({x:16,y:52}, {x:16,y:53}), true, "{x:16,y:52}, {x:16,y:53}");
      assert.equal(utilities.isBeside({x:7,y:11}, {x:7,y:10}), true, "{x:7,y:11}, {x:7,y:10}");
      assert.equal(utilities.isBeside({x:21,y:1}, {x:22,y:1}), true, "{x:21,y:1}, {x:22,y:1}");
      assert.equal(utilities.isBeside({x:13,y:15}, {x:12,y:15}), true, "{x:13,y:15}, {x:12,y:15}");
    });
  });

  describe("#isOpen()", function() {
    it("should return true if the location is passable and no robot is there", function() {
      let state = {};

      state.map = [[false, false, false],
                   [true, true, false],
                   [false, true, true]];

      state.getVisibleRobotMap = () => {
        return [[0, 0,   -1],
                [0, 517, -1],
                [0, 243, -1]];
      }

      assert.equal(utilities.isOpen(state, {x:0,y:0}), false, "Wall and no robot");
      assert.equal(utilities.isOpen(state, {x:0,y:1}), true, "No wall and no robot");
      assert.equal(utilities.isOpen(state, {x:1,y:1}), false, "No wall and robot");
      assert.equal(utilities.isOpen(state, {x:2,y:1}), false, "Wall and no visibility");
      assert.equal(utilities.isOpen(state, {x:2,y:2}), true, "No wall and no visibility");
    });
  });

  describe("#inMovementRange()", function() {
    it("Pilgrim tests", function() {
      let state = {
        me: {
          x: 5,
          y: 5,
          unit: SPECS.PILGRIM,
        }
      };

      // These should be true
      assert(utilities.inMovementRange(state, {x:5, y:5}), "False for same location");
      assert(utilities.inMovementRange(state, {x:5, y:6}), "False for down");
      assert(utilities.inMovementRange(state, {x:6, y:6}), "False for bottom right");
      assert(utilities.inMovementRange(state, {x:3, y:5}), "False for far left");
      assert(utilities.inMovementRange(state, {x:5, y:7}), "False for far bottom");

      // These should be false
      assert(!utilities.inMovementRange(state, {x:8, y:5}), "True for 3 to the right");
      assert(!utilities.inMovementRange(state, {x:5, y:2}), "True for 3 up");
      assert(!utilities.inMovementRange(state, {x:3, y:4}), "True for left-up diag");
    });
  });

  describe("getCastleSignal()",function(){
    it("Castle signal tests",function() {
     let robot = {
      me: {
        x: 1,
        y: 1,
        unit: SPECS.CASTLE,
      },

      getVisibleRobots: () => {return [{unit: SPECS.CASTLE, x:0, y:0,signal:(0x01,5)}];},
         }

    let result = utilities.getCastleSignal(robot)

    assert.equal(result, (0x01,5));
  });
});

  describe("findClosestCastle()",function(){
    it("Closest castle tests",function() {
      let robot = {
        me: {
          x: 1,
          y: 1,
          unit: SPECS.CASTLE,
          team:0,
        },
      getVisibleRobots: () => {return [{unit: SPECS.CASTLE, x:5, y:5,team:0}];},
    }
      let result = utilities.findClosestCastle(robot)
     assert.deepEqual(result, {x:5,y:5});
  });
});

  describe("enemiesInRange()",function(){
    it("Find enemies that are in range", function(){
      let robot = {
        me: {
          x: 1,
          y: 1,
          unit: SPECS.CASTLE,
          team:0,
        },
  
      getVisibleRobots: () => {return [{unit: SPECS.PROPHET, x:5, y:5,team:1}];},
    }
  let result = utilities.enemiesInRange(robot)
  assert.deepEqual(result,[{team:1,unit:4,x:5,y:5}])  
  });
});
});

describe("Pilgrim", function() {
  describe("#create_resource_map()", function() {
    it("should assign pilgrim.resource_map to be a combination of this.karbonite_map and this.fuel_map", function() {
      let robot = {
        karbonite_map: [[true, false, false],
                        [false, false, true]],
        fuel_map: [[false, false, true],
                   [false, true, true]],
        map: [[true, true, true],
              [true, true, true]],
      };

      pilgrim.create_resource_map(robot);

      let result = [[true, false, true],
                    [false, true, true]]

      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].length; j++) {
          assert(result[i][j] === pilgrim.resource_map[i][j])
        }
      }
    });
  });

  describe("#findClosestResource()", function() {
    it("should return an object with the x and y coordinates of the closest resource", function() {
      let robot = {
        me: {
          x: 0,
          y: 0,
        }
      };

      pilgrim.resource_map = [[false, false, false],
                              [false, false, true],
                              [false, false, true]];


      let result = pilgrim.findClosestResource(robot);

      assert.equal(result.x, 2, "Incorrect x coordinate returned");
      assert.equal(result.y, 1, "Incorrect y coordinate returned");
    });
  });

  describe("#random_move()", function() {
    it("should return a move one step in a random direction", function() {
      let robot = {
        map: generate_grid(3, 3, true),

        me: {
          x: 1,
          y: 1,
        },

        getVisibleRobotMap: () => {return generate_grid(3, 3, 0);},
        move: (dx, dy) => {return {x:dx,y:dy};},
      };

      let results = [];
      for (let i=0; i<3; i++) {
        results.push(pilgrim.random_move(robot));
      }

      assert(!((results[0].x === results[1].x === results[2].x) && (results[0].y === results[1].y === results[2].y)), "random_move produced 3 identical results (could be coincidence)");

      for (let i=0; i<results.length; i++) {
        assert(Math.abs(results[i].x) <= 1, "random_move produced a move farther than 1 square x");
        assert(Math.abs(results[i].y) <= 1, "random_move produced a move farther than 1 square y");
      }
    });
  });

  describe("move()", function() {
    it("should return the next optimal step", function() {
      let robot = {
        map: generate_grid(5, 5, true),

        me: {
          x: 1,
          y: 1,
          unit: SPECS.PILGRIM,
        },

        getVisibleRobotMap: () => {return generate_grid(5, 5, 0);},
        getVisibleRobots: () => {return [];},
        move: (dx, dy) => {return {x:dx,y:dy};},
      };

      robot.map[2][2] = false;

      let result = pilgrim.move(robot, {x:4, y:4});

      assert.deepEqual(result, {x:0, y:1});
    });

    it("should return an adjacent square towards target", function() {
      let robot = {
        map: generate_grid(5, 5, true),

        me: {
          x: 1,
          y: 1,
          unit: SPECS.PILGRIM,
        },

        getVisibleRobotMap: () => {return generate_grid(5, 5, 0);},
        getVisibleRobots: () => {return [];},
        move: (dx, dy) => {return {x:dx,y:dy};},
      };

      pilgrim.path = [];
      let result = pilgrim.move(robot, {x:3, y:1});

      assert.deepEqual(result, {x:1, y:0});
    });
  });

  describe("takeTurn()", function() {
    it("first turn, should move toward resource", function() {
      let robot = {
        map: generate_grid(5, 5, true),
        fuel: 0,
        karbonite: 0,

        me: {
          x: 1,
          y: 1,
          unit: SPECS.PILGRIM,
        },

        getVisibleRobotMap: () => {return generate_grid(5, 5, 0);},
        getVisibleRobots: () => {return [{unit: SPECS.CASTLE, x:0, y:0}];},
        move: (dx, dy) => {return {x:dx,y:dy};},
        castleTalk: (_) => {return;},
      };

      pilgrim.resource_map = generate_grid(5, 5, false);
      pilgrim.resource_map[1][4] = true;
      pilgrim.move = (self, target) => {return target;};

      let result = pilgrim.takeTurn(robot);

      assert.deepEqual(result, {x:4, y:1});
    });

    it("headed toward occupied resource, should move toward another resource", function() {
      let robot = {
        map: generate_grid(5, 5, true),
        _robot_map: generate_grid(5, 5, 0),
        fuel: 0,
        karbonite: 0,

        me: {
          x: 1,
          y: 1,
          unit: SPECS.PILGRIM,
        },

        getVisibleRobotMap: () => {return robot._robot_map;},
        getVisibleRobots: () => {return [{unit: SPECS.CASTLE, x:0, y:0}, {unit: SPECS.PILGRIM, x:4, y:1}];},
        move: (dx, dy) => {return {x:dx,y:dy};},
        castleTalk: (_) => {return;},
      };

      for (let r of robot.getVisibleRobots()) {
        robot._robot_map[r.y][r.x] = Math.floor(Math.random() * 1024);
      }

      pilgrim.resource_map = generate_grid(5, 5, false);
      pilgrim.resource_map[1][4] = true;
      pilgrim.resource_map[4][4] = true;
      pilgrim.target = {x: 4, y: 1};
      pilgrim.move = (self, target) => {return target;};

      let result = pilgrim.takeTurn(robot);

      assert.deepEqual(result, {x:4, y:4});
      assert.deepEqual(pilgrim.target, {x:4, y:4});
    });

    it("on top of resource, should mine", function() {
      let robot = {
        map: generate_grid(5, 5, true),
        fuel: 0,
        karbonite: 0,

        me: {
          x: 1,
          y: 1,
          unit: SPECS.PILGRIM,
          fuel: 0,
          karbonite: 0,
        },

        getVisibleRobotMap: () => {return generate_grid(5, 5, 0);},
        getVisibleRobots: () => {return [{unit: SPECS.CASTLE, x:0, y:0}];},
        move: (dx, dy) => {return {x:dx,y:dy};},
        castleTalk: (_) => {return;},
        mine: () => {return "MINE";},
      };

      pilgrim.mission = "mine";
      pilgrim.resource_map = generate_grid(5, 5, false);
      pilgrim.resource_map[1][1] = true;
      pilgrim.target = {x:1, y:1};
      pilgrim.move = (self, target) => {return target;};

      let result = pilgrim.takeTurn(robot);

      assert.equal(result, "MINE");
    });

    it("mining resource and capacity full, should return home", function() {
      let robot = {
        map: generate_grid(5, 5, true),

        me: {
          x: 1,
          y: 1,
          unit: SPECS.PILGRIM,
          fuel: 0,
          karbonite: SPECS.UNITS[SPECS.PILGRIM].KARBONITE_CAPACITY,
        },

        getVisibleRobotMap: () => {return generate_grid(5, 5, 0);},
        getVisibleRobots: () => {return [];},
        move: (x, y) => {return {x:x,y:y};},
        castleTalk: (_) => {return;},
        mine: () => {return "MINE";},
      };

      pilgrim.mission = "mine";
      pilgrim.resource_map = generate_grid(5, 5, false);
      pilgrim.resource_map[1][1] = true;
      pilgrim.target = {x:1, y:1};
      pilgrim.home = {x:4, y:4};
      pilgrim.move = (self, target) => {return target;};

      let result = pilgrim.takeTurn(robot);

      // Robot will try to return to a square adjacent to home, so it can give resources to it
      assert(utilities.isAdjacent(result, {x:4, y:4}));
      assert.equal(pilgrim.mission, "return");
    });

    it("mining resource and capacity full, should build castle", function() {
      let robot = {
        map: generate_grid(5, 5, true),
        fuel: 500,
        karbonite: 500,

        me: {
          x: 1,
          y: 1,
          unit: SPECS.PILGRIM,
          fuel: 0,
          karbonite: SPECS.UNITS[SPECS.PILGRIM].KARBONITE_CAPACITY,
        },

        getVisibleRobotMap: () => {return generate_grid(5, 5, 0);},
        getVisibleRobots: () => {return [];},
        move: (x, y) => {return {x:x,y:y};},
        castleTalk: (_) => {return;},
        mine: () => {return "MINE";},
        buildUnit: (type, dx, dy) => {return "BUILD";},
      };

      pilgrim.mission = "mine";
      pilgrim.resource_map = generate_grid(5, 5, false);
      pilgrim.resource_map[1][1] = true;
      pilgrim.target = {x:1, y:1};
      pilgrim.home = {x:4, y:4};
      pilgrim.move = (self, target) => {return target;};

      let result = pilgrim.takeTurn(robot);

      // Robot will try to return to a square adjacent to home, so it can give resources to it
      assert.equal(result, "BUILD");
      assert.equal(pilgrim.mission, "return");
    });
  });
});

describe("nav", function() {
  describe("#applyDir()", function() {
    it("should return the sum of two points", function() {
      assert.deepEqual(nav.applyDir({x:0,y:1}, {x:0,y:1}), {x:0,y:2});
      assert.deepEqual(nav.applyDir({x:1,y:0}, {x:1,y:0}),  {x:2,y:0});
      assert.deepEqual(nav.applyDir({x:0,y:-1}, {x:0,y:-1}),{x:0,y:-2});
    });
  });
  describe("#getDir()", function() {
    it("should return 1 or -1 based on x & y cordinates of start and  target", function() {
      assert.deepEqual(nav.getDir({x:4,y:3}, {x:2,y:4}), {x:-1,y:1});
      assert.deepEqual(nav.getDir({x:3,y:4}, {x:5,y:2}),  {x:1,y:-1});
      assert.deepEqual(nav.getDir({x:5,y:6}, {x:3,y:4}),{x:-1,y:-1});
    });
  });
});

describe("combat",function(){
  describe("attackBot",function(){
    it("attack the nearest unit",function(){

      let robot ={
        me:{
          x:1,
          y:1,
        },
        attack:(dx,dy) =>{return{x:dx,y:dy}}
     }
      combat.target ={x:5,y:5}
      result = combat.attackBot(robot,combat.target)
      assert(result, "return")
  });
});
});

describe("castle", function(){

  describe("countUnits()",function(){

    it("count the number of units castle can see",function(){
      let robot = {
        map: generate_grid(2, 2, true),
        me:{
          x:1,
          y:1,
          unit :SPECS.CASTLE,
          id:1234,
          team:0,
        },
        getVisibleRobots: () => {return [{unit:SPECS.CASTLE,team:0,id:1234,x:1,y:1},{unit:SPECS.CRUSADER,team:0,id:222,x:2,y:3}];},
        
      }
      let visibleBots = robot.getVisibleRobots()
      robot.crusader_count = 0
      robot.prophet_count = 0
      robot.pilgrim_count =0
      let result = castle.countUnits(robot,visibleBots)
      assert.equal(result,undefined)
      });
    
});

describe("#incrementBuildCounter",function(){
it("increment the build counter", function(){
  let robot = {
    map: generate_grid(2, 2, true),
        queue: 1234,
        me:{
          x:1,
          y:1,
          unit :SPECS.CASTLE,
          id: 1234
        },
        getVisibleRobots: () => {return [{unit:SPECS.CASTLE,id:1234,x:1,y:1}];},
        getRobot:(id) => {return[{unit:SPECS.CASTLE,id:1234,x:1,y:1}]},
      }
      
  let result = castle.incrementBuildCounter(robot)
  assert.equal(result,undefined)

});    
it("increment the build counter when more than 1 castle",function(){
  let robot = {
    map: generate_grid(2, 2, true),
        queue: [1234,1235],
        me:{
          x:1,
          y:1,
          unit :SPECS.CASTLE,
          id: 1234
        },
        getVisibleRobots: () => {return [{unit:SPECS.CASTLE,id:1234,x:1,y:1},{unit:SPECS.CASTLE,id:1235,x:3,y:3,castle_talk:0x01}];},
        getRobot:(id) => {return[{unit:SPECS.CASTLE,id:1235,x:3,y:3,castle_talk:0x01}]},
        
      }
  let result = castle.incrementBuildCounter(robot)
  robot.buildItems += 1
  assert.equal(result,undefined)

  });
});

describe("#buildUnits",function(){
it("build units using crusaderRush", function(){
  let robot = {
    map: generate_grid(2, 2, true),
        me:{
          x:1,
          y:1,
          unit :SPECS.CASTLE,
          id: 1234,
          fuel:200,
          karbonite:300,
        },
        getVisibleRobots: () => {return [{unit:SPECS.CASTLE,id:1234,x:1,y:1}];},
        buildUnit: (type, dx, dy) => {return "BUILD";},
        getBuildDir:(dx,dy) => {return ({x:dx,y:dy})},
        getPassableMap:() => {return generate_grid(5,5,0)},
        getVisibleRobotMap: () => {return generate_grid(3, 3, 0);},
  }
  var d = castle.getBuildDir(robot)
  robot.strategy = "crusaderRush";
  castle.crusaderRush = (self) =>{return "BUILD" }
  let result = castle.buildUnits(robot);
  assert.deepEqual(result, "BUILD");
}); 

  it("build units using prophetArmy",function(){

  let robot = {
    map: generate_grid(2, 2, true),
        me:{
          x:1,
          y:1,
          unit :SPECS.CASTLE,
          id: 1234,
          fuel:100,
          karbonite:300,

        },
        getVisibleRobots: () => {return [{unit:SPECS.CASTLE,id:1234,x:1,y:1},{unit:SPECS.CASTLE,id:1235,x:1,y:1}];},
        buildUnit: (type, dx, dy) => {return "BUILD" },
        getBuildDir:(dx,dy) => {return ({x:dx,y:dy})},
        getPassableMap:() => {return generate_grid(5,5,0)},
        getVisibleRobotMap: () => {return generate_grid(3, 3, 0);},
  }
  var d = castle.getBuildDir(robot)
  robot.strategy = "prophetArmy";
  castle.prophetArmy = (self) =>{return robot.buildUnit() }
  let result = castle.buildUnits(robot);
  assert.deepEqual(result, "BUILD"); 
}); 
});

describe("#crusaderRush",function(){
  it("build units using crusaderRush", function(){
    let robot = {
      map: generate_grid(2, 2, true),
          me:{
            x:1,
            y:1,
            unit :SPECS.CASTLE,
            id: 1234,
            fuel:100,
            karbonite:200,
          },
          getVisibleRobots: () => {return [{unit:SPECS.CASTLE,id:1234,x:1,y:1}];},
          buildUnit: (type, dx, dy) => {return "BUILD";},
          getBuildDir:(x,y) => {return d.x,d.x},
          getPassableMap:() => {return generate_grid(5,5,0)},
          getVisibleRobotMap: () => {return generate_grid(3, 3, 0);},
    }
    var d = castle.getBuildDir(robot)
    robot.strategy = "crusaderRush";
    let result = castle.buildUnits(robot);
    assert.deepEqual(result, "BUILD");
  });
});  

  describe("#prophetArmy",function(){
    it("build units using prophetArmy",function(){
  
    let robot = {
      map: generate_grid(2, 2, true),
          me:{
            x:1,
            y:1,
            unit :SPECS.CASTLE,
            id: 1234,
            fuel:200,
            karbonite:300,
          },
          getVisibleRobots: () => {return [{unit:SPECS.CASTLE,id:1234,x:1,y:1,castle_talk:0x01},{unit:SPECS.CASTLE,id:1235,x:3,y:3}];},
          buildUnit: (type, dx, dy) => {return "BUILD";},
          castleTalk:() => {return 0x01},
          getBuildDir:(dx,dy) => {return ({x:d.x,y:d.y})},
          getPassableMap:() => {return generate_grid(5,5,0)},
          getVisibleRobotMap: () => {return generate_grid(3, 3, 0);},
    }
    var d = castle.getBuildDir(robot)
    robot.strategy = "prophetArmy";
    robot.castleTalk(0x01)
    let result = castle.buildUnits(robot);
    assert.deepEqual(result, "BUILD"); 
  }); 
  });

  describe("#takeTurn()",function() {
    it("first turn should find and record other castles",function(){

      let robot ={
        map: generate_grid(2, 2, true),
        me:{
          x:1,
          y:1,
          unit :SPECS.CASTLE,
          turn:1,
          id: 1234,
          fuel: 100,
          karbonite:200,
        },
        getVisibleRobots: () => {return [{unit:SPECS.CASTLE,id:1234,x:1,y:1}];},
      
      }
      const visible = robot.getVisibleRobots()
      castle.countUnits(robot,visible)
      castle.incrementBuildCounter(robot)
      robot.castle_count = visible.length
      robot.buildItems = 0
      robot.queue = robot.id
      let result = castle.takeTurn(robot)
      assert.equal(result,"BUILD");
    });
    
    it("first turn should find and record other castles",function(){
      let robot ={
        map: generate_grid(45, 45, true),
        me:{
          x:1,
          y:1,
          unit :SPECS.CASTLE,
          turn:1,
          id: 1234
        },
        getVisibleRobots: () => {return [{unit:SPECS.CASTLE,id:1234,x:1,y:1},{unit:SPECS.CASTLE,id:1235,x:3,y:3,castle_talk:0x01}];},
        castleTalk: () => {return 0x01},

      }
      const visiblebot = robot.getVisibleRobots()
      robot.buildItems = 0
      robot.strategy = 'prophetArmy'
      castle.countUnits(robot,visiblebot)
      castle.incrementBuildCounter(robot)
      let result = castle.takeTurn(robot)
      assert.equal(result,undefined); 
    });

    it("next turns should try an build more units",function(){

      let robot = {
        map: generate_grid(2, 2, true),
        buildItems:4,
        castle_count:1,
        queue:[1234],
        strategy: 'crusaderRush',
        me:{
          x:1,
          y:1,
          unit :SPECS.CASTLE,
          id: 1234,
          fuel: 100,
          karbonite:350,
        },
       
        getVisibleRobots: () => {return [{unit:SPECS.CASTLE,id:1234,x:1,y:1,team:0},{unit:SPECS.PILGRIM,id:333,x:1,y:2,team:0},
          {unit:SPECS.CRUSADER,id:556,x:4,y:3,team:0},{unit:SPECS.CRUSADER,id:557,x:4,y:9,team:0},{unit:SPECS.CRUSADER,id:555,x:6,y:5,team:0}];}, 
        getRobot:(id) => {return[{unit:SPECS.CASTLE,id:1234,x:1,y:1}]},     
        buildUnit: (type, dx, dy) => {return "BUILD";},
        attack:(dx,dy) =>{return({x:dx,y:dy})},
        signal:() =>{return(0x01,5)}
      }
      const visible = robot.getVisibleRobots()
      let enemies = utilities.enemiesInRange(robot);
      castle.countUnits(robot,visible)
      castle.incrementBuildCounter(robot)
      castle.buildUnits(robot)    
      combat.attackBot(robot,enemies[0])
      robot.signal(0x01,5)
      let result = castle.takeTurn(robot);
      assert.equal(result,"BUILD")
    });
    
    it("should try an build units",function(){
      let robot = {
      map: generate_grid(2, 2, true),
      buildItems:2,
      castle_count:2,
      queue:[1234,1235],
      strategy: 'prophetArmy',
      me:{
        x:1,
        y:1,
        unit :SPECS.CASTLE,
        id: 1235,
        fuel: 100,
        karbonite:200,
      },
   
      getVisibleRobots: () => {return [{unit:SPECS.CASTLE,id:1234,x:1,y:1,castle_talk:0x01},
        {unit:SPECS.CASTLE,id:1235,x:3,y:3},{unit:SPECS.PILGRIM,id:333,x:1,y:2,team:0},
        {unit:SPECS.PROPHET,id:666,x:7,y:3,team:0},{unit:SPECS.PROPHET,id:667,x:9,y:9,team:0}];}, 
      getRobot:(id) => {return[{unit:SPECS.CASTLE,id:1234,x:3,y:3,castle_talk:0x01}]},     
      buildUnit: (type, dx, dy) => {return "BUILD";},
      castleTalk: () => {return 0x01},
      attack:(dx,dy) =>{return({x:dx,y:dy})},
    }
      const visible = robot.getVisibleRobots()
      castle.countUnits(robot,visible)
      castle.incrementBuildCounter(robot)
      castle.buildUnits(robot)
      let result = castle.takeTurn(robot);
      assert.equal(result,"BUILD")
  });
});
});

describe("movement", function() {
  describe("#aStar()", function() {
    it("should return the shortest open path to the target", function() {
      // Generate a 5x5 grid with no objects
      let robot = {
        map: generate_grid(10, 10, true),
        fuel: 500,
        karbonite: 500,

        me: {
          x: 0,
          y: 5,
          unit: SPECS.PILGRIM,
          fuel: 0,
          karbonite: SPECS.UNITS[SPECS.PILGRIM].KARBONITE_CAPACITY,
        },
        getVisibleRobotMap: () => {return generate_grid(10, 10, 0);},
        getVisibleRobots: () => {return [];},
      };
      let expected_path = [{x: 0, y:5}, {x: 0, y:4}, {x: 0, y:3}, {x: 0, y:2}, {x: 0, y:1}, {x: 0, y:0}]
      let output_path = movement.aStar(robot, [robot.me.y, robot.me.x], [0, 0], robot.map)

      for(let i = 0; i < output_path.length; ++i){
        assert.deepEqual({x:output_path[i].x, y:output_path[i].y}, expected_path[i])
      }
      // Set a coordinate to impassable
      robot.map[9][9] = false
      assert.deepEqual(movement.aStar(robot, [robot.me.y, robot.me.x], [9, 9], robot.map), [])
    });
  });
  describe("#moveTo()", function() {
    it("should return the shortest open path to the target with speed in mind", function() {
      // Generate a 5x5 grid with no objects
      let robot = {
        map: generate_grid(10, 10, true),
        fuel: 500,
        karbonite: 500,

        me: {
          x: 0,
          y: 5,
          unit: SPECS.CRUSADER,
          fuel: 0,
          karbonite: SPECS.UNITS[SPECS.CRUSADER].KARBONITE_CAPACITY,
        },
        getVisibleRobotMap: () => {return generate_grid(10, 10, 0);},
        getVisibleRobots: () => {return [];},
      };
      let expected_path = [{x: 0, y:3}, {x: 0, y:1}, {x: 0, y:0}]
      let output_path = movement.moveTo(robot, 0, 0)
      assert.notEqual(output_path.length, 0)

      for(let i = 0; i < output_path.length; ++i){
        assert.deepEqual({x:output_path[i].x, y:output_path[i].y}, expected_path[i])
      }
      // Set a coordinate to impassable
      robot.map[9][9] = false
      assert.deepEqual(movement.moveTo(robot, 9, 9), [])
    });
  });
  describe("#condensePath()", function() {
    it("should return a condensed version of the path based on speed", function() {
      // Generate a 5x5 grid with no objects
      let speed = 9
      let input_path = [{x: 0, y: 5}, {x: 0, y: 4}, {x: 0, y: 3}, {x: 0, y: 2}, {x: 0, y: 1}, {x: 0, y: 0}]
      let expected_path = [{x: 0, y:3}, {x: 0, y:1}, {x: 0, y:0}]
      let output_path = movement.condense_path(speed, input_path)
      assert.notEqual(output_path.length, 0)

      for(let i = 0; i < output_path.length; ++i){
        assert.deepEqual({x:output_path[i].x, y:output_path[i].y}, expected_path[i])
      }
    });
  });
  describe("#getOpenAdj()", function() {
    it("should return a list of all open adjacent nodes", function() {
      // Generate a 3x3 grid with properties expected by getOpenAdj
      let map = [
        [{x: 0, y:0, closed: false}, {x: 1, y:0, closed: false}, {x: 2, y:0, closed: false}],
        [{x: 0, y:1, closed: false}, {x: 1, y:1, closed: false}, {x: 2, y:1, closed: false}],
        [{x: 0, y:2, closed: false}, {x: 1, y:2, closed: false}, {x: 2, y:2, closed: false}]
      ]
      let node = {x: 0, y: 0}
      let expected_output = [{x: 0, y: 1, closed: false}, {x: 1, y: 1, closed: false}, {x: 1, y: 0, closed: false}]
      assert.deepEqual(movement.getOpenAdj(map, node), expected_output)

      // Set a node to closed to see if we ignore it
      map[0][1].closed = true
      expected_output = [{x: 0, y: 1, closed: false}, {x: 1, y: 1, closed: false}]
      assert.deepEqual(movement.getOpenAdj(map, node), expected_output)

    });
  });
});
