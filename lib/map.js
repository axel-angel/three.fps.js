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
        return start + Math.floor(randomUnder1 * rangeSize);
    };

    this.nextChoice = function(array) {
        return array[this.nextRange(0, array.length)];
    };
};

$m.coordToIndex = function (x, z, dir) {
    return (x +'_'+ z +'_'+ dir);
};

$m.genMap = function (seed) {
    var map = {};
    var rect = [];
    var minW = 3;
    var minH = 3;

    var rng = new $m.rng(seed);
    var rooms = rng.nextRange($s.map.roomMin, $s.map.roomMax);

    for (var i = 0; i < rooms; ++i) {
        console.log('genMap', i, rooms);
        var pts = (i == 0) ? rectRoot() : rectNoRoot();
        addRect(pts[0], pts[1]);
    }

    function rectRoot() {
        var p1 = { x: rng.nextRange(-10, 10), z: rng.nextRange(-10, 10) };
        var dim = { x: rng.nextRange(minW, 15), z: rng.nextRange(minH, 15) };
        var dir = { x: rng.nextChoice([+1, -1]), z: rng.nextChoice([+1, -1]) };
        var p2 = { x: p1.x + dim.x*dir.x, z: p1.z + dim.z*dir.z };
        console.log('rectRoot', p1, p2);
        return [p1, p2];
    }

    function rectNoRoot() {
        var rectMaster = rng.nextChoice(rect);
        var pm_tl = rectMaster.tl;
        var pm_br = rectMaster.br;
        var p1 = { x: rng.nextRange(pm_tl.x, pm_br.x)
                 , z: rng.nextRange(pm_tl.z, pm_br.z) };
        console.log('rectNoRoot p1', rectMaster, pm_tl, pm_br, p1);

        // try to balance directions (use vote as probability)
        var votes = { x: [], z: [] };
        rect.forEach(function (r) { // vote for less crowded direction
            votes.x.push(r.tl.x < p1.x ? +1 : -1);
            votes.x.push(r.br.x < p1.x ? +1 : -1);
            votes.z.push(r.tl.z < p1.z ? +1 : -1);
            votes.z.push(r.br.z < p1.z ? +1 : -1);
        });
        var dir = { x: rng.nextChoice(votes.x), z: rng.nextChoice(votes.z) };
        console.log('rectNoRoot dir', dir, votes);

        // overflow the master rect in one direction (prevent nested rect)
        var pm_bound = { x: dir.x > 0 ? pm_br.x : pm_tl.x
                       , z: dir.z > 0 ? pm_br.z : pm_tl.z }
        var minX = Math.abs(p1.x-pm_bound.x);
        var minZ = Math.abs(p1.z-pm_bound.z);
        var bounds = [ { x: [minX+minW, minX+minW+10]
                       , z: [minH, minH+10] }
                     , { x: [minW, minW+10]
                       , z: [minZ+minH, minZ+minH+10] } ];
        console.log('rectNoRoot bounds', pm_bound, minX, minZ, bounds);

        var bound = rng.nextChoice(bounds);
        var p2 = { x: p1.x + dir.x*rng.nextRange(bound.x[0], bound.x[1])
                 , z: p1.z + dir.z*rng.nextRange(bound.z[0], bound.z[1]) };
        console.log('rectNoRoot p2', bound, p2);

        return [p1, p2];
    }

    function addRect(p1, p2) {
        var p_tl = { x: Math.min(p1.x, p2.x), z: Math.min(p1.z, p2.z) }
        var p_br = { x: Math.max(p1.x, p2.x), z: Math.max(p1.z, p2.z) }
        var dim = { x: p_br.x - p_tl.x, z: p_br.z - p_tl.z };

        for (var x = 0; x < dim.x; ++x) {
            map[$m.coordToIndex(p_tl.x + x, p_tl.z, 'r')] = 1;
            map[$m.coordToIndex(p_tl.x + x, p_br.z, 'r')] = 1;
        }
        for (var z = 0; z < dim.z; ++z) {
            map[$m.coordToIndex(p_tl.x, p_tl.z + z, 'd')] = 1;
            map[$m.coordToIndex(p_br.x, p_tl.z + z, 'd')] = 1;
        }

        rect.push({ tl: p_tl, br: p_br });
    }

    return map;
};

exports._ = $m;
