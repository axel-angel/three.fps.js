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
var mPlayerBlue = $$.player({ color: 0x0000ff });
var mPlayerRed  = $$.player({ color: 0xff0000 });

// self-body (player)
var selfBody = mPlayerBlue.clone();
selfBody.rotation.set(0, 0, 0);

// websocket
var ws = $$.ws('ws://'+ location.host, wsDispatch);

// send our state
function wsSendUpdate (t) {
    if (t - ws._last < $s.wsFreq) return

    var obj = {
        position: selfBody.position.toArray(),
        rotation: selfBody.rotation.toArray(),
        dirVec:   controls.keyDirection.toArray(),
    };
    ws.event('move', obj);

    ws._last = t;
};

// rendering / update
var clock = new THREE.Clock();

function render() {
    requestAnimationFrame(render);

    var delta = clock.getDelta();
    controls.update(delta);
    onTickUpdate(delta);

    $$.updateSelfBodyCamera(selfBody, camera);
    wsSendUpdate(clock.getElapsedTime());
    renderer.render(scene, camera);
}
render();
