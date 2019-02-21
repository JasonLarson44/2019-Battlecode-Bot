const assert = require('assert').strict;
const rewire = require('rewire');

const bot = rewire('./test_compiled_bot.js');
let utilities = bot.__get__("utilities");
let SPECS = bot.__get__("SPECS")

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
        x: 5,
        y: 5,
        me: {
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