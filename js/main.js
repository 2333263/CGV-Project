import * as THREE from 'three';
import * as CANNON from 'cannon-es';


//Custom Classes
import Stats from "stats";
import { SPARK } from '../js/Spark.js';
import { PointerLockControls } from '../js/PointerLockControls.js';
import { HUD } from "../js/HUD.js";
import { Targets } from '../js/targets.js';
//import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js'; (unused currently)
import { BuildWorld } from '../js/BuildWorld.js';
import { POSTPROCESSINGPASSES } from '../js/PostProcessingPasses.js';
import { leaderBoard } from '../js/LeaderBoard.js'; //(unused currently)
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { MainMenu } from '/js/mainMenu.js';
import { musicHandler } from './MusicHandler.js';
//import { dynamicSky } from '/js/dynamicSky.js';

//View Init
const width = window.innerWidth + 20;
const height = window.innerHeight + 20;
var scene = new THREE.Scene();
const aspectRatio = width / height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 500);
const HudCamera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 30);
var sceneHUD = new THREE.Scene();
var frustumSize = 14;
var dt = 0;
var menu = true;
const Menucamera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 500);
const pipcamera = new THREE.OrthographicCamera(-frustumSize, frustumSize, frustumSize, -frustumSize, 1, 1000);
var Clock = new THREE.Clock(true);
const renderer = new THREE.WebGLRenderer();
renderer.toneMapping = THREE.CineonToneMapping;
renderer.antialias = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight);
renderer.setClearColor(0xADD8E6, 1);
document.body.appendChild(renderer.domElement);
const initposition = new CANNON.Vec3(0, 5, 4);
const raycaster = new THREE.Raycaster();

//Raycast must not hit lines
raycaster.params.Line.threshold = 0.01
const timestep = 1 / 60;

/*
// Refractor object test
const refractorGeo = new THREE.PlaneGeometry(3,3);

// const refractor = new Refractor(refractorGeo,{
// 	shader: WaterRefractionShader
// });

const refractorMat = new THREE.MeshPhysicalMaterial({
	roughness: 0.1,   
	transmission: 1,  
	thickness: 3,
	reflectivity : 0.5
})

const frostedGlass = new THREE.Mesh(refractorGeo, refractorMat)
frostedGlass.position.set( 3, 1, 0 );

scene.add(frostedGlass);
*/

//Canon world Init
const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -35, 0) //Middle value is gravity in the y direction 
});

//Plane material Init from Canon
const planeMaterial = new CANNON.Material({
	friction: 10,
	restitution: 0
});

//Controls Init
const controls = new PointerLockControls(camera, document.body);
const orbitControls = new OrbitControls(Menucamera, renderer.domElement);
Menucamera.position.set(0, 30, 30);
orbitControls.target.set(30.5453, 0, -32.0482);
orbitControls.autoRotate = true;
orbitControls.dispose();
orbitControls.update();

//Music Init
var backgroundmusic=new musicHandler(controls.getObject())
backgroundmusic.init(backgroundmusic.backgroundSound);
let gunsound;
const audioLoader = new THREE.AudioLoader();

//Audio Loader

//Gunshot sound Init
function gunshotSound() {
	const listener = new THREE.AudioListener(); //a virtual listener of all audio effects in scene
	controls.getObject().add(listener);
	const gunsound = new THREE.Audio(listener);
	audioLoader.load("js/rifle.mp3", function (buffer) {
		gunsound.setBuffer(buffer);
		gunsound.setLoop(false);
		gunsound.setVolume(0.1);
		gunsound.play();
	});
};

/**#############DEPRECATED###########
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
**/

