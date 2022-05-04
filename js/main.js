import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PointerLockControls } from '/js/PointerLockControls.js';
import { HUD } from "/js/HUD.js"
import { Targets } from '/js/targets.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { threeToCannon, ShapeType } from 'three-to-cannon';
import {threeToCannonObj} from '/js/ThreeToCannonObj.js'


var scene = new THREE.Scene();
const aspectRatio = window.innerWidth / window.innerHeight
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
const HudCamera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 0, 30)
var sceneHUD = new THREE.Scene();
var frustumSize = 14;
var dt=0;
//2*frustumSize, 2*-frustumSize , frustumSize , -frustumSize , 0, 10 
//(window.innerWidth-20)/(-2*frustumSize),(window.innerWidth-20)/(2*frustumSize),(window.innerHeight-20)/(2*frustumSize),(window.innerHeight-20)/(-2*frustumSize),1,1000 
const pipcamera = new THREE.OrthographicCamera(-frustumSize, frustumSize, frustumSize, -frustumSize, 1, 1000);
var Clock = new THREE.Clock(true)
const renderer = new THREE.WebGLRenderer();
renderer.antialias = true
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
renderer.setClearColor(0xADD8E6, 1)
document.body.appendChild(renderer.domElement);
const initposition=new CANNON.Vec3(0, 5, 4)
const raycaster = new THREE.Raycaster();
const loader = new THREE.TextureLoader();
const timestep = 1 / 60
const material = new THREE.MeshStandardMaterial({
	map: loader.load('textureOne.jpg') //test texture
});
const TargetArr = [];
const mapTargetArr = [];
const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -1, 0) //Middle value is gravity in the y direction 
});

const planeMaterial = new CANNON.Material({
	friction: 10,
	restitution: 0
})

var hud = new HUD(20, 30, 5, 0);

var hudTexture = new THREE.Texture(hud.getCanvas())

//hudTexture.repeat.set((window.innerWidth-20)/)
hudTexture.needsUpdate = true;
var hudMat = new THREE.MeshBasicMaterial({ map: hudTexture });
hudMat.transparent = true
console.log(window.innerWidth / hudTexture.image.width, window.innerHeight / hudTexture.image.height)
var HudGeom = new THREE.BoxGeometry(window.innerWidth, window.innerHeight, 0)
var HudPlane = new THREE.Mesh(HudGeom, hudMat)
HudPlane.material.depthTest = false;
HudPlane.material.depthWrite = false;
HudPlane.onBeforeRender = function (renderer) {
	renderer.clearDepth();
}
sceneHUD.add(HudPlane)

addTargets([[8, 3, 5], [10, 6, 2], [3, 3, 3]]);
console.log(TargetArr.length)
hud.updateTargetNumbers(TargetArr.length, 0)


//Import the level from Blender and apply physics bounding
const manager = new THREE.LoadingManager();
//manager.onLoad = init;
//init function ?????????
const models = {
	body: { url: '/Objects/Level_1/Level_1.gltf' },
};
{
	const gltfLoader = new GLTFLoader(manager);
	for (const model of Object.values(models)) {
		gltfLoader.load(model.url, (gltf) => {
			const root = gltf.scene;
			scene.add(root);


			const obj3D1 = root.getObjectByName('Base001')
			world.addBody(threeToCannonObj.getCannonMesh(obj3D1));

			const obj3D2 = root.getObjectByName('Base002')
			world.addBody(threeToCannonObj.getCannonMesh(obj3D2));

			// const obj3D2 = root.getObjectByName('Base0wds02')
			// world.addBody(THREETOCANNON.getCannonMesh(obj3D2));

			




			//Ignore but do no delete -------------------------------------------------------------------
			// //Add body (scene of the gltf file)
			// scene.add(root.translateY(0));

			//Treat the head (child of body) as a separate object to manipulate
			// let headOfBody = root.getObjectByName('Head');
			// //Add Head
			// scene.add(headOfBody.translateY(2))
		});
	}
}


