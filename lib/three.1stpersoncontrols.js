/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

THREE.FirstPersonControls = function (object, domElement) {
	this.object = object;
	this.target = new THREE.Vector3(0, 0, 0);

	this.domElement = (domElement !== undefined) ? domElement : document;

	this.movementSpeed = 1.0;
	this.sensivitiy = 1;
    this.lockCursor = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
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
	this.freeze = false;

	this.mouseDragOn = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if (this.domElement !== document) {
		this.domElement.setAttribute('tabindex', -1);
	}

	this.handleResize = function () {
		if (this.domElement === document) {
			this.viewHalfX = window.innerWidth / 2;

		} else {
			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;
		}
	};

	this.onMouseDown = function (event) {
		if (this.domElement !== document) {
			this.domElement.focus();
		}
		event.preventDefault();
		event.stopPropagation();
		if (this.activeLook) {
			switch (event.button) {
				case 0: this.keyDirection.z = +1; break;
				case 2: this.keyDirection.z = -1; break;
			}
		}
		this.mouseDragOn = true;
	};

	this.onMouseUp = function (event) {
		event.preventDefault();
		event.stopPropagation();
		if (this.activeLook) {
			switch (event.button) {
				case 0: this.keyDirection.z = 0; break;
				case 2: this.keyDirection.z = 0; break;
			}
		}
		this.mouseDragOn = false;
	};

	this.onMouseMove = function (event) {
        this.mouseX = event.pageX - this.viewHalfX;
        this.mouseY = event.pageY - this.viewHalfY;
		if (this.domElement !== document) {
			this.mouseX -= this.domElement.offsetLeft;
			this.mouseY -= this.domElement.offsetTop;
		}
	};

	this.onKeyDown = function (event) {
		switch (event.keyCode) {
			case 38: /*up*/
			case 87: /*W*/ this.keyDirection.z = +1; break;
			case 40: /*down*/
			case 83: /*S*/ this.keyDirection.z = -1; break;

			case 37: /*left*/
			case 65: /*A*/ this.keyDirection.x = +1; break;
			case 39: /*right*/
			case 68: /*D*/ this.keyDirection.x = -1; break;

			case 81: /*Q*/ this.freeze = !this.freeze; break;
		}
	};

	this.onKeyUp = function (event) {
		switch (event.keyCode) {
			case 38: /*up*/
			case 87: /*W*/
			case 40: /*down*/
			case 83: /*S*/ this.keyDirection.z = 0; break;

			case 37: /*left*/
			case 65: /*A*/
			case 39: /*right*/
			case 68: /*D*/ this.keyDirection.x = 0; break;
		}
	};

	this.update = function(delta) {
		if (this.freeze) return;

		if (this.heightSpeed) {
			var y = THREE.Math.clamp(this.object.position.y, this.heightMin, this.heightMax);
			var heightDelta = y - this.heightMin;
		}

		var actualMoveSpeed = delta * this.movementSpeed;

        if (this.keyDirection.length() >= 0.01)
            this.keyDirection.normalize();
        this.object.position.x +=
          + this.keyDirection.x * actualMoveSpeed * Math.sin(this.theta)
          + this.keyDirection.z * actualMoveSpeed * Math.cos(this.theta);
        this.object.position.z +=
          - this.keyDirection.x * actualMoveSpeed * Math.cos(this.theta)
          + this.keyDirection.z * actualMoveSpeed * Math.sin(this.theta);

        // TODO: lockCursor
        if (this.lockCursor) {
            var xDelta = this.lastMouseX - this.mouseX;
            var yDelta = this.lastMouseY - this.mouseY;
            this.lon = xDelta * this.sensivitiy;
            this.lat = yDelta * this.sensivitiy;
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
        }
        else {
            this.lon = this.mouseX * this.sensivitiy;
            this.lat = this.mouseY * this.sensivitiy;
        }

		this.lat = -Math.max(- 85, Math.min(85, this.lat));
		this.phi = THREE.Math.degToRad(90 - this.lat);

		this.theta = THREE.Math.degToRad(this.lon);

		if (this.constrainVertical) {
			this.phi = THREE.Math.mapLinear(this.phi, 0, Math.PI, this.verticalMin, this.verticalMax);
		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
		targetPosition.y = position.y + 100 * Math.cos(this.phi);
		targetPosition.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);

		this.object.lookAt(targetPosition);
	};


	this.domElement.addEventListener('contextmenu', function (event) { event.preventDefault(); }, false);

	this.domElement.addEventListener('mousemove', bind(this, this.onMouseMove), false);
	this.domElement.addEventListener('mousedown', bind(this, this.onMouseDown), false);
	this.domElement.addEventListener('mouseup', bind(this, this.onMouseUp), false);
	
	window.addEventListener('keydown', bind(this, this.onKeyDown), false);
	window.addEventListener('keyup', bind(this, this.onKeyUp), false);

	function bind(scope, fn) {
		return function () {
			fn.apply(scope, arguments);
		};
	};

	this.handleResize();
};
