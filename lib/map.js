"use strict";
if (!$s) var $s = require('./settings.js')._;

var $m = {};

/* RNG
 * source: http://stackoverflow.com/questions/424292/seedable-javascript-random-number-generator
 */
$m.rng = function (state) {
    this.m = $s.map.seedMax;
    this.a = 1103515245;
    this.c = 12345;
    this.state = state;

    this.nextInt = function() {
        this.state = (this.a * this.state + this.c) % this.m;
        console.log('nextInt', this.state);
        return this.state;
    };

    this.nextFloat = function() {
        // returns in range [0,1]
        return this.nextInt() / (this.m - 1);
    };

    this.nextRange = function(start, end) {
        // returns in range [start, end): including start, excluding end
        // can't modulu nextInt because of weak randomness in lower bits
        var rangeSize = end - start;
        var randomUnder1 = this.nextInt() / this.m;
        var v = start + Math.floor(randomUnder1 * rangeSize);
        console.log('nextRange', start, end, rangeSize, randomUnder1, v);
        return v;
    };

    this.nextChoice = function(array) {
        var v = array[this.nextRange(0, array.length)];
        console.log('nextChoice', array, v);
        return v;
    };
};

$m.coordToIndex = function (x, z, dir) {
    return (x +'_'+ z +'_'+ dir);
};

$m.genMap = function (seed) {
    var rng = new $m.rng(seed);
    var map = {};

    var point1 = { x: rng.nextRange(-10, 10), z: rng.nextRange(-10, 10) };
    var dim = { x: rng.nextRange(3, 15), z: rng.nextRange(3, 15) };
    var dir = { x: rng.nextChoice([+1, -1]), z: rng.nextChoice([+1, -1]) };
    var point2 = { x: point1.x + dim.x*dir.x, z: point1.z + dim.z*dir.z };

    console.log('genMap:', seed, point1, dim, dir, point2);

    for (var x = 0; x < dim.x; ++x) {
        map[$m.coordToIndex(point1.x + x*dir.x, point1.z, 'r')] = 1;
        map[$m.coordToIndex(point1.x + x*dir.x, point2.z, 'r')] = 1;
    }
    for (var z = 0; z < dim.z; ++z) {
        map[$m.coordToIndex(point1.x, point1.z + z*dir.z, 'd')] = 1;
        map[$m.coordToIndex(point2.x, point1.z + z*dir.z, 'd')] = 1;
    }

    console.log(map);

    return map;
};

exports._ = $m;