const geometry = new THREE.BoxGeometry(1, 1, 1);
const floorGeo = new THREE.BoxGeometry(100, 0.1, 100);
const floorMat = new THREE.MeshLambertMaterial({ map: loader.load("goomba.png") }); //testure on floor to show depth of movement

const light = new THREE.HemisphereLight("white", "white", 0.5);
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.receiveShadow = true;







const groundBody = new CANNON.Body({
	shape: new CANNON.Box(new CANNON.Vec3(100, 0.1, 100)), //have floor be really thin box since plane was having collision issues 
	mass: 0, //no mass so it does not fall
	type: CANNON.Body.STATIC, //does not move
	material: planeMaterial //to add friction 
});
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), Math.PI * 0.5); //flat surface 
world.addBody(groundBody) //add floor to world
scene.add(light)
scene.add(floor.translateZ(-6).translateY(-2))
camera.position.z = 9;
camera.position.y = 9;
pipcamera.position.set(0, 30, 0);
pipcamera.rotateX(-Math.PI / 2)

const initcam=camera.quaternion
console.log(initcam)

const player = new THREE.Mesh(new THREE.SphereGeometry(1.5), material);  //visibile representation of player hitbox
player.castShadow = true;
player.receiveShadow = true;
scene.add(player)
const playerShape = new CANNON.Sphere(1.5);
const playerBody = new CANNON.Body({ //player hitbox represented by sphere 
	mass: 5,
	shape: playerShape,
	position: initposition,
	quaternion: new THREE.Quaternion(),
	material: planeMaterial //to add friction 
});

playerBody.pitchObject = new THREE.Object3D()
playerBody.pitchObject.add(camera)
playerBody.noBullets = 20;
playerBody.yawObject = new THREE.Object3D()
playerBody.yawObject.position.z = 5;
playerBody.yawObject.position.y = 2;
playerBody.yawObject.add(playerBody.pitchObject)
playerBody.euler = new THREE.Euler()
playerBody.canJump = false;

const contNorm = new CANNON.Vec3()
const upAxis = new CANNON.Vec3(0, 1, 0);
playerBody.addEventListener('collide', (event) => {
	const { contact } = event
	if (contact.bi.id == playerBody.id) {
		contact.ni.negate(contNorm)
	} else {
		contNorm.copy(contact.ni)
	}
	if (contNorm.dot(upAxis) > 0.5) {
		playerBody.canJump = true
	}
})


const direcLight = new THREE.DirectionalLight(0xffffff, 1);
direcLight.position.set(0, 15, 0);
direcLight.target = player
direcLight.castShadow = true;
scene.add(direcLight)

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

document.addEventListener("mousedown", (e) => {
	if (playerBody.noBullets > 0) {
		playerBody.noBullets--;

		raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
		const intersects = raycaster.intersectObjects(scene.children);
		outer: for (let i = 0; i < intersects.length; i++) {
			for (let j = 0; j < TargetArr.length; j++) {
				if (intersects[i].object == TargetArr[j].getCylinder() && TargetArr[j].isHit == false) {
					HitTarget(intersects[i].object.name)
					hud.increaseTarget();
					break outer;
				}
			}
		}
		renderer.readRenderTargetPixels(scene, camera)
		if(playerBody.noBullets==0){
			removeTargets();
		}
	}
	if (hud.gamestate == -1 ) // game fail
	{
	init();
		

	}
	else if (hud.gamestate==1){ //game win (only one level so just resets)
		removeTargets();
		
		init();
	}
})

const pressedKeys = {};


document.addEventListener("keydown", (e) => {
	pressedKeys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
	pressedKeys[e.key] = false;
});

function HitTarget(name) {
	TargetArr[parseInt(name)].hit();
}

