import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PointerLockControls } from '/js/PointerLockControls.js';
import { HUD } from "/js/HUD.js"
import { Targets } from '/js/targets.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { threeToCannon, ShapeType } from 'three-to-cannon';
import {threeToCannonObj} from '/js/ThreeToCannonObj.js'
const width=window.innerWidth+20
const height=window.innerHeight+20
console.log(width-window.innerWidth)
var scene = new THREE.Scene();
const aspectRatio = width / height
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
const HudCamera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 30)
var sceneHUD = new THREE.Scene();
var frustumSize = 14;

var dt=0;
//2*frustumSize, 2*-frustumSize , frustumSize , -frustumSize , 0, 10 
//(width-20)/(-2*frustumSize),(width-20)/(2*frustumSize),(height-20)/(2*frustumSize),(height-20)/(-2*frustumSize),1,1000 
const pipcamera = new THREE.OrthographicCamera(-frustumSize, frustumSize, frustumSize, -frustumSize, 1, 1000);
var Clock = new THREE.Clock(true)
const renderer = new THREE.WebGLRenderer();
renderer.antialias = true
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight);
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
	gravity: new CANNON.Vec3(0, -20, 0) //Middle value is gravity in the y direction 
});

const planeMaterial = new CANNON.Material({
	friction: 10,
	restitution: 0
})
addTargets([[8, 3, 5], [10, 6, 2], [3, 3, 3]]); //adds targets to the target array and to the scene

const totalammo=parseInt(TargetArr.length*1.5) //make total amo proportional to no targets 

var hud = new HUD(totalammo, totalammo, TargetArr.length, 0); //initialises the hud

var hudTexture = new THREE.Texture(hud.getCanvas()) //returns the canvas object to use as a texture

//hudTexture.repeat.set((width-20)/)
hudTexture.needsUpdate = true;
var hudMat = new THREE.MeshBasicMaterial({ map: hudTexture });
hudMat.transparent = true
console.log(width / hudTexture.image.width, height / hudTexture.image.height)
var HudGeom = new THREE.BoxGeometry(width, height, 0)
var HudPlane = new THREE.Mesh(HudGeom, hudMat)
HudPlane.material.depthTest = false;
HudPlane.material.depthWrite = false;
HudPlane.onBeforeRender = function (renderer) {
	renderer.clearDepth();
}
sceneHUD.add(HudPlane)



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
			var housesCollision = []
			gltf.scene.traverse(function (child) {
				//Traverse through all objects to get the houses
				
				var name = child.name
				//Enable shadows for all objects
				child.castShadow = true;
				child.receiveShadow = true;
				if (name.substring(0, 4) === 'Base'){
					//Add houses to collision detection
					housesCollision.push(child)
				}
				if (name.substring(0, 11) === 'WindowGlass'){
					//Add subsurface scattering
					// const newMaterial = new THREE.MeshPhongMaterial( { map: child.material.map } );
					// child.material = newMaterial;
					//console.log(child.material)
				}
				
			});

			// gltf.parser.getDependencies( 'material' ).then( ( materials ) => {

			// 	console.log( materials );
			
			// } );


			const root = gltf.scene;
			
			//Visually render scene
			scene.add(root);

			for(const obj of housesCollision){
				//obj.castShadow = true;
				//obj.receiveShadow = true;
				scene.add(obj)
				world.addBody(threeToCannonObj.getCannonMesh(obj));
			}
			
			

			

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

/*
const ft = new THREE.TextureLoader().load("daylightbox_Front.bmp");
const bk = new THREE.TextureLoader().load("daylightbox_Back.bmp");
const up = new THREE.TextureLoader().load("daylightbox_Top.bmp");
const dn = new THREE.TextureLoader().load("daylightbox_Bottom.bmp");
const rt = new THREE.TextureLoader().load("daylightbox_Right.bmp");
const lf = new THREE.TextureLoader().load("daylightbox_Left.bmp");*/

