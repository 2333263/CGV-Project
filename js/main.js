import * as THREE from 'three';
import * as CANNON from 'cannon-es';

//Pass imports
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from "../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { BloomPass } from "../node_modules/three/examples/jsm/postprocessing/BloomPass.js"
import { ShaderPass } from "../node_modules/three/examples/jsm/postprocessing/ShaderPass.js"

//Shader imports
import { ToonShader1, ToonShader2 } from "../node_modules/three/examples/jsm/shaders/ToonShader.js"
import { DigitalGlitch } from "../node_modules/three/examples/jsm/shaders/DigitalGlitch.js"
import { BokehShader } from "../node_modules/three/examples/jsm/shaders/BokehShader.js"
import { FilmShader } from "../node_modules/three/examples/jsm/shaders/FilmShader.js"
import { FreiChenShader } from "../node_modules/three/examples/jsm/shaders/FreiChenShader.js"
import { ColorCorrectionShader } from "../node_modules/three/examples/jsm/shaders/ColorCorrectionShader.js"
import { SubsurfaceScatteringShader } from "../node_modules/three/examples/jsm/shaders/SubsurfaceScatteringShader.js"
import { MirrorShader } from "../node_modules/three/examples/jsm/shaders/MirrorShader.js"
import { GodRaysDepthMaskShader, GodRaysGenerateShader, GodRaysCombineShader, GodRaysFakeSunShader } from "../node_modules/three/examples/jsm/shaders/GodRaysShader.js"
import { Reflector } from "../node_modules/three/examples/jsm/objects/Reflector.js"
import { Refractor } from "../node_modules/three/examples/jsm/objects/Refractor.js"

//Custom Classes
import Stats from "stats";
import { PointerLockControls } from '../js/PointerLockControls.js';
import { HUD } from "../js/HUD.js"
import { Targets } from '../js/targets.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { BuildWorld} from '../js/BuildWorld.js'
import { POSTPROCESSINGPASSES } from '../js/PostProcessingPasses.js'
import { leaderBoard } from '../js/LeaderBoard.js';

const width = window.innerWidth + 20
const height = window.innerHeight + 20
var scene = new THREE.Scene();
const aspectRatio = width / height
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
const HudCamera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 30)
var sceneHUD = new THREE.Scene();
var frustumSize = 14;
var dt = 0;
var mirrorCam = new THREE.PerspectiveCamera(75, 2 / 3, 0.1, 1000)

//2*frustumSize, 2*-frustumSize , frustumSize , -frustumSize , 0, 10 
//(width-20)/(-2*frustumSize),(width-20)/(2*frustumSize),(height-20)/(2*frustumSize),(height-20)/(-2*frustumSize),1,1000 
const pipcamera = new THREE.OrthographicCamera(-frustumSize, frustumSize, frustumSize, -frustumSize, 1, 1000);
var Clock = new THREE.Clock(true)
const renderer = new THREE.WebGLRenderer();
renderer.antialias = true
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight);
renderer.setClearColor(0xADD8E6, 1)
document.body.appendChild(renderer.domElement);
const initposition = new CANNON.Vec3(0, 5, 4)
const raycaster = new THREE.Raycaster();
const loader = new THREE.TextureLoader();
const manager = new THREE.LoadingManager();
const timestep = 1 / 60

const TargetArr = [];
const mapTargetArr = [];
const TargetPos = [[20, 3, 20], [10, 6, 15], [20, 10, 3]]
const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -35, 0) //Middle value is gravity in the y direction 
});

const planeMaterial = new CANNON.Material({
	friction: 10,
	restitution: 0
})
addTargets(TargetPos); //adds targets to the target array and to the scene

const totalammo = parseInt(TargetArr.length * 1.5) //make total amo proportional to no targets 

var hud = new HUD(totalammo, totalammo, TargetArr.length, 0); //initialises the hud

var hudTexture = new THREE.Texture(hud.getCanvas()) //returns the canvas object to use as a texture

//hudTexture.repeat.set((width-20)/)
hudTexture.needsUpdate = true;
var hudMat = new THREE.MeshBasicMaterial({ map: hudTexture });
hudMat.transparent = true
var HudGeom = new THREE.BoxGeometry(width, height, 0)
var HudPlane = new THREE.Mesh(HudGeom, hudMat)
//HudPlane.material.depthTest = false;
HudPlane.material.depthWrite = false;
HudPlane.castShadow = false
HudPlane.onBeforeRender = function (renderer) {
	renderer.clearDepth();
}
sceneHUD.add(HudPlane)

