import * as THREE from '../node_modules/three/build/three.module.js';
import * as CANNON from '../node_modules/cannon-es/dist/cannon-es.js';
import { PointerLockControls } from '/js/PointerLockControls.js';
import {HUD} from "/js/HUD.js"
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth-20, window.innerHeight-20);
renderer.setClearColor(0xADD8E6,1)
document.body.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
const timestep = 1 / 60
const material = new THREE.MeshStandardMaterial({
	map: loader.load('textureOne.jpg') //test texture
});

const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -18, 0) //Middle value is gravity in the y direction 
});

const planeMaterial =new CANNON.Material({
	friction: 10,
	restitution: 0
})

var hud=new HUD(20,30);

var hudTexture=new THREE.Texture(hud.getCanvas())
hudTexture.needsUpdate=true;
var hudMat=new THREE.MeshBasicMaterial({map:hudTexture});
hudMat.transparent=true

var HudGeom=new THREE.BoxGeometry(16,9,0)
var HudPlane=new THREE.Mesh(HudGeom,hudMat)
HudPlane.material.depthTest=false;
HudPlane.material.depthWrite=false;
HudPlane.onBeforeRender=function(renderer){
	renderer.clearDepth();
}
//HudPlane.position.copy(camera.position.copy)
//HudPlane.position.z+=0.1
camera.add(HudPlane.translateZ(-5));
//scene.add(HudPlane)

const geometry = new THREE.BoxGeometry(1,1,1);
const floorGeo = new THREE.BoxGeometry(100, 0.1, 100);
const floorMat = new THREE.MeshLambertMaterial({map: loader.load("goomba.png")}); //testure on floor to show depth of movement
const light = new THREE.HemisphereLight("white", "white", 0.8);
const floor = new THREE.Mesh(floorGeo, floorMat);
const cube = new THREE.Mesh(geometry, material);
const groundBody = new CANNON.Body({
	shape: new CANNON.Box(new CANNON.Vec3(100,0.1,100)), //have floor be really thin box since plane was having collision issues 
	mass: 0, //no mass so it does not fall
	type: CANNON.Body.STATIC, //does not move
	material:planeMaterial //to add friction 
});
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), Math.PI * 0.5); //flat surface 
world.addBody(groundBody) //add floor to world
scene.add(cube.translateZ(-6).translateY(2));
scene.add(light);
scene.add(floor.translateZ(-6).translateY(-2));
camera.position.z = 9;
camera.position.y = 9;



const player = new THREE.Mesh(new THREE.SphereGeometry(1.5), material);  //visibile representation of player hitbox
scene.add(player);
const playerShape = new CANNON.Sphere(1.5);
const playerBody = new CANNON.Body({ //player hitbox represented by sphere 
	mass: 1,
	shape: playerShape,
	position: new CANNON.Vec3(0, 5, 4),
	quaternion: new THREE.Quaternion(),
	material:planeMaterial //to add friction 
});

playerBody.pitchObject=new THREE.Object3D()
playerBody.pitchObject.add(camera)

playerBody.yawObject=new THREE.Object3D()
playerBody.yawObject.position.z=5;
playerBody.yawObject.position.y=2;
playerBody.yawObject.add(playerBody.pitchObject)
playerBody.euler=new THREE.Euler()
playerBody.canJump=false;

const contNorm=new CANNON.Vec3()
const upAxis=new CANNON.Vec3(0,1,0);
playerBody.addEventListener('collide', (event)=>{
	const {contact}=event
	if(contact.bi.id== playerBody.id){
		contact.ni.negate(contNorm)
	}else{
		contNorm.copy(contact.ni)
	}
	if(contNorm.dot(upAxis)>0.5){
		playerBody.canJump=true
	}
})

const cubeBody=new CANNON.Body({
	mass:0,
	shape: new CANNON.Box(new CANNON.Vec3(1,1,1))
})
world.addBody(cubeBody)


playerBody.linearDamping = 0.9;

world.addBody(playerBody);

const controls = new PointerLockControls(camera, renderer.domElement);

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


document.addEventListener("keydown", (e) => {
	pressedKeys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
	pressedKeys[e.key] = false;
});




function move() {

	playerBody.pitchObject.rotation.x=Math.max(-Math.PI / 2, Math.min(Math.PI / 2,camera.rotation.x))
	
	playerBody.yawObject.rotation.y=camera.rotation.y;

	var tempVec=new THREE.Vector3(0,0,0);

	if (controls.isLocked) {
	
		if (pressedKeys['w']) {
			tempVec.z=-0.4
		}
		if (pressedKeys['a']) {
			tempVec.x=-0.4
		}
		if (pressedKeys["d"]) {
			tempVec.x=0.4
		}
		if (pressedKeys['s']) {
			tempVec.z=0.4
		}
		if (pressedKeys[" "] ) {
			if( playerBody.canJump==true){
			var newTemp=new THREE.Vector3(0,15,0);
			var pos=new THREE.Vector3(0,0,0)
			playerBody.applyLocalImpulse(newTemp,pos)
			}
			playerBody.canJump=false
		}
	
	}
	playerBody.quaternion.copy(camera.quaternion)
	tempVec.applyQuaternion(playerBody.quaternion);
	playerBody.velocity.x+=tempVec.x
	playerBody.velocity.z+=tempVec.z
	playerBody.yawObject.position.copy(playerBody.position)
	camera.position.copy(playerBody.position);
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
	cubeBody.position.copy(cube.position)
	cubeBody.quaternion.copy(cube.quaternion)
	hud.draw();
	hudTexture.needsUpdate=true;
	/*var hudOffset=new THREE.Vector3(0,5,0)
	hudOffset.applyQuaternion(camera.quaternion);
	hudOffset.x=hudOffset.x+camera.position.x
	hudOffset.y=hudOffset.y+camera.position.y
	hudOffset.z=hudOffset.z+camera.position.z
	console.log(hudOffset)
	HudPlane.position.copy(hudOffset)
	HudPlane.quaternion.copy(camera.quaternion)
	//HUDcamera.position.copy(camera.position)
	//HUDcamera.quaternion.copy(camera.quaternion)
	*/
	renderer.render(scene, camera);
	//renderer.render(SceneHUD,HUDcamera)
	
};

animate();