//Skybox Init
//let pathStrings = 
// 	["../Objects/Textures/Skybox/bluecloud_ft.jpg", "../Objects/Textures/Skybox/bluecloud_bk.jpg",
//	 "../Objects/Textures/Skybox/bluecloud_up.jpg", "../Objects/Textures/Skybox/bluecloud_dn.jpg",
//	 "../Objects/Textures/Skybox/bluecloud_rt.jpg", "../Objects/Textures/Skybox/bluecloud_lf.jpg"];
const skybox=new THREE.Mesh();
function drawSkyBox(level)
{
	console.log("Drawing skybox")
	let pathStrings
	if(level==1){
	pathStrings = ["../Objects/Textures/Skybox/blueskyimg.png", "../Objects/Textures/Skybox/blueskyimg.png",
	"../Objects/Textures/Skybox/blueskyimg.png", "../Objects/Textures/Skybox/blueskyimg.png",
	"../Objects/Textures/Skybox/blueskyimg.png", "../Objects/Textures/Skybox/blueskyimg.png"]
	}
	if(level==2){
		pathStrings = ["../Objects/Textures/Skybox/nightskyemission.png", "../Objects/Textures/Skybox/nightskyemission.png",
		"../Objects/Textures/Skybox/nightskyemission.png", "../Objects/Textures/Skybox/nightskyemission.png",
		"../Objects/Textures/Skybox/nightskyemission.png", "../Objects/Textures/Skybox/nightskyemission.png"]
	}
	
//This function maps over the array of images, skybox related
	function createMaterialArray() {
		const skyboxImagepaths = pathStrings;
		const materialArray = skyboxImagepaths.map(image => {
			let texture = new THREE.TextureLoader().load(image);
			return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
		});
		return materialArray;
	}

	//Returns a Three.js material
	const materialArray = createMaterialArray();

	//Smaller skybox that follows the player (thanks-jamin)
	const skybxGeo = new THREE.BoxGeometry(380, 380, 380);
	const skybox = new THREE.Mesh(skybxGeo, materialArray);
	scene.add(skybox);
	}


//Let there be light
const light = new THREE.HemisphereLight("white", "white", 0.5);
scene.add(light);

//Camera and Position Init
camera.position.z = 9; //initialise camera position
camera.position.y = 9;
pipcamera.position.set(0, 30, 0); // place top down camera at a height above the world 
pipcamera.rotateX(-Math.PI / 2) //rotate so that it is top down
const initcam = controls.getObject().quaternion // save camera rotation to be used in init function


//Player model done in THREE so no need for callback (gun model is irrelevant to following code)
var Torso = new THREE.Object3D();
var playerModel = BuildWorld.buildPlayer();
Torso = playerModel.getObjectByName("torso");
playerModel.traverse(function (child) {
	child.castShadow = true;
});

//Hitbox Init
const playerShape = new CANNON.Sphere(1.5);
const playerBody = new CANNON.Body({ //player hitbox represented by sphere for easy movement
	mass: 5,
	shape: playerShape,
	position: initposition,
	quaternion: new THREE.Quaternion(),
	material: planeMaterial //to add friction 
});

//Canon vector ting
const contNorm = new CANNON.Vec3()
const upAxis = new CANNON.Vec3(0, 1, 0);
playerBody.addEventListener('collide', (event) => {
	const { contact } = event
	if (contact.bi.id == playerBody.id) {
		contact.ni.negate(contNorm);
	}
	else {
		contNorm.copy(contact.ni);
	}
	if (contNorm.dot(upAxis) > 0.5) {
		playerBody.canJump = true;
	}
});

//I swear if I need to put another semi-colon in here for y'all im going to break your hands
playerBody.linearDamping = 0.9;
world.addBody(playerBody); //adds player body to the world

//Generate main directional lighting for the world
const mainLight = new THREE.DirectionalLight(0xffe3b1);
//Evil brackets
{
	mainLight.castShadow = true;
	mainLight.shadow.bias = 0.0000125 * 2;
	//TODO Add variable shadowMap size
	mainLight.shadow.mapSize.width = mainLight.shadow.mapSize.height = 1024 * 5;
	mainLight.position.set(1.5, 2.75, 1.5);
	mainLight.position.multiplyScalar(50);
	var temp = 40;
	mainLight.shadow.camera.top = 50;
	mainLight.shadow.camera.bottom = -50;
	mainLight.shadow.camera.left = -20;
	mainLight.shadow.camera.right = 105;
	mainLight.shadow.camera.near = 0;
	mainLight.shadow.camera.far = 1000;
};
scene.add(mainLight);

