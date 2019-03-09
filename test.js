const assert = require('assert').strict;
const rewire = require('rewire');

const bot = rewire('./test_compiled_bot.js');
let utilities = bot.__get__("utilities");
let pilgrim = bot.__get__("pilgrim");
let SPECS = bot.__get__("SPECS");
let nav = bot.__get__("nav")

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