function move() {
	playerBody.linearDamping=0.9
	playerBody.angularDamping=0.9
	playerBody.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x))

	playerBody.yawObject.rotation.y = camera.rotation.y;

	var tempVec = new THREE.Vector3(0, 0, 0);
	
	var delta=dt*0.1
	if (controls.isLocked) {

		if (pressedKeys['w']) {
			tempVec.z = -0.5 * delta
		}
		if (pressedKeys['a']) {
			tempVec.x = -0.5 * delta
		}
		if (pressedKeys["d"]) {
			tempVec.x = 0.5 * delta
		}
		if (pressedKeys['s']) {
			tempVec.z = 0.5 * delta
		}
		if (pressedKeys[" "]) {
			if (playerBody.canJump == true) {
				//playerBody.applyLocalImpulse(new CANNON.Vec3(0,20*dt,0),new CANNON.Vec3(0,0,0))
				playerBody.velocity.y =10
			//	playerBody.applyLocalImpulse(0,20*delta,0)
			}
			playerBody.canJump = false
		}

	}

	playerBody.quaternion.copy(camera.quaternion)
	tempVec.applyQuaternion(playerBody.quaternion);
	playerBody.velocity.x += tempVec.x
	playerBody.velocity.z += tempVec.z
	playerBody.yawObject.position.copy(playerBody.position)
	camera.position.copy(playerBody.position);
	pipcamera.position.x = (playerBody.position.x);
	pipcamera.position.z = (playerBody.position.z);

}

floor.position.copy(groundBody.position);
floor.quaternion.copy(groundBody.quaternion);
function animate() {
	world.step(timestep);


	player.position.copy(playerBody.position);
	player.quaternion.copy(playerBody.quaternion);
	requestAnimationFrame(animate);
	dt = Clock.getDelta() * 1000
	move(); 
	world.step(1/60,dt)
	hud.updateAmmoCount(playerBody.noBullets, 30)
	hud.draw();
	hudTexture.needsUpdate = true;
	renderer.autoClear = false;
	renderer.clear();
	renderer.setViewport(0, 0, window.innerWidth - 20, window.innerHeight - 20);
	renderer.render(scene, camera)
	renderer.render(sceneHUD, HudCamera)
	mapTargets();
	renderer.clearDepth();
	renderer.setViewport(window.innerWidth - 250, 50, 200, 200)
	renderer.render(scene, pipcamera);
	worldTargets();


};

animate();


function mapTargets() {
	for (var i = 0; i < TargetArr.length; i++) {
		//scene.remove(TargetArr[i].getCylinder())
		var tempCylinder = new THREE.Mesh(TargetArr[i].getCylinder().geometry, TargetArr[i].getCylinder().material)
		tempCylinder.position.copy(TargetArr[i].getCylinder().position)
		mapTargetArr.push(tempCylinder)
		scene.add(tempCylinder.rotateY(Math.PI / 2).translateY(5))
	}


}
function worldTargets() {
	while (mapTargetArr.length != 0) {
		scene.remove(mapTargetArr.pop())
	}
}


function addTargets(position) {

	for (var i = 0; i < position.length; i++) {
		var target = new Targets(i, position[i][0], position[i][1], position[i][2]);
		TargetArr.push(target)
		scene.add(target.getCylinder())


	}

}
function init() {

	addTargets([[8, 3, 5], [10, 6, 2], [3, 3, 3]]);
	hud.gamestate = 0;
	hud.currtargets = 0;
	playerBody.noBullets=20;
	hud.updateAmmoCount(playerBody.noBullets, 30);
	playerBody.velocity=new CANNON.Vec3(0,0,0)
	playerBody.position.copy(initposition)
	camera.position.copy(playerBody.position)
	camera.lookAt(0,0,0)
	playerBody.quaternion.copy(camera.quaternion)
	
}
function removeTargets() {
	while (TargetArr.length != 0) {
		scene.remove(TargetArr.pop().getCylinder())
	}
}