var board = new leaderBoard();
board.addItem("f", -99)

const controls = new PointerLockControls(camera, document.body); //links controls to the camera

scene.add(controls.getObject());

let musicPlaying=false;
let backgroundmusic;
let gunsound;
const audioLoader = new THREE.AudioLoader();
function touchStarted() { 
	//audioLoader.resume();
	musicPlaying = true;
	//backgroundMusic();
	const listener = new THREE.AudioListener(); //a virtual listenr of all audio effects in scene
	camera.add(listener);

	//audio loader
	//create, load and play background music

	const backgroundSound = new THREE.Audio(listener);

	//load sound file
	audioLoader.load("js/GameMusic.mp3",function(buffer){
		
		backgroundSound.setBuffer( buffer );
		backgroundSound.setLoop( true );
		backgroundSound.setVolume(0.4);
		backgroundSound.play();

	});
	
  }
function gunshotSound(){
	const listener = new THREE.AudioListener(); //a virtual listenr of all audio effects in scene
	camera.add(listener);
	const gunsound = new THREE.Audio(listener);
	audioLoader.load("js/rifle.mp3",function (buffer){
		
		gunsound.setBuffer( buffer );
		gunsound.setLoop( false );
		gunsound.setVolume(0.4);
		gunsound.play();
	});
}


//CODE TO GET TOON/CELL SHADING WORKING_COLOR_SPACE
/*
const alphaIndex = 10
const colors = new Uint8Array(alphaIndex + 2);

for (let c = 0; c <= colors.length; c++) {

	colors[c] = (c / colors.length) * 256;
}
const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;
const gradientMap = new THREE.DataTexture(colors, colors.length, 1, format);
gradientMap.needsUpdate = true;

const toonMaterial = new THREE.MeshToonMaterial({
	color: new THREE.Color('#31A5E7'),
	gradientMap: gradientMap
})

scene.add(new THREE.Mesh(new THREE.SphereGeometry(2),toonMaterial))
*/

const mirrorGeo = new THREE.PlaneGeometry(3, 3);

scene.add(new Reflector(mirrorGeo, {
	clipBias: 0.003,
	textureWidth: 1920,
	textureHeight: 1080
}).translateY(1).translateX(1).translateZ(3))




//Add blender objects to scene and collisions to world
BuildWorld.loadLevel(scene, world, 1)

//To unload current world
//loadLevelWithCollision.unloadCurrentLevel(scene, world)


let pathStrings = ["bluecloud_ft.jpg", "bluecloud_bk.jpg", "bluecloud_up.jpg", "bluecloud_dn.jpg", "bluecloud_rt.jpg", "bluecloud_lf.jpg",]
function createMaterialArray() {
	const skyboxImagepaths = pathStrings;
	const materialArray = skyboxImagepaths.map(image => {
		let texture = new THREE.TextureLoader().load(image);
		return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
	});
	return materialArray;
} // this function maps over the array of images 
//returns a Three.js material

const materialArray = createMaterialArray()

const skybxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
const skybox = new THREE.Mesh(skybxGeo, materialArray);
scene.add(skybox);

const light = new THREE.HemisphereLight("white", "white", 0.5);
scene.add(light)

camera.position.z = 9; //initialise camera position
camera.position.y = 9;
pipcamera.position.set(0, 30, 0); // place top down camera at a height above the world 
pipcamera.rotateX(-Math.PI / 2) //rotate so that it is top down

const initcam = controls.getObject().quaternion // save camera rotation to be used in init function



// }

var Torso = new THREE.Object3D()
var playerModel = BuildWorld.buildPlayer();
Torso = playerModel.getObjectByName("torso")
playerModel.traverse(function(child){
	child.castShadow = true;
})


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




//scene.add( new THREE.CameraHelper( direcLight.shadow.camera ) );

playerBody.linearDamping = 0.9;

world.addBody(playerBody); //adds player body to the world





controls.addEventListener('lock', () => {
	controls.enabled = true;
})
controls.addEventListener('unlocked', () => {
	controls.enabled = false;
})

