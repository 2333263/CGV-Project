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
const floorGeo = new THREE.BoxGeometry(15, 0.1, 15);
const floorMat = new THREE.MeshLambertMaterial({ color: 0x404040 });
const light = new THREE.HemisphereLight("white", "white", 0.8);
const floor = new THREE.Mesh(floorGeo, floorMat);
const cube = new THREE.Mesh(geometry, material);
var planeShape = new CANNON.Plane()
const groundBody = new CANNON.Body({
	shape: planeShape,
	mass: 0
});
//groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
groundBody.position.set(-1, -3, -1);
world.addBody(groundBody)
scene.add(cube.translateZ(-6).translateY(-1));
scene.add(light);
scene.add(floor.translateZ(-6).translateY(-2));
camera.position.z = 5;


/*
const player = new THREE.Mesh(geometry, material);

var playerShape = new CANNON.Sphere(1.5);
var playerBody = new CANNON.Body({
	mass: 0,
	shape: playerShape
});
playerBody.linearDamping = 0.9;
//playerBody.addShape(playerShape);
playerBody.position.set(0, 0, 5);
world.addBody(playerBody);
*/
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

const pressedKeys={};

//pressedKeys['w']=true;

document.addEventListener("keydown",(e)=> {
	pressedKeys[e.key]=true;
});
document.addEventListener("keyup",(e)=>{
	pressedKeys[e.key]=false;
});




function move(){
if(controls.isLocked){
	if(pressedKeys['w']){
		controls.moveForward(0.5);
	}
	if(pressedKeys['a']){
		controls.moveRight(-0.5);

	}
	if(pressedKeys["d"]){
		controls.moveRight(0.5);
	}
	if(pressedKeys['s']){
		controls.moveForward(-0.5);
	}
	if(pressedKeys[" "]){
		console.log("space");
	}




	/*switch(key){
		case (87): //press W
			console.log("W");
			break;
		case 83: //press S
			
				break;
			case 65: //press A

				break;
			case 68: //press D

				break;
			case 32: //press space

				break;
			default:
				break;

		}*/
	}
}




function animate() {
	world.step(timestep);
	requestAnimationFrame(animate);
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	cube.rotation.z += 0.01;
	//	controls.update(1.0);
	move();
	floor.position.copy(groundBody.position);
	floor.quaternion.copy(groundBody.quaternion);
	renderer.render(scene, camera);
};

animate();