//let pathStrings = ["miramar_ft.tga","miramar_bk.tga","miramar_up.tga","miramar_dn.tga","miramar_rt.tga","miramar_lf.tga"]
let pathStrings = ["bluecloud_ft.jpg","bluecloud_bk.jpg","bluecloud_up.jpg","bluecloud_dn.jpg","bluecloud_rt.jpg","bluecloud_lf.jpg",]
function createMaterialArray(){
	const skyboxImagepaths = pathStrings;
	const materialArray = skyboxImagepaths.map(image =>{
		let texture = new THREE.TextureLoader().load(image);
		return new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide});
	});
	return materialArray;
} // this function maps over the array of images 
//returns a Three.js material

const materialArray = createMaterialArray()

const skybxGeo = new THREE.BoxGeometry(1000,1000,1000);
const skybox   = new THREE.Mesh(skybxGeo,materialArray);
scene.add(skybox);

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
camera.position.z = 9; //initialise camera position
camera.position.y = 9;
pipcamera.position.set(0, 30, 0); // place top down camera at a height above the world 
pipcamera.rotateX(-Math.PI / 2) //rotate so that it is top down

const initcam=camera.quaternion // save camera rotation to be used in init function


const player = new THREE.Mesh(new THREE.SphereGeometry(1.5), material);  //visibile representation of player hitbox
player.castShadow = true;
player.receiveShadow = true;
scene.add(player)
const playerShape = new CANNON.Sphere(1.5);
const playerBody = new CANNON.Body({ //player hitbox represented by sphere for easy movement
	mass: 5,
	shape: playerShape,
	position: initposition,
	quaternion: new THREE.Quaternion(),
	material: planeMaterial //to add friction 
});

//playerBody.pitchObject = new THREE.Object3D()
//playerBody.pitchObject.add(camera)
playerBody.noBullets = hud.currammo
//playerBody.yawObject = new THREE.Object3D()
//playerBody.yawObject.position.z = 5;
//playerBody.yawObject.position.y = 2;
//playerBody.yawObject.add(playerBody.pitchObject)
//playerBody.euler = new THREE.Euler()
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
direcLight.position.set(19, 30, 0);
direcLight.target = player
direcLight.castShadow = true;
// direcLight.shadow.camera.top = 170;
// direcLight.shadow.camera.bottom = -170;
// direcLight.shadow.camera.left = -150;
// direcLight.shadow.camera.right = 150;
// direcLight.shadow.camera.near = 0;
// direcLight.shadow.camera.far = 150;
// direcLight.shadow.bias = 0.005;
scene.add(direcLight)

playerBody.linearDamping = 0.9;

world.addBody(playerBody); //adds player body to the world

const controls = new PointerLockControls(camera, document.body); //links controls to the camera

scene.add(controls.getObject());


controls.addEventListener('lock', () => {
	controls.enabled = true;
})
controls.addEventListener('unlocked', () => {
	controls.enabled = false;
})

