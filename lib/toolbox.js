"use strict";
var $$ = {};

$$.ord = function (c) {
    return c.charCodeAt(0);
};

$$.chr = function (i) {
    return String.fromCharCode(i);
};

$$.vec = function (x, y, z) {
    return new THREE.Vector3(x, y, z);
};

$$.vec1to3 = function (a) {
    return new THREE.Vector3(a, a, a);
};

$$.angtovec = function (theta, direction) {
    var v = $$.vec(0, 0, 0);
    v.x =
      - direction.x * Math.sin(theta)
      + direction.z * Math.cos(theta);
    v.z =
      + direction.x * Math.cos(theta)
      + direction.z * Math.sin(theta);
    return v;
};

$$.box = function (p) {
    var geometry = new THREE.BoxGeometry(p.x, p.y, p.z);
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    var material = new THREE.MeshLambertMaterial({color: p.color, map: p.texture});
    return new THREE.Mesh(geometry, material);
};

$$.camera = function () {
    var ratio = window.innerWidth / window.innerHeight;
    var s = $s.camera;
    var c = new THREE.PerspectiveCamera(s.fov, ratio, s.near, s.far);
    c.mode = 'none';
    return c;
};

$$.controls = function () {
    controls = new THREE.FirstPersonControls(camera);
    controls.sensivitiy = 0.5;
    controls.lockCursor = false;
    controls.movementSpeed = 2;
    controls.noFly = false;
    controls.constrainVertical = true;
    controls.verticalMin = 0;
    controls.verticalMax = 3;
    controls.lon = 250;
    controls.activeLook = true;
    return controls;
};

$$.renderer = function () {
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    // shadow map
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
    return renderer;
};

$$.mainLight = function () {
    // down spot light
    var light = new THREE.DirectionalLight(0xffffff, 1);
    //var light = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2, 1);
    light.position.set(5, 3, 3);
    light.castShadow = true;
    light.shadowDarkness = 0.5;
    light.shadowCameraRight = 25;
    light.shadowCameraLeft = -25;
    light.shadowCameraTop = 25;
    light.shadowCameraBottom = -25;
    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 1024;
    light.shadowCameraNear = 0.1;
    light.shadowCameraFar = 1000;
    light.shadowCameraFov = 90;
    return light;
};

$$.ground = function () {
    var gTexture = THREE.ImageUtils.loadTexture("img/ground.jpg");
    var ground = $$.box({ x:100, y:0, z:100, color: 0x999999, texture: gTexture});
    ground.position.set(0, 0, 0);
    ground.castShadow = false;
    ground.receiveShadow = true;
    return ground;
};

$$.player = function (p, hideHead) {
    var player = new THREE.Object3D();
    player.castShadow = true;

    var head = $$.box({ x:0.25, y:0.3, z:0.25, color:p.color });
    head.position.set(0, 1.15, 0);
    head.castShadow = true;
    player.add(head);

    var body = $$.box({ x:0.45, y:0.6, z:0.2, color:p.color });
    body.position.set(0, 0.7, 0);
    body.castShadow = true;
    player.add(body);

    var leg1 = $$.box({ x:0.15, y:0.4, z:0.15, color:p.color });
    leg1.position.set(-0.1, 0.2, 0);
    leg1.castShadow = true;
    player.add(leg1);

    var leg2 = $$.box({ x:0.15, y:0.4, z:0.15, color:p.color });
    leg2.position.set(+0.1, 0.2, 0);
    leg2.castShadow = true;
    player.add(leg2);

    return player;
};

$$.updateSelfBodyCamera = function (selfBody, camera) {
    selfBody.rotation.y = camera.rotation.y;
    selfBody.position.copy(camera.position);
    selfBody.position.add($$.vec(0, -1.2, 0.2));
};

$$.ws = function (url, dispatchers) {
    var ws = new WebSocket(url);
    ws._last = 0;

    ws.event = function (tpe, data) {
        ws.send(JSON.stringify({
            'type': tpe,
            'data': data,
        }));
    };
    ws.onopen = function (ev) {
        console.log(['ws open', ev]);
    };
    ws.onmessage = function (ev) {
        var m = JSON.parse(ev.data);
        var type = m.type;

        if (m.type in dispatchers) {
            dispatchers[m.type](m.data);
        }
        else {
            console.error(['ws unknown', m.type, m]);
        }
    };

    return ws;
};

$$.loadMap = function (map) {
    var height = $s.map.wallHeight;
    var thick = $s.map.wallThick;
    var width = $s.map.wallWidth;
    var color = $s.map.wallColor;

    var bs = {
        r: $$.box({ x:width, y:height, z:thick, color:color }),
        d: $$.box({ x:thick, y:height, z:width, color:color }),
    };
    bs.r.position.x += width/2;
    bs.d.position.z += width/2;

    Object.keys(map).forEach(function (key) {
        $m.indexToCoord(key);
        var xzd = key.split('_');
        var x = xzd[0];
        var z = xzd[1];
        var d = xzd[2];

        var b = bs[d].clone();
        b.position.x += width * x;
        b.position.z += width * z;
        b.castShadow = true;
        b.receiveShadow = true;
        scene.add(b);
    });
};