document.addEventListener("mousedown", (e) => {
	if (musicPlaying==false)
	{
		touchStarted()
	}
	else {gunshotSound()}
	
	if (controls.isLocked == true) {
		if (playerBody.noBullets > 0) { //if player has any bullets 
			playerBody.noBullets--; //decrement bullet count

			raycaster.setFromCamera(new THREE.Vector2(0, 0), controls.getObject()); // hit thing in line of sight of crosshair
			const intersects = raycaster.intersectObjects(scene.children);
			for (let j = 0; j < TargetArr.length; j++) {
				var i = 0
				while (Torso.children.includes(intersects[i].object)) {
					i++;
				}
				if (intersects[i].object == TargetArr[j].getCylinder() && TargetArr[j].isHit == false) { // only count if hit target and the target has not been already hit
					HitTarget(intersects[i].object.name)
					hud.increaseTarget();
				}
			}
			//renderer.readRenderTargetPixels(scene, camera)
			if (playerBody.noBullets == 0) {
				removeTargets();
			}
		}
		if (hud.gamestate == -1) // game fail
		{

			init();


		}
		else if (hud.gamestate == 1 && hud.entered == true) { //game win (only one level so just resets)
			removeTargets();

			init();
		}
	} else {
		controls.lock();
	}
})

const pressedKeys = {};


document.addEventListener("keydown", (e) => {
	if (controls.isLocked) {
		pressedKeys[e.key] = true;
	} else {
		if (e.key == "r") {
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
	playerBody.linearDamping = 0.9
	playerBody.angularDamping = 0.9
	//playerBody.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x))

	//playerBody.yawObject.rotation.y = camera.rotation.y;

	var tempVec = new THREE.Vector3(0, 0, 0);
	var delta = dt * 1000
	delta *= 0.1
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
				playerBody.velocity.y = 15
				//	playerBody.applyLocalImpulse(0,20*delta,0)
			}
			playerBody.canJump = false
		}

	}

	//playerBody.quaternion.copy(camera.quaternion)
	tempVec.applyQuaternion(controls.getObject().quaternion);
	playerBody.velocity.x += tempVec.x
	playerBody.velocity.z += tempVec.z
	controls.getObject().position.copy(playerBody.position);
	//	camera.quaternion.copy(playerBody.quaternion)
	pipcamera.position.x = (playerBody.position.x);
	pipcamera.position.z = (playerBody.position.z);

}






//----------------------------------------------------------------
//Stats for fps
var stats = new Stats();
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
//----------------------------------------------------------------


function animate() {
	stats.begin() //For monitoring

	//direcLight.translateX(-0.01)
	if (controls.isLocked) {
		hud.isPaused(false);
		if (playerModel.position.y < -25) { init(); } // if player out of bounds, reset level
		playerModel.position.copy(playerBody.position);
		
		var tempVec = new THREE.Vector3();
		controls.getObject().getWorldDirection(tempVec)
		//Get angle player is facing through arctan
		var theta = Math.atan2(tempVec.x, tempVec.z);
		var xz = Math.sqrt(Math.pow(tempVec.x,2)+Math.pow(tempVec.z,2))
		var thetaArm = Math.atan2(xz, tempVec.y);

		playerModel.translateY(-0.2)
		playerModel.rotation.set(0, theta , 0)

		playerModel.getObjectByName('armRightPivot').rotation.set(thetaArm+Math.PI, 0, 0)
		//playerModel.getObjectByName('armLeftPivot').rotation.set(thetaArm+Math.PI, 0, -Math.PI/4)
		playerModel.translateZ(-0.30)

		dt = Clock.getDelta()
		if (hud.gamestate == 0)
			move();
		var pos = new THREE.Vector3()
		pos.copy(playerBody.position)
		pos.y+=0.7
		controls.getObject().position.copy(pos);
		hud.updateAmmoCount(playerBody.noBullets)
		hud.draw();
		hudTexture.needsUpdate = true;
		moveTargets()
		world.step(timestep, dt);

	}
	else {
		hud.isPaused(true);
		hud.draw();
		hudTexture.needsUpdate = true;

	}

	renderWorld()

	stats.end() //For monitoring
	requestAnimationFrame(animate);

};