document.addEventListener("mousedown", (e) => {
	if(controls.isLocked==true){
	if (playerBody.noBullets > 0) { //if player has any bullets 
		playerBody.noBullets--; //decrement bullet count

		raycaster.setFromCamera(new THREE.Vector2(0, 0), camera); // hit thing in line of sight of crosshair
		const intersects = raycaster.intersectObjects(scene.children);
			for (let j = 0; j < TargetArr.length; j++) {
				if (intersects[0].object == TargetArr[j].getCylinder() && TargetArr[j].isHit == false) { // only count if hit target and the target has not been already hit
					HitTarget(intersects[0].object.name)
					hud.increaseTarget();
				}
			}
		//renderer.readRenderTargetPixels(scene, camera)
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
}else{
	controls.lock();
}
})

const pressedKeys = {};


document.addEventListener("keydown", (e) => {
	if(controls.isLocked){
	pressedKeys[e.key] = true;
	}else{
		if(e.key=="r"){
			init();
		}
	}
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
//playerBody.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x))

	//playerBody.yawObject.rotation.y = camera.rotation.y;

	var tempVec = new THREE.Vector3(0, 0, 0);
	var delta=dt*1000
	delta*=0.1
	if (controls.isLocked) {

		if (pressedKeys['w']) {
			tempVec.z = -0.4 * delta
		}
		if (pressedKeys['a']) {
			tempVec.x = -0.4 * delta
		}
		if (pressedKeys["d"]) {
			tempVec.x = 0.4 * delta
		}
		if (pressedKeys['s']) {
			tempVec.z = 0.4 * delta
		}
		if (pressedKeys[" "]) {
			if (playerBody.canJump == true) {
				//playerBody.inertia=new CANNON.Vec3(0,-2,0)
				//playerBody.applyLocalImpulse(new CANNON.Vec3(0,80,0))
				playerBody.velocity.y =21
			//	playerBody.applyLocalImpulse(0,20*delta,0)
			}
			playerBody.canJump = false
		}

	}

	//playerBody.quaternion.copy(camera.quaternion)
	tempVec.applyQuaternion(camera.quaternion);
	playerBody.velocity.x += tempVec.x
	playerBody.velocity.z += tempVec.z
	camera.position.copy(playerBody.position);
//	camera.quaternion.copy(playerBody.quaternion)
	pipcamera.position.x = (playerBody.position.x);
	pipcamera.position.z = (playerBody.position.z);

}

floor.position.copy(groundBody.position);
floor.quaternion.copy(groundBody.quaternion);






function animate() {
	requestAnimationFrame(animate);
	if (controls.isLocked){ 	hud.isPaused(false);
	if(player.position.y<-25){init();} // if player out of bounds, reset level
	player.position.copy(playerBody.position);
	player.quaternion.copy(camera.quaternion);
	dt = Clock.getDelta()
	move(); 
	camera.position.copy(playerBody.position);
	hud.updateAmmoCount(playerBody.noBullets)
	hud.draw();
	hudTexture.needsUpdate = true;
	world.step(timestep,dt);
	
	}
	else{
	hud.isPaused(true);
	hud.draw();
	hudTexture.needsUpdate = true;
	}
	renderWorld()
};

animate();


function renderWorld(){
	renderer.autoClear = false;
	renderer.clear();
	renderer.render(scene, camera)
	
	mapTargets();
	renderer.clearDepth();
	renderer.setViewport(width - 250, 50, 200, 200)
	direcLight.castShadow=false;
	renderer.render(scene, pipcamera);
	worldTargets();
	direcLight.castShadow=true;
	renderer.setViewport(0, 0, width - 20, height - 20);
	renderer.render(sceneHUD, HudCamera)
}



function mapTargets() { // rotates targets for appearence on the map camera
	for (var i = 0; i < TargetArr.length; i++) {
		var tempCylinder = new THREE.Mesh(TargetArr[i].getCylinder().geometry, TargetArr[i].getCylinder().material)
		tempCylinder.position.copy(TargetArr[i].getCylinder().position)
		mapTargetArr.push(tempCylinder)
		scene.add(tempCylinder.rotateY(Math.PI / 2).translateY(5))
	}


}
function worldTargets() { //remove the map targets from the scene
	while (mapTargetArr.length != 0) {
		scene.remove(mapTargetArr.pop())
	}
}


function addTargets(position) { // places targets

	for (var i = 0; i < position.length; i++) {
		var target = new Targets(i, position[i][0], position[i][1], position[i][2]);
		TargetArr.push(target)
		scene.add(target.getCylinder())


	}

}
function init() { //initialise for a reset of level
removeTargets();
	addTargets([[8, 3, 5], [10, 6, 2], [3, 3, 3]]);
	hud.gamestate = 0;
	hud.currtargets = 0;
	playerBody.noBullets=totalammo;
	hud.updateAmmoCount(playerBody.noBullets);
	playerBody.velocity=new CANNON.Vec3(0,0,0)
	playerBody.position.copy(initposition)
	camera.position.copy(playerBody.position)
	camera.lookAt(0,5,0)
	playerBody.quaternion.copy(camera.quaternion)
	hud.setStartTime()
	
}
function removeTargets() { //remove all targets 
	while (TargetArr.length != 0) {
		scene.remove(TargetArr.pop().getCylinder())
	}
}