//Stats for fps
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

//Add blender objects to scene and collisions to world
//Use callback to ensure level is loaded
var composer;
var composerMenu;

//Init target arrays
var TargetArr = [];
var mapTargetArr = [];
var TargetPos = [];
var TargetQuat = [];

//Init hud attributes
var totalammo;
var hud;
var hudTexture;

//array of bullet trails
var lines = [];

//array of bullet sparks
var sparks = [];

//Array of clouds for dynamic skybox
var clouds = [];

//Menu Init
var menuScene = new THREE.Scene();
var homeScreen = new MainMenu();
homeScreen.draw();
var MenuTexture = new THREE.Texture(homeScreen.getMenu());
MenuTexture.needsUpdate = true;
var MenuMat = new THREE.MeshBasicMaterial({ map: MenuTexture });
MenuMat.transparent = true;
var menuGeom = new THREE.BoxGeometry(width, height, 0);
var MenuPlane = new THREE.Mesh(menuGeom, MenuMat);
MenuPlane.material.depthWrite = false;
menuScene.add(MenuPlane);

//Mesh of the end of the gun (for use in bullet trails)
var gunEnd

//Load level 1
var currentWorld = 1;
BuildWorld.loadLevel(scene, world, currentWorld, function () {
	afterLoad();
});

//WORLD BUILDER THE ANTITHESIS TO JORMUNGANDR
function afterLoad() {
	
	// --------------------------------------------------------------------------------------------------------------------------------------------------------
	// EVERYTHING REQUIRING THE LEVELS IN THE SCENE MUST BE PUT INTO THIS FUNCTION NB!! 
	// --------------------------------------------------------------------------------------------------------------------------------------------------------

	//Adds the gun model to scene. Done in here to ensure model is loaded 
	BuildWorld.addGun(playerModel)

	//Get all objects that should have high selective bloom applied, i.e. glowing
	const glowing = BuildWorld.getGlowing();

	//creates object for calling methods related to dynamic skybox...to be implemented later

	
	


	//Set up the main composer for the scene using preset post processing
	composer = POSTPROCESSINGPASSES.doPasses(renderer, controls.getObject(), scene, mainLight)

	//Do selective bloom (mainly for the the lights and muzzle flash). Simply addes another pass to the composer and returns it
	composer = POSTPROCESSINGPASSES.selectiveBloomPass(composer, controls.getObject(), scene, glowing)

	//Add post processing to orbital camera
	composerMenu = POSTPROCESSINGPASSES.doPasses(renderer, Menucamera, scene, mainLight)

	//Get the array of stationary targets as a mesh
	const targetArrayMeshStill = BuildWorld.getTargetsStill()

	//Clean target arrays (for reloading)
	removeTargets()
	TargetPos = [];
	TargetQuat = [];
	TargetArr = [];
	mapTargetArr = [];
	//For loop :)
	for (const tarMesh of targetArrayMeshStill) {
		const x = tarMesh.position.x
		const y = tarMesh.position.y
		const z = tarMesh.position.z
		const targetPosition = tarMesh.position;
		TargetPos.push(targetPosition);
		const targetQuaterion = tarMesh.quaternion;
		TargetQuat.push(targetQuaterion);
	}
	//TargetPos = targetStillPos

	//Send positions to addTargets func
	//console.log(TargetPos, TargetQuat) //TESTING
	addTargets(TargetPos, TargetQuat);

	//Make total amo proportional to no targets 
	totalammo = parseInt(TargetArr.length * 1.5)

	//Create hud with target information

	//initialises the hud
	hud = new HUD(totalammo, totalammo, TargetArr.length, 0);

	//returns the canvas object to use as a texture
	hudTexture = new THREE.Texture(hud.getCanvas())
	hudTexture.needsUpdate = true;

	//Create hud mesh
	var hudMat = new THREE.MeshBasicMaterial({ map: hudTexture });
	hudMat.transparent = true
	var HudGeom = new THREE.BoxGeometry(width, height, 0)
	var HudPlane = new THREE.Mesh(HudGeom, hudMat)

	//Change hud attrubuts to not interfere with main renderer/scene
	HudPlane.material.depthWrite = false;
	HudPlane.castShadow = false
	HudPlane.onBeforeRender = function (renderer) {
		renderer.clearDepth();
	}

	//Add hud to separate hud scene
	sceneHUD.add(HudPlane)

	//Adjust player body attributes to match hud
	playerBody.noBullets = hud.currammo
	playerBody.canJump = false;

	//Assign mesh to gunEnd after cleaning object
	gunEnd = null;
	gunEnd = BuildWorld.getMuzzleFlashMesh()

	//Assign clouds after cleaning array
	clouds = []
	clouds = BuildWorld.getClouds();

	//calls the method to draw the level's skybox (day)
	if(currentWorld==1){
		drawSkyBox(1)
	}
	//calls the method to draw the level's skybox (night)
	if(currentWorld==2){
		drawSkyBox(2)
	}

	//Run game
	animate();
}