//Generate main directional lighting for the world
const mainLight = new THREE.DirectionalLight(0xffe3b1);
{
	mainLight.castShadow = true;
	//mainLight.shadow.radius = 3;
	mainLight.shadow.bias = 0.0000125 * 2;
	//TODO Add variable shadowMap size
	mainLight.shadow.mapSize.width = mainLight.shadow.mapSize.height = 1024 * 4;
	mainLight.position.set(1.5, 2.75, 1.5);
	mainLight.position.multiplyScalar(50);
	var temp = 40
	mainLight.shadow.camera.top = 50;
	mainLight.shadow.camera.bottom = -30;
	mainLight.shadow.camera.left = -20;
	mainLight.shadow.camera.right = 100;
	mainLight.shadow.camera.near = 0;
	mainLight.shadow.camera.far = 1000;
	//scene.add( new THREE.CameraHelper( mainLight.shadow.camera ) );
}
scene.add(mainLight)


//Post Proccessing
const composer = POSTPROCESSINGPASSES.doPasses(renderer, controls.getObject(), scene, mainLight)



animate();


function renderWorld() {
	//player=scene.getObjectByName("player")
	//scene.remove(player)
	var port = new THREE.Vector4(0, 0, 0, 0)
	renderer.getViewport(port)
	renderer.autoClear = false;
	renderer.clear();
	//Render with composer for post processing
	composer.render()
	//renderer.render(scene, controls.getObject())
	mapTargets();
	renderer.clearDepth();
	renderer.setViewport(width - 250, 50, 200, 200)
	mainLight.castShadow = false;
	scene.add(playerModel)
	renderer.render(scene, pipcamera);
	worldTargets();
	mainLight.castShadow = true;
	renderer.setViewport(port);
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

function moveTargets() {
	for (var i = 0; i < TargetArr.length; i++) {
		if (TargetArr[i].moves == true) {
			var tempPos = new THREE.Vector3()
			tempPos.copy(TargetArr[i].getCylinder().position)
			tempPos.x = tempPos.x.toFixed(2)
			tempPos.y = tempPos.y.toFixed(2)
			tempPos.z = tempPos.z.toFixed(2)
			var tempEnd = new THREE.Vector3()
			tempEnd.copy(TargetArr[i].endPoint)
			tempEnd.x = tempEnd.x.toFixed(2)
			tempEnd.y = tempEnd.y.toFixed(2)
			tempEnd.z = tempEnd.z.toFixed(2)
			var tempStart = new THREE.Vector3()
			tempStart.copy(TargetArr[i].startPoint)
			tempStart.x = tempStart.x.toFixed(2)
			tempStart.y = tempStart.y.toFixed(2)
			tempStart.z = tempStart.z.toFixed(2)
			if (!tempPos.equals(tempEnd) && TargetArr[i].moveZ == true) {
				TargetArr[i].getCylinder().translateZ(0.01)
			} else if (tempPos.equals(tempEnd) && TargetArr[i].moveZ == true) {
				TargetArr[i].moveZ = false
				TargetArr[i].getCylinder().translateZ(-0.01)
			} else if (TargetArr[i].moveZ == false && !tempPos.equals(tempStart)) {
				TargetArr[i].getCylinder().translateZ(-0.01)

			} else {
				TargetArr[i].getCylinder().translateZ(0.01)
				TargetArr[i].moveZ = true
			}
		}
	}
}



function addTargets(position) { // places targets

	for (var i = 0; i < position.length; i++) {
		var target = new Targets(i, position[i][0], position[i][1], position[i][2], new THREE.Vector3(position[i][0] + 5, position[i][1], position[i][2]));
		target.moves = true
		TargetArr.push(target)
		scene.add(target.getCylinder())


	}

}
function init() { //initialise for a reset of level
	removeTargets();
	addTargets(TargetPos);
	hud.gamestate = 0;
	hud.currtargets = 0;
	playerBody.noBullets = totalammo;
	playerBody.canJump = false
	hud.updateAmmoCount(playerBody.noBullets);
	playerBody.velocity = new CANNON.Vec3(0, 0, 0)
	playerBody.position.copy(initposition)
	controls.getObject().position.copy(playerBody.position)
	controls.getObject().lookAt(0, 5, 0)
	playerBody.quaternion.copy(controls.getObject().quaternion)
	hud.setStartTime()

}
function removeTargets() { //remove all targets 
	while (TargetArr.length != 0) {
		scene.remove(TargetArr.pop().getCylinder())
	}
}