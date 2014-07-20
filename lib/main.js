"use strict";

// scene globals
var camera = $$.camera();
var scene = new THREE.Scene();
var renderer = $$.renderer();
var controls = $$.controls();;

// lights
var ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);
var light = $$.mainLight();
scene.add(light);

var ground = $$.ground();
scene.add(ground);

// player (shared model)
var mTeams = {
    red:  $$.player({ color: 0xff0000 }),
    blue: $$.player({ color: 0x0000ff }),
};

// self-body (player)
var selfBody;

// websocket
var ws = $$.ws('ws://'+ location.host, wsDispatch);

// send our state
function wsSendUpdate (t) {
    if (t - ws._last < $s.wsFreq) return

    var obj = {
        position: camera.position.toArray(),
        rotation: camera.rotation.toArray(),
        dirVec:   controls.keyDirection.toArray(),
    };
    ws.event('move', obj);

    ws._last = t;
};

var cameraModes = {
    none: { unset: function () {} },
    top: {
        set: function (position) {
            camera.position.fromArray(position);
            camera.rotation.set(-Math.PI/2, 0, 0);
            controls.freezeLook = true;
            controls.freezeMove = true;
        },
        unset: function () {
            controls.freezeLook = false;
            controls.freezeMove = false;
        },
    },
    player: {
        set: function (position) {
            camera.position.fromArray(position);
            camera.rotation.set(0, 0, 0);
            scene.add(selfBody);
        },
        unset: function () {
            scene.remove(selfBody);
        },
    },
};

// rendering / update
var clock = new THREE.Clock();

function render() {
    requestAnimationFrame(render);

    var delta = clock.getDelta();
    onTickUpdate(delta);

    wsSendUpdate(clock.getElapsedTime());
    renderer.render(scene, camera);
}
render();