//To unload current world
//BuildWorld.unloadCurrentLevel(scene, world)

//Used to stop animation for level loads
var animationID;
/**
 * Function that runs the game
 */
function animate() {
	stats.begin()
	//console.log(hud.startTime) //For monitoring
	if (menu == true) {//if we're in the menu
		orbitControls.update()//rotate around the world
		composerMenu.render()
		homeScreen.draw()//draw the main menu

		//Make skybox follow orbital camera to make the distance to the skybox look infinite
		skybox.position.copy(orbitControls.object.position)

		//Code to make it look like only the level is rotating (stops skybox rotation)
		// var tempVec = new THREE.Vector3();
		// orbitControls.object.getWorldDirection(tempVec)
		// var theta = Math.atan2(tempVec.x, tempVec.z);
		// skybox.rotation.set(0, theta , 0)

		MenuTexture.needsUpdate = true//update main menu
		renderer.render(menuScene, HudCamera)//render the main menu
		if(homeScreen.Music==true){
			backgroundmusic.play()
		}else{
			backgroundmusic.pause()
		}
	}
	else {
		//direcLight.translateX(-0.01)
		if (controls.isLocked) {
			hud.isPaused(false);
			if (playerModel.position.y < -25) { init(); } // if player out of bounds, reset level
			playerModel.position.copy(playerBody.position);

			//Make skybox follow player to make the distance to the skybox look infinite
			skybox.position.copy(playerBody.position)

			//make clouds move
			let cloud1 = clouds[0]
			//console.log(clouds.length)
			for (let i = 0; i < clouds.length; i = i + 2) {
				clouds[i].position.x += 0.09
				clouds[i].position.z += 0.05
			}
			for (let i = 1; i < clouds.length; i = i + 2) {
				clouds[i].position.x += 0.05
				clouds[i].position.z += 0.09
			}

			var tempVec = new THREE.Vector3();
			controls.getObject().getWorldDirection(tempVec)

			//Get angle player is facing through arctan
			var theta = Math.atan2(tempVec.x, tempVec.z);
			var xz = Math.sqrt(Math.pow(tempVec.x, 2) + Math.pow(tempVec.z, 2))
			var thetaArm = Math.atan2(xz, tempVec.y);

			playerModel.translateY(-0.2)
			playerModel.rotation.set(0, theta, 0)

			playerModel.getObjectByName('armRightPivot').rotation.set(thetaArm + Math.PI, 0, 0)
			playerModel.translateZ(-0.30)

			if (lines.length > 0) {
				handleTrails();
			}
			if (sparks.length > 0) {
				handleSparks();
			}


			dt = Clock.getDelta()
			if (hud.gamestate == 0)
				move();
			var pos = new THREE.Vector3()
			pos.copy(playerBody.position)
			pos.y += 0.7
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
		
	}
	stats.end() //For monitoring
	animationID = requestAnimationFrame(animate);
};

//Render func
function renderWorld() {
	var port = new THREE.Vector4(0, 0, 0, 0)
	renderer.getViewport(port)
	renderer.autoClear = false;
	renderer.clear();
	//Render with composer for post processing
	composer.render()
	mapTargets();
	renderer.clearDepth();
	renderer.setViewport(width - 250, 50, 200, 200)
	mainLight.castShadow = false;
	BuildWorld.turnOffLightShadow()
	renderer.render(scene, pipcamera);
	worldTargets();
	mainLight.castShadow = true;
	BuildWorld.turnOnLightShadow()
	renderer.setViewport(port);
	renderer.render(sceneHUD, HudCamera)
};

//Rotates targets for appearance on the map camera
function mapTargets() {
	for (var i = 0; i < TargetArr.length; i++) {
		var tempCylinder = new THREE.Mesh(TargetArr[i].getCylinder().geometry, TargetArr[i].getCylinder().material)
		tempCylinder.position.copy(TargetArr[i].getCylinder().position)
		mapTargetArr.push(tempCylinder)
		scene.add(tempCylinder.rotateY(Math.PI / 2).translateY(20))
	}
};

//Remove the map targets from the scene
function worldTargets() {
	while (mapTargetArr.length != 0) {
		scene.remove(mapTargetArr.pop());
	}
};

//Moves the targets in the scene
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
init
			} else {
				TargetArr[i].getCylinder().translateZ(0.01)
				TargetArr[i].moveZ = true
			}
		}
	}
};

