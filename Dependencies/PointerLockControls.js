import {
	Euler,
	EventDispatcher,
	Vector3
} from 'three';

const _euler = new Euler( 0, 0, 0, 'YXZ' );
const _vector = new Vector3();

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

const _PI_2 = Math.PI / 2;

class PointerLockControls extends EventDispatcher {
	constructor( camera, domElement ) {
		super();
		if ( domElement === undefined ) {
			console.warn( 'THREE.PointerLockControls: The second parameter "domElement" is now mandatory.' );
			domElement = document.body;
		}
		this.domElement = domElement;
		this.isLocked = false;

		// Set to constrain the pitch of the camera
		// Range is 0 to Math.PI radians
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians
		this.pointerSpeed = 1.0;
		const scope = this;
		var prevMoveX=-999;
		var prevMoveY=-999;

		//On Mouse Move Logic
		function onMouseMove( event ) {
			if ( scope.isLocked === false ) return;
			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			// this if statement is a work around to a bug in chrome where it wouldnt read the mouse position properly
			if(Math.abs(Math.abs(movementX)-Math.abs(prevMoveX))>200 && prevMoveX!=-999 &&movementX!=0){
				movementX=(window.innerWidth/movementX)-2.3
			}

			// this if statement is a work around to a bug in chrome where it wouldnt read the mouse position properly
			if( Math.abs(Math.abs(movementY)-Math.abs(prevMoveY))>200 && prevMoveY!=-999 &&movementY!=0){
				movementY=(window.innerHeight/movementY)-2.3
			}

			_euler.setFromQuaternion( camera.quaternion );
			_euler.y -= movementX * 0.002 * scope.pointerSpeed;
			_euler.x -= movementY * 0.002 * scope.pointerSpeed;
			_euler.x = Math.max( _PI_2 - scope.maxPolarAngle, Math.min( _PI_2 - scope.minPolarAngle, _euler.x ) );
			camera.quaternion.setFromEuler( _euler );
			scope.dispatchEvent( _changeEvent );
			prevMoveX=movementX
			prevMoveY=movementY
		};

		//On Pointer Lock Change
		function onPointerlockChange() {
			if ( scope.domElement.ownerDocument.pointerLockElement === scope.domElement ) {
				scope.dispatchEvent( _lockEvent );
				scope.isLocked = true;
			} 
			else {
				scope.dispatchEvent( _unlockEvent );
				scope.isLocked = false;
			}
		};

		//On Pointer Lock Error
		function onPointerlockError() {
			//console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );
		};

		//Connect Function
		this.connect = function () {
			scope.domElement.ownerDocument.addEventListener( 'mousemove', onMouseMove );
			scope.domElement.ownerDocument.addEventListener( 'pointerlockchange', onPointerlockChange );
			scope.domElement.ownerDocument.addEventListener( 'pointerlockerror', onPointerlockError );
		};

		//Disconnect Function
		this.disconnect = function () {
			scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove );
			scope.domElement.ownerDocument.removeEventListener( 'pointerlockchange', onPointerlockChange );
			scope.domElement.ownerDocument.removeEventListener( 'pointerlockerror', onPointerlockError );
		};

		//Dispose Function
		this.dispose = function () {
			this.disconnect();
		};

		//Retaining this method for backward compatibility
		this.getObject = function () {
			return camera;
		};

		//Returns direction
		this.getDirection = function () {
			const direction = new Vector3( 0, 0, - 1 );
			return function ( v ) {
				return v.copy( direction ).applyQuaternion( camera.quaternion );
			};
		};

		//Move forward given distance, parallel to xz-plane, assumes camera.up is y-up.
		this.moveForward = function ( distance ) {
			_vector.setFromMatrixColumn( camera.matrix, 0 );
			_vector.crossVectors( camera.up, _vector );
			camera.position.addScaledVector( _vector, distance );
		};

		//Move rightwards
		this.moveRight = function ( distance ) {
			_vector.setFromMatrixColumn( camera.matrix, 0 );
			camera.position.addScaledVector( _vector, distance );
		};

		//Lock function
		this.lock = function () {
			this.domElement.requestPointerLock();
		};

		//Unlock Function
		this.unlock = function () {
			scope.domElement.ownerDocument.exitPointerLock();
		};

		//Final connection Init
		this.connect();
	}
}
//Final Export
export { PointerLockControls };