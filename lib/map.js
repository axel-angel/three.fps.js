"use strict";
if (!$s) var $s = require('./settings.js')._;
if (!_)  var  _ = require('./underscore.min.js');

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
    console.log('genMap seed', seed);
    var map = {};
    var rect = [];
    var edgeOpen = [];
    var edgeTook = [];
    var minD = 3;

    var rng = new $m.rng(seed);
    var rooms = rng.nextRange($s.map.roomMin, $s.map.roomMax);

    rectRoot();
    for (var i = 1; i < rooms && edgeOpen.length > 0;) {
        console.log('genMap', i, rooms);
        if (!rectNoRoot()) {
            continue;
        }
        console.log('edgeOpen', edgeOpen, 'edgeTook', edgeTook);
        ++i;
    }

    // TODO: add holes between rooms using edgeTook

    function rectRoot() {
        var p1 = { x: rng.nextRange(-10, 10), z: rng.nextRange(-10, 10) };
        var dim = { x: rng.nextRange(minD, 15), z: rng.nextRange(minD, 15) };
        var dir = { x: rng.nextChoice([+1, -1]), z: rng.nextChoice([+1, -1]) };
        var p2 = { x: p1.x + dim.x*dir.x, z: p1.z + dim.z*dir.z };
        console.log('rectRoot', p1, p2);
        addRect(p1, p2);
        return true;
    }

    function rectNoRoot() {
        var i = rng.nextRange(0, edgeOpen.length);
        var e = edgeOpen.splice(i, 1)[0];
        console.log('rectNoRoot choose', i, e);

        var xIsDir = (e.dir.x != 0);
        var d = xIsDir ? { v: 'x', n: 'z' } : { v: 'z', n: 'x' };
        console.log('rectNoRoot xIsDir', xIsDir, d);

        // variable names for the case when x is non-zero
        var z1 = rng.nextRange(e.p1[d.n]+minD, e.p2[d.n]-minD);
        var h = rng.nextRange(minD, 10);
        var dirZ = rng.nextChoice([+1, -1]);
        var z2 = z1 + h * dirZ;
        var w = rng.nextRange(minD, 10);
        var x1 = e.p1[d.v];
        var x2 = x1 + w * e.dir[d.v];
        console.log('rectNoRoot vars', z1, h, dirZ, z2, w, x1, x2);

        var p1 = swapXZ(!xIsDir, { x: x1, z: z1 });
        var p2 = swapXZ(!xIsDir, { x: x2, z: z2 });
        console.log('rectNoRoot p1 p2', p1, p2);

        if (doesCollide(p1, p2)) {
            console.log('rectNoRoot collide', p1, p2);
            return false;
        }

        // TODO: put in edgeOpen, the remaining part of the wall

        // register common part of the wall
        if (xIsDir) {
            var z1m = z1;
            var z2m = dirZ > 0 ? Math.min(z2, e.p2.z) : Math.max(z2, e.p1.z);
            edgeTook.push({ p1: { x: x1, z: Math.min(z1, z2m) }
                          , p2: { x: x1, z: Math.max(z1, z2m) } });
            console.log('rectNoRoot took info', z1m, z2m, e.p1, e.p2);
            console.log('rectNoRoot took1', edgeTook[edgeTook.length-1]);
        }
        else {
            var z1m = z1;
            var z2m = dirZ > 0 ? Math.min(z2, e.p2.x) : Math.max(z2, e.p1.x);
            edgeTook.push({ p1: { x: Math.min(z1, z2m), z: x1 }
                          , p2: { x: Math.max(z1, z2m), z: x1 } });
            console.log('rectNoRoot took info', z1m, z2m, e.p1, e.p2);
            console.log('rectNoRoot took1', edgeTook[edgeTook.length-1]);
        }

        var tookSide = (e.dir.x != 0)
            ? (e.dir.x > 0 ? 'l' : 'r')
            : (e.dir.z > 0 ? 'b' : 't');
        console.log('rectNoRoot took', tookSide);
        addRect(p1, p2, tookSide);
        return true;
    }

    function pointMinMax(p1, p2) {
        var p_tl = { x: Math.min(p1.x, p2.x), z: Math.min(p1.z, p2.z) }
        var p_br = { x: Math.max(p1.x, p2.x), z: Math.max(p1.z, p2.z) }
        return [p_tl, p_br];
    }

    function addRect(p1, p2, edgeClosed) {
        var pts = pointMinMax(p1, p2);
        var p_tl = pts[0];
        var p_br = pts[1];
        var dim = { x: p_br.x - p_tl.x, z: p_br.z - p_tl.z };

        // add wall per coordinate
        for (var x = 0; x < dim.x; ++x) {
            map[$m.coordToIndex(p_tl.x + x, p_tl.z, 'r')] = 1;
            map[$m.coordToIndex(p_tl.x + x, p_br.z, 'r')] = 1;
        }
        for (var z = 0; z < dim.z; ++z) {
            map[$m.coordToIndex(p_tl.x, p_tl.z + z, 'd')] = 1;
            map[$m.coordToIndex(p_br.x, p_tl.z + z, 'd')] = 1;
        }

        // register rectangle
        rect.push({ tl: p_tl, br: p_br });

        // add open edges
        var edge_l = { p1: { x: p_tl.x, z: p_tl.z }
                     , p2: { x: p_tl.x, z: p_br.z }
                     , dir: { x: -1, z: 0 } };
        var edge_t = { p1: { x: p_tl.x, z: p_tl.z }
                     , p2: { x: p_br.x, z: p_tl.z }
                     , dir: { x: 0, z: -1 } };
        var edge_r = { p1: { x: p_br.x, z: p_tl.z }
                     , p2: { x: p_br.x, z: p_br.z }
                     , dir: { x: +1, z: 0 } };
        var edge_b = { p1: { x: p_tl.x, z: p_br.z }
                     , p2: { x: p_br.x, z: p_br.z }
                     , dir: { x: 0, z: +1 } };

        var edges = {l: edge_l, t: edge_t, r: edge_r, b: edge_b};
        if (edgeClosed) delete edges[edgeClosed];
        edgeOpen = _.union(edgeOpen, _.map(edges, function (v) { return v }));
    }

    function doesCollide(p1, p2) {
        var pts = pointMinMax(p1, p2);
        var p_tl = pts[0];
        var p_br = pts[1];

        for (var x = p_tl.x; x < p_br.x; ++x) {
            for (var z = p_tl.z; z < p_br.z; ++z) {
                for (var i = 0; i < rect.length; ++i) {
                    var r = rect[i];
                    if (x > r.tl.x && x < r.br.x
                     && z > r.tl.z && z < r.br.z) return r;
                }
            }
        }
        return false;
    }

    function swapXZ(bool, p) {
        return bool ? { x: p.z, z: p.x } : p;
    };

    return map;
};

exports._ = $m;