/**
 * Function to add the targets to the scene
 * @param {THREE.Vector3} position 
 * @param {THREE.Quaternion} quaternion 
 */
function addTargets(position, quaternion) {
	for (var i = 0; i < position.length; i++) {
		var target = new Targets(i, position[i], quaternion[i], new THREE.Vector3(position[i].x + 5, position[i].y, position[i].z));
		target.moves = false;
		TargetArr.push(target);
		scene.add(target.getCylinder());
	}
};

//Init for level reset
function init() {
	for (const line of lines) {
		scene.remove(line[0])
	}
	hud.setStartTime()
	hudTexture.needsUpdate = true
	removeTargets();
	addTargets(TargetPos, TargetQuat);
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
};

//Remove all targets from scene
function removeTargets() {
	while (TargetArr.length != 0) {
		scene.remove(TargetArr.pop().getCylinder())
	}
};

//Event listener for lock
controls.addEventListener('lock', () => {
	controls.enabled = true;
});

//Event listener for unlock
controls.addEventListener('unlocked', () => {
	controls.enabled = false;
});

//Mouse-up event listener
document.addEventListener("mouseup", (e) => {
	//Remove muzzle flash on mouse up
	scene.getObjectByName('muzzleFlash').visible = false;
});




//Mouse-down event listener
document.addEventListener("mousedown", (e) => {
	if (e.button == 0) {
		if (controls.isLocked == true) {
			if (playerBody.noBullets > 0) { //if player has any bullets 
				playerBody.noBullets--; //decrement bullet count
				if(homeScreen.soundEffects){
					gunshotSound()
				}
				scene.getObjectByName('muzzleFlash').visible = true; //Add muzzle flash on shoot
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

				//Bullet trail stuff	
				var i = 0
				while (Torso.children.includes(intersects[i].object) && lines.includes(intersects[i].object)) {
					i++;
				}
				const gunEndPos = new THREE.Vector3();
				gunEnd.getWorldPosition(gunEndPos);

				const points = []
				points.push(gunEndPos)
				points.push(intersects[i].point.clone())
				const geometry = new THREE.BufferGeometry().setFromPoints(points)
				const line = new THREE.LineSegments(
					geometry,
					new THREE.LineBasicMaterial({
						color: 0xffffff,
						transparent: true,
						opacity: 1,
						linewidth: 2
						// depthTest: false,
						// depthWrite: false
					})
				)

				let d = new Date();
				let sec = d.getSeconds() + d.getMilliseconds() / 1000;
				let min = d.getMinutes() + sec / 60;
				let creationTime = d.getHours() + min / 60;
				creationTime *= 60 * 60;
				// [Line, age of line]
				lines.push([line, creationTime])
				scene.add(line);
				const spark = new SPARK(intersects[i].point.clone(), creationTime, scene);
				sparks.push(spark);

			}
			if (hud.gamestate == -1) { //Game failed

				init();
			}
			else if (hud.gamestate == 1 && hud.entered == true) { //game win (only one level so just resets)

				removeTargets();
				//Check that there is a next level to load, otherwise init
				if (currentWorld < 3) {
					//Code to swap levels
					BuildWorld.unloadCurrentLevel(scene, world)
					cancelAnimationFrame(animationID);
					currentWorld++
					BuildWorld.loadLevel(scene, world, currentWorld, function () {
						afterLoad();
					});
				}
				init(); // Important for playe reset
			}
		}
		else {
			if (menu == true) {
				var ButtonClicked = homeScreen.Clicked(e.clientX, e.clientY)
				if (ButtonClicked == 0) {
					hud.setStartTime()
					scene.add(playerModel)
					scene.add(controls.getObject());
					controls.lock();
					menu = false
				}
			}
			else {
				controls.lock();
				menu = false
			}
		}
	}
});

