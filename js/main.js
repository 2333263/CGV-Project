import * as THREE from '../node_modules/three/build/three.module.js';
import * as CANNON from '../node_modules/cannon-es/dist/cannon-es.js';
import { PointerLockControls } from '/js/PointerLockControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var mouse = new THREE.Vector2(0, 0);
var mouseMove = false;
var TimeOut;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
const timestep = 1 / 60
const material = new THREE.MeshStandardMaterial({
	map: loader.load('textureOne.jpg')
});
const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -9.81, 0)
});
const geometry = new THREE.BoxGeometry();
const floorGeo = new THREE.BoxGeometry(100, 0.1, 100);
const floorMat = new THREE.MeshLambertMaterial({ color: 0x404040 });
const light = new THREE.HemisphereLight("white", "white", 0.8);
const floor = new THREE.Mesh(floorGeo, floorMat);
const cube = new THREE.Mesh(geometry, material);
const groundBody = new CANNON.Body({
	shape: new CANNON.Box(new CANNON.Vec3(100,0.1,100)),
	mass: 0,
	type: CANNON.Body.STATIC
});
//groundBody.addShape(planeShape);
//groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
//groundBody.position.set(-1, -3, -1);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), Math.PI * 0.5);
world.addBody(groundBody)
scene.add(cube.translateZ(-6).translateY(-1));
scene.add(light);
scene.add(floor.translateZ(-6).translateY(-2));
camera.position.z = 5;
camera.position.y = 2;



const player = new THREE.Mesh(new THREE.SphereGeometry(1.5), material);
scene.add(player);
const playerShape = new CANNON.Sphere(1.5);
const playerBody = new CANNON.Body({
	mass: 1,
	shape: playerShape,
	position: new CANNON.Vec3(0, 5, 4)
});
//playerBody.linearDamping = 0.9;
//playerBody.addShape(playerShape);
world.addBody(playerBody);

//ADD PLAYER CONTROLS
const controls = new PointerLockControls(camera, renderer.domElement);
//controls.maxPolarAngle=Math.PI/2+2;
//controls.movementSpeed=0;

scene.add(controls.getObject());


document.addEventListener('click', () => {
	controls.lock();
})

controls.addEventListener('lock', () => {
	controls.enabled = true;
})
controls.addEventListener('unlocked', () => {
	controls.enabled = false;
})

const pressedKeys = {};

//pressedKeys['w']=true;

document.addEventListener("keydown", (e) => {
	pressedKeys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
	pressedKeys[e.key] = false;
});




function move() {
	//console.log(camera.getWorldDirection());
	var tempVec=new THREE.Vector3();
	tempVec.y=0;
	tempVec.x=tempVec.x+8;
	tempVec.z=tempVec.z+8;
	camera.getWorldDirection(tempVec)
	//console.log(tempVec);
	if (controls.isLocked) {
		if (pressedKeys['w']) {
			//playerBody.applyImpulse()
			playerBody.velocity.x=tempVec.x*10;
			playerBody.velocity.z=tempVec.z*10
			//playerBody.applyLocalImpulse(tempVec,playerBody.position)
			//controls.moveForward(0.5);
		}
		if (pressedKeys['a']) {
			playerBody.velocity.x=tempVec.z*10;
			playerBody.velocity.z=-tempVec.x*10
			//controls.moveRight(-0.5);

		}
		if (pressedKeys["d"]) {
			playerBody.velocity.x=-tempVec.z*10;
			playerBody.velocity.z=tempVec.x*10
			//controls.moveRight(0.5);
		}
		if (pressedKeys['s']) {
			playerBody.velocity.x=-tempVec.x*10;
			playerBody.velocity.z=-tempVec.z*10
			//controls.moveForward(-0.5);
		}
		if (pressedKeys[" "]) {
			console.log("space");
		}

	}
	camera.position.copy(playerBody.position);
	console.log(playerBody.position)
}



function animate() {
	world.step(timestep);
	floor.position.copy(groundBody.position);
	floor.quaternion.copy(groundBody.quaternion);
	player.position.copy(playerBody.position);
	player.quaternion.copy(playerBody.quaternion);
	requestAnimationFrame(animate);
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	cube.rotation.z += 0.01;
	move();

	renderer.render(scene, camera);
};

animate();