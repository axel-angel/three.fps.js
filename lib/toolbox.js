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

    var head = $$.box({ x:0.1, y:0.1, z:0.1, color:p.color });
    head.position.set(0, 1, 0);
    player.add(head);

    var body = $$.box({ x:0.3, y:0.5, z:0.1, color:p.color });
    head.position.set(0, 0.5, 0);
    player.add(body);

    var leg1 = $$.box({ x:0.7, y:0.5, z:0.1, color:p.color });
    head.position.set(0.3, 0, 0);
    player.add(leg1);

    var leg2 = $$.box({ x:0.7, y:0.5, z:0.1, color:p.color });
    head.position.set(0.7, 0, 0);
    player.add(leg2);

    return player;
};
