"use strict";

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

THREE.FirstPersonControls = function (object, domElement) {
    this.object = object;
    this.target = new THREE.Vector3(0, 0, 0);

    this.domElement = (domElement !== undefined) ? domElement : document;

    this.lockCursor = false;

    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.heightMax = 1.0;

    this.verticalMin = 0;
    this.verticalMax = Math.PI;

    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.mouseX = 0;
    this.mouseY = 0;

    this.lat = 0;
    this.lon = 0;
    this.phi = 0;
    this.theta = 0;

    this.keyDirection = $$.vec(0, 0, 0);
    this.freezeMove = false;
    this.freezeLook = false;

    this.onMouseDown = function (event) {
        event.preventDefault();
        event.stopPropagation();
        return onMouseDown(event.button); // pass event to game
    };

    this.onMouseUp = function (event) {
        event.preventDefault();
        event.stopPropagation();
        return onMouseUp(event.button); // pass event to game
    };

    this.onMouseMove = function (event) {
        var viewHalfX = window.innerWidth / 2;
        var viewHalfY = window.innerHeight / 2;
        this.mouseX = event.pageX - viewHalfX;
        this.mouseY = event.pageY - viewHalfY;
        if (this.domElement !== document) {
            this.mouseX -= this.domElement.offsetLeft;
            this.mouseY -= this.domElement.offsetTop;
        }
    };

    this.onKeyDown = function (event) {
        switch (event.keyCode) {
            case $$.ord('W'): this.keyDirection.z = +1; break;
            case $$.ord('S'): this.keyDirection.z = -1; break;
            case $$.ord('D'): this.keyDirection.x = +1; break;
            case $$.ord('A'): this.keyDirection.x = -1; break;
            case $$.ord('Q'): this.freezeLook ^= 1; break;
            // pass other events to game
            default: return onKeyDown($$.chr(event.keyCode));
        }

        if (this.freezeMove) {
            this.keyDirection.x = 0;
            this.keyDirection.z = 0;
        }
    };

    this.onKeyUp = function (event) {
        switch (event.keyCode) {
            case $$.ord('W'):
            case $$.ord('S'): this.keyDirection.z = 0; break;
            case $$.ord('A'):
            case $$.ord('D'): this.keyDirection.x = 0; break;
            // pass other events to game
            default: return onKeyUp($$.chr(event.keyCode));
        }
    };

    this.cameraMove = function (delta) {
        if (this.freezeMove) return; // move disabled

        var actualMoveSpeed = delta * $s.movementSpeed;

        if (this.keyDirection.length() >= 0.01)
            this.keyDirection.normalize();
        var v = $$.angtovec(this.theta, this.keyDirection);
        this.object.position.x += actualMoveSpeed * v.x
        this.object.position.z += actualMoveSpeed * v.z
    };

    this.mouseLook = function(delta) {
        if (this.freezeLook) return; // mouse look disabled

        // TODO: lockCursor
        var xDelta = this.mouseX;
        var yDelta = this.mouseY;
        if (this.lockCursor) {
            xDelta -= this.lastMouseX;
            yDelta -= this.lastMouseY;
            this.lon = xDelta * $s.mouseSensitivity;
            this.lat = yDelta * $s.mouseSensitivity;
        }
        this.lon = xDelta * $s.mouseSensitivity;
        this.lat = yDelta * $s.mouseSensitivity;

        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;

        this.lat = -Math.max(- 85, Math.min(85, this.lat));
        this.phi = THREE.Math.degToRad(90 - this.lat);

        this.theta = THREE.Math.degToRad(this.lon);

        // constraint vertical
        this.phi = THREE.Math.mapLinear(this.phi, 0, Math.PI,
                                        this.verticalMin, this.verticalMax);

        var targetPosition = this.target,
            position = this.object.position,
            sinphi = Math.sin(this.phi),
            cosphi = Math.cos(this.phi);

        targetPosition.x = position.x + 100 * sinphi * Math.cos(this.theta);
        targetPosition.z = position.z + 100 * sinphi * Math.sin(this.theta);
        targetPosition.y = position.y + 100 * cosphi;

        this.object.lookAt(targetPosition);
    };

    var that = this;
    var bind = function (evname, fn) {
        that.domElement.addEventListener(evname, function () {
            fn.apply(that, arguments);
        }, false);
    };

    bind('contextmenu', function (event) { event.preventDefault(); });
    bind('mousemove', this.onMouseMove);
    bind('mousedown', this.onMouseDown);
    bind('mouseup', this.onMouseUp);
    bind('keydown', this.onKeyDown);
    bind('keyup',   this.onKeyUp);

};
