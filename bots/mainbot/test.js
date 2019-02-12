const assert = require('assert');
const bot = require('../compiled_bot.js');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});

describe("utilities", function() {
  describe("#getDistance()", function() {
    it("should return 5 for points (2, 2) and (5, 6)", function() {
      console.log(bot);
      assert.equal(bot.utilities.getDistance({x:2,y:2}, {x:5,y:6}), 25);
    })
  })
});