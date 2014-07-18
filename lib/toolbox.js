var $$ = {};

$$.box = function (p) {
    var geometry = new THREE.BoxGeometry(p.x, p.y, p.z);
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    var material = new THREE.MeshLambertMaterial({color: p.color});
    return new THREE.Mesh(geometry, material);
};

$$.player = function (p) {
    var player = new THREE.Object3D();
    player.castShadow = true;

    var head = $$.box({ x:0.25, y:0.3, z:0.25, color:p.color });
    head.position.set(0, 0.95, 0);
    head.castShadow = true;
    player.add(head);

    var body = $$.box({ x:0.45, y:0.6, z:0.2, color:p.color });
    body.position.set(0, 0.5, 0);
    body.castShadow = true;
    player.add(body);

    var leg1 = $$.box({ x:0.15, y:0.4, z:0.15, color:p.color });
    leg1.position.set(-0.1, 0, 0);
    leg1.castShadow = true;
    player.add(leg1);

    var leg2 = $$.box({ x:0.15, y:0.4, z:0.15, color:p.color });
    leg2.position.set(+0.1, 0, 0);
    leg2.castShadow = true;
    player.add(leg2);

    return player;
};