//Keys pressed container
const pressedKeys = {};

//Keydown event listener
document.addEventListener("keydown", (e) => {
	if (controls.isLocked) {
		pressedKeys[e.key] = true;
	} else {
		if (e.key == "r") {

			init();
		}
		if (e.key == "m") {
			init()
			menu = true
			scene.remove(playerModel)
			scene.remove(controls.getObject())
		}
	}
});

//Keyup event listener
document.addEventListener("keyup", (e) => {
	pressedKeys[e.key] = false;
});

//Target hit logic
function HitTarget(name) {
	TargetArr[parseInt(name)].hit();
};

//Movement logic
function move() {
	playerBody.linearDamping = 0.9
	playerBody.angularDamping = 0.9
	var tempVec = new THREE.Vector3(0, 0, 0);
	var delta = dt * 1000
	delta *= 0.1
	if (controls.isLocked) {
		if(homeScreen.controls){
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
				playerBody.velocity.y = 15
			}
			playerBody.canJump = false
		}
	}else{
		if (pressedKeys["ArrowUp"]) {
			tempVec.z = -0.4 * delta
		}
		if (pressedKeys['ArrowLeft']) {
			tempVec.x = -0.4 * delta
		}
		if (pressedKeys["ArrowRight"]) {
			tempVec.x = 0.4 * delta
		}
		if (pressedKeys['ArrowDown']) {
			tempVec.z = 0.4 * delta
		}
		if (pressedKeys["Control"]) {
			if (playerBody.canJump == true) {
				playerBody.velocity.y = 15
			}
			playerBody.canJump = false
		}
	}
		
	}
	tempVec.applyQuaternion(controls.getObject().quaternion);
	playerBody.velocity.x += tempVec.x
	playerBody.velocity.z += tempVec.z
	controls.getObject().position.copy(playerBody.position);
	pipcamera.position.x = (playerBody.position.x);
	pipcamera.position.z = (playerBody.position.z);
};

function handleTrails() {
	var trailTime = 1
	var d = new Date();
	var sec = d.getSeconds() + d.getMilliseconds() / 1000;
	var min = d.getMinutes() + sec / 60;
	var currentTimeSec = d.getHours() + min / 60;
	currentTimeSec *= 60 * 60;

	for (const i of lines) {

		i[0].material.opacity = 1 / ((currentTimeSec - i[1]) * trailTime * 5)
	}

	if (currentTimeSec - lines[0][1] >= trailTime) {
		scene.remove(lines[0][0]);
		lines.shift()
	}
	//console.log(lines[0][1] - currentTimeSec);

}

function handleSparks() {
	var sparklife = 0.2 //Distance spark will travel
	var d = new Date();
	var sec = d.getSeconds() + d.getMilliseconds() / 1000;
	var min = d.getMinutes() + sec / 60;
	var currentTimeSec = d.getHours() + min / 60;
	currentTimeSec *= 60 * 60;

	for (const i of sparks) {
		i.updatePos(currentTimeSec);
	}

	if (currentTimeSec - sparks[0].getCreateTime() >= sparklife) {
		sparks[0].delete();
		var temp = sparks.shift();
	}

}