import * as THREE from 'three';
import * as CANNON from 'cannon-es';


//Custom Classes
import Stats from "stats";
import { SPARK } from '../js/Spark.js';
import { PointerLockControls } from '../Dependencies/PointerLockControls.js';
import { HUD } from "../js/HUD.js";
import { LoadingScreen }  from "../js/LoadingScreen.js" ;
import { Targets } from '../js/targets.js';
import { BuildWorld } from '../js/BuildWorld.js';
import { POSTPROCESSINGPASSES } from '../js/PostProcessingPasses.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { MainMenu } from '/js/mainMenu.js';
import { musicHandler } from './MusicHandler.js';

//View Init
const width = window.innerWidth + 20;
const height = window.innerHeight + 20;
var scene = new THREE.Scene();
const aspectRatio = width / height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 6000);
const HudCamera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 30);
var sceneHUD = new THREE.Scene();
var frustumSize = 14;
var dt = 0;
var menu = true;
const Menucamera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 2000);
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
var rolled = false
var gameWon = false
var changeLevel = false
var gameFailed = false
//Raycast must not hit lines
raycaster.params.Line.threshold = 0.01
const timestep = 1 / 60;

//flash Init
let flash = new THREE.PointLight();
//cloud init
let cloudMeshArr = new Array;
const rainGeo = new THREE.BufferGeometry()
let rain = new THREE.Points();
const rainInit = [32, 200, -32];
let counter = 0;

const Load= new LoadingScreen()
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
controls.minPolarAngle = 0.1
controls.maxPolarAngle = Math.PI - 0.1
const orbitControls = new OrbitControls(Menucamera, renderer.domElement);
Menucamera.position.set(0, 30, 30);
orbitControls.target.set(30.5453, 0, -32.0482);
orbitControls.autoRotate = true;
orbitControls.dispose();
orbitControls.update();

//Music Init
var banana = false
var backgroundmusic = new musicHandler(controls.getObject())
let gunsound;
const audioLoader = new THREE.AudioLoader();


const RainListener = new THREE.AudioListener(); //a virtual listener of all audio effects in scene
RainListener.name = "RainListener"
controls.getObject().add(RainListener);
const RainSound = new THREE.Audio(RainListener);
RainSound.name = "rain"
audioLoader.load(filePath+"Sound Effects/soft-rain-ambient.mp3", function (buffer) {
	RainSound.setBuffer(buffer);
	RainSound.setLoop(false);
	RainSound.setVolume(0.7);
});


const ThunderListner = new THREE.AudioListener(); //a virtual listener of all audio effects in scene
ThunderListner.name = "thunderSound"
controls.getObject().add(ThunderListner);
const ThunderSound = new THREE.Audio(ThunderListner);
audioLoader.load(filePath+"Sound Effects/thunder.mp3", function (buffer) {
	ThunderSound.setBuffer(buffer);
	ThunderSound.setLoop(false);
	ThunderSound.setVolume(0.5);

});

//Audio Loader
/**
 * gunshotSound
 * Method plays the given sound when the gun is shot
 * @param {String} Sound the url of the sound it needs to play
 */

//Gunshot sound Init
function gunshotSound(Sound) {

	const listener = new THREE.AudioListener(); //a virtual listener of all audio effects in scene
	controls.getObject().add(listener);
	const gunsound = new THREE.Audio(listener);
	audioLoader.load(Sound, function (buffer) {
		gunsound.setBuffer(buffer);
		gunsound.setLoop(false);
		if (banana) {
			gunsound.setVolume(0.9);
		} else {
			gunsound.setVolume(0.4);
		}
		gunsound.play();
	});
};

/**
 * rainSound
 * play or pause the rain sound
 * @param {int} control pause or play the sound 
 */
function rainSound(control) {

	if (control == 1) {
		RainSound.play();
	}
	if (control == 0) {
		RainSound.pause();
	}
};
/**
 * thunderSound
 * randomizes pitch and plays thunder or stops the sound from playing
 * @param {int} control pause or play the thunder sound
 */
function thunderSound(control) {
	if (control == 1) {
		if (ThunderSound.isPlaying == false) {
			ThunderSound.play()
		} else {
			ThunderSound.stop()
			ThunderSound.detune = Math.floor(-100 + 1000 * Math.random()); //varies the pitch of the same thunder audio file
			ThunderSound.offset = 2 //natural delay for sound from electrostatic discharge to reach player
			ThunderSound.play()
		}

	} else {
		ThunderSound.pause()
	}
}
//init door moving variables
var doorMovingBool = false;
var doorMovingStartTime;


//Skybox Init
var skybox;
/**
 * drawSkyBox
 * changes and loads the skybox for the level the player is on
 * @param {integer} level the current level the player is are
 */
function drawSkyBox(level) {
	scene.remove(skybox)
	let pathStrings
	if (level == 1) {
		pathStrings = [filePath+"Textures/Skybox/blueskyimg.png", filePath+"Textures/Skybox/blueskyimg.png",
			filePath+"Textures/Skybox/blueskyimg.png", filePath+"Textures/Skybox/blueskyimg.png",
			filePath+"Textures/Skybox/blueskyimg.png", filePath+"Textures/Skybox/blueskyimg.png"]
	}
	if (level == 3) {
		pathStrings = [filePath+"Textures/Skybox/dark-blue-sky.jpg", filePath+"Textures/Skybox/dark-blue-sky.jpg",
			filePath+"Textures/Skybox/dark-blue-sky.jpg", filePath+"Textures/Skybox/dark-blue-sky.jpg",
			filePath+"Textures/Skybox/dark-blue-sky.jpg", filePath+"Textures/Skybox/dark-blue-sky.jpg"]
	}
	if (level == 2) {
		pathStrings = [filePath+"Textures/Skybox/level3 Skybox/GradientSky-01.png", filePath+"Textures/Skybox/level3 Skybox/GradientSky-01.png",
			filePath+"Textures/Skybox/level3 Skybox/BlueTop.png", filePath+"Textures/Skybox/level3 Skybox/GradientSky-01.png",
			filePath+"Textures/Skybox/level3 Skybox/GradientSky-01.png", filePath+"Textures/Skybox/level3 Skybox/GradientSky-01.png"]
	}


	//This function maps over the array of images, skybox related
	/**
	 * createMaterialArray
	 * maps the textures to each face of the skybox
	 * @returns {THREE.MeshBasicMaterial} material array
	 */
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
	const skybxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
	skybox = new THREE.Mesh(skybxGeo, materialArray);
	scene.add(skybox);
}

//storm clouds
/**
 * stormSky
 * creates the storm cloud effect
 * creates the light called flash
 * creates the raindrops
 */
function stormSky() {
	let loader = new THREE.TextureLoader();
	let cloudGeo = new THREE.PlaneBufferGeometry();
	let cloudMaterial = new THREE.MeshLambertMaterial();
	loader.load(filePath+"Textures/Skybox/cloud/cloudTex.png", function (texture) {
		cloudGeo = new THREE.PlaneBufferGeometry(200, 200);
		cloudMaterial = new THREE.MeshPhongMaterial({
			map: texture,
			transparent: true
		});

		for (let p = 0; p < 1; p++) {
			let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
			cloud.name = "cloud"
			//centre :30.5453, 0, -32.0482
			cloud.position.set(Math.random() * 30 - 0, 100, Math.random() * -32 + 0.0);
			cloud.rotation.x = 1.16;
			cloud.rotation.y = -0.12;
			cloud.rotation.z = Math.random() * 360;
			cloud.material.opacity = 0.6;
			scene.add(cloud);
			cloudMeshArr.push(cloud);
		}
	});

	//lightning flash
	flash = new THREE.PointLight(0x062d89, 30, 500, 2);
	flash.name = "flash"
	flash.position.set(30, 110, -30);

	scene.add(flash);

	let rainCount = 40000;
	let points = new Float32Array(500 * 3);
	for (let i = 0; i < rainCount; i = i + 3) {
		points[i] = Math.random() * 100;
		points[i + 1] = Math.random() * 300 + 50;
		points[i + 2] = Math.random() * 100 - 80;//set cprrectly
	}
	rainGeo.setAttribute('position', new THREE.BufferAttribute(points, 3));



	let rainMaterial = new THREE.PointsMaterial({
		color: 0xaaaaaa,
		size: 0.1,
		transparent: true
	});
	let rain = new THREE.Points(rainGeo, rainMaterial);
	rain.name = "rainDrops"
	scene.add(rain);
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
//1.5
//Hitbox Init
const playerShape = new CANNON.Sphere(1);
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

//initilize hud with random variables
hud = new HUD(1, 1, 0, 5);

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
Load.isLoading("Start", false)
setTimeout(doneLoading, 5000);


//Mesh of the end of the gun (for use in bullet trails)
var gunEnd

//Load level 1
var currentWorld = 1;
BuildWorld.loadLevel(banana, scene, world, currentWorld, function () {
	afterLoad();
});

//WORLD BUILDER THE ANTITHESIS TO JORMUNGANDR
/**
 * adds gun to the player
 * turns on lights that need to be turned on
 * adds the targets to the world
 * adds the moving targets to the world
 * adds the hud to the world
 * adds the clouds to the world
 * sets the position of the end of the gun
 * enables specific effects per level
 * enables the music
 * runs the animation
 * @function afterLoad
 */
function afterLoad() {

	// --------------------------------------------------------------------------------------------------------------------------------------------------------
	// EVERYTHING REQUIRING THE LEVELS IN THE SCENE MUST BE PUT INTO THIS FUNCTION NB!! 
	// --------------------------------------------------------------------------------------------------------------------------------------------------------
	//Adds the gun model to scene. Done in here to ensure model is loaded 
	BuildWorld.addGun(playerModel, banana)

	//Get all objects that should have high selective bloom applied, i.e. glowing
	const glowing = BuildWorld.getGlowing();

	//creates object for calling methods related to dynamic skybox...to be implemented later

	//Get the array of stationary targets as a mesh
	const targetArrayMeshStill = BuildWorld.getTargetsStill()
	const targetArrayMeshMove = BuildWorld.getTargetsMoving()
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
	for (const tarMesh of targetArrayMeshMove) {
		const x = tarMesh.position.x
		const y = tarMesh.position.y
		const z = tarMesh.position.z
		const targetPosition = tarMesh.position;
		TargetPos.push(targetPosition);
		const targetQuaterion = tarMesh.quaternion;
		TargetQuat.push(targetQuaterion);
	}
	addTargets(TargetPos, TargetQuat);
	enableMoving()
	//Make total amo proportional to no targets 
	totalammo = parseInt(TargetArr.length * 1.5)

	//Create hud with target information

	//initialises the hud
	hud.setBullets(totalammo, totalammo)
	hud.setTargets(0, TargetArr.length)
	hud.changeLevel(currentWorld)

	//Adjust player body attributes to match hud
	playerBody.noBullets = hud.currammo
	playerBody.canJump = false;

	//Assign mesh to gunEnd after cleaning object
	gunEnd = null;
	gunEnd = BuildWorld.getMuzzleFlashMesh()

	//Assign clouds after cleaning array
	clouds = []
	clouds = BuildWorld.getClouds();



	//console.log(monkeyHead)

	//calls the method to draw the level's skybox (day)
	switch (currentWorld) {
		case 1:
			rainSound(0);
			drawSkyBox(1)
			//Set up the main composer for the scene using preset post processing
			composer = POSTPROCESSINGPASSES.doPasses(renderer, controls.getObject(), scene)

			//Do a volumetric pass
			composer = POSTPROCESSINGPASSES.volumetricPass(composer, controls.getObject(), mainLight)
			break;
		case 3:
			//calls the method to draw the level's skybox (evening)
			drawSkyBox(3)

			stormSky();
			if (homeScreen.soundEffects) {
				rainSound(1);
			}
			//Set up the main composer for the scene using preset post processing without volumetric lighting
			composer = POSTPROCESSINGPASSES.doPasses(renderer, controls.getObject(), scene)

			break;
		case 2:
			drawSkyBox(2);
			rainSound(0);
			mainLight.color.setHex(0xf05cb2);
			mainLight.position.set(400, 200, 1.5);
			light.color.setHex(0xc23b05);
			//Set up the main composer for the scene using preset post processing without volumetric lighting
			composer = POSTPROCESSINGPASSES.doPasses(renderer, controls.getObject(), scene)

			//Do a volumetric pass
			composer = POSTPROCESSINGPASSES.volumetricPass(composer, controls.getObject(), mainLight)
			break;

	}

	//Do selective bloom (mainly for the the lights and muzzle flash). Simply addes another pass to the composer and returns it
	composer = POSTPROCESSINGPASSES.selectiveBloomPass(composer, controls.getObject(), scene, glowing)

	//Add post processing to orbital camera
	composerMenu = POSTPROCESSINGPASSES.doPasses(renderer, Menucamera, scene, mainLight)

	//Run game
	//backgroundmusic.pause();
	if (homeScreen.Music) {
		backgroundmusic.init(backgroundmusic.backgroundSound, banana);
	}

	animationID = requestAnimationFrame(animate);
}

//To unload current world

//Used to stop animation for level loads
var animationID;
/**
 * animate Function that runs the game
 * @function afterLoad
 */
let count = 0;
var FrameRate = 1000 / 60
var timeTarget = 0
function animate() {

	stats.begin()
	if(Date.now()>=timeTarget){
	if (menu == true) {//if we're in the menu
		
		orbitControls.update()//rotate around the world
		composerMenu.render()
		homeScreen.draw()//draw the main menu

		//Make skybox follow orbital camera to make the distance to the skybox look infinite
		skybox.position.copy(orbitControls.object.position)

		MenuTexture.needsUpdate = true//update main menu
		renderer.render(menuScene, HudCamera)//render the main menu
		if (homeScreen.Music == true) {
			backgroundmusic.play()
		} else {
			backgroundmusic.pause()
		}
	}
	else {
		if (controls.isLocked && Load.loading==false) {
			checkState()
			hud.isPaused(false);
			if (playerModel.position.y < -25) { Load.isLoading(1, banana)
				 init(true); } // if player out of bounds, reset level
			playerModel.position.copy(playerBody.position);

				//Make skybox follow player to make the distance to the skybox look infinite
				skybox.position.copy(playerBody.position)

				//make clouds move
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
				playerModel.translateY(0.3)//-2
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
				pos.y += 1.2
				controls.getObject().position.copy(pos);
				hud.updateAmmoCount(playerBody.noBullets)
				hud.draw(currentWorld, banana);
				MoveTargets(dt)
				hudTexture.needsUpdate = true;
				world.step(timestep, dt);

				if (currentWorld == 3) {

					if (Math.random() > 0.98 || flash.power > 100) {
						count++
						if (flash.power < 100) {

							flash.position.set(Math.random() * 30, 100 + Math.random() * 10, -30);
						}
						flash.power = 50 + Math.random() * 500;
						if (count > 70) {//make it only run every 80 seconds //parseInt(0.75*60)
							if (homeScreen.soundEffects && count > 70) {

								thunderSound(1);
								count = 0;
							}

						}

					}

					cloudMeshArr.forEach(p => { p.rotation.z -= 0.002; })
					rainGeo.translate(0, -1, 0);      //-----------------------
					counter += 1
					if (counter == 209) {
						rainGeo.translate(0, 200, 0); //resets the rain gemoetry (vertically)
						counter = 0;

					}
					rain.rotation.y += 0.002; //introduces angle


				}
				if (doorMovingBool) {
					handleDoor()
				}
			}
			else {
				if(!gameWon){
				hud.isPaused(true);
				checkState()
				hud.draw(currentWorld, banana);
				hudTexture.needsUpdate = true;
				}
			}
			renderWorld()
			timeTarget += FrameRate
			if (Date.now() >= timeTarget) {
				timeTarget = Date.now()
			}
		}
	}
	stats.end() //For monitoring
	animationID = requestAnimationFrame(animate);
};

//Render func
/**
 * renderWorld this function renders the minimap and reset the values back to the original
 * @function renderWorld
 */
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

/**
 * mapTargets Rotates targets for appearance on the map camera
 * @function mapTargets
 */
function mapTargets() {
	for (var i = 0; i < TargetArr.length; i++) {
		var tempCylinder = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.01, 32), TargetArr[i].getCylinder().material, currentWorld)
		tempCylinder.position.copy(TargetArr[i].getCylinder().position)
		mapTargetArr.push(tempCylinder)
		scene.add(tempCylinder.rotateY(Math.PI / 2).translateY(25 - tempCylinder.position.y))
	}
};

/**
 * worldTargets Remove the map targets from the scene
 * @function worldTargets
 */
function worldTargets() {
	while (mapTargetArr.length != 0) {
		scene.remove(mapTargetArr.pop());
	}
};

//Moves the targets in the scene

/**
 * Function to add the targets to the scene
 * @param {THREE.Vector3} position 
 * @param {THREE.Quaternion} quaternion 
 * @function addTargets
 */
function addTargets(position, quaternion) {
	for (var i = 0; i < position.length; i++) {
		var target = new Targets(i, position[i], quaternion[i], currentWorld, scene, banana);
		TargetArr.push(target);
		scene.add(target.getCylinder());
	}
};

//Init for level reset
/**
 * removes all bullet lines
 * if reset is true
 * reset the hud
 * undo all graphical changes of current world
 * unload the world
 * reset current world to 1
 * load world 1
 * if reset is false
 * undo graphical effects from current world
 * 
 * in general
 * reset all values of the player and the world back to their default values
 * @param {boolean} reset whether or not to just reset the current world or the entire game
 * @function init
 */
function init(reset) {
	for (const line of lines) {
		scene.remove(line[0])
	}
	if (reset) {
		hud.Clicked = false
		doorMovingBool=false
		if (!Load.loading) { Load.isLoading(1, banana) }

		if (currentWorld >= 3) {
			//undoes any environmental changes done by world 3
			scene.add(mainLight)
			scene.add(light)
			scene.remove(scene.getObjectByName("cloud"));
			scene.remove(scene.getObjectByName("flash"))
			cloudMeshArr = []
			scene.remove(scene.getObjectByName("rainDrops"))
		} else if (currentWorld == 2) {
			//undo any visual effects changed in world 2
			mainLight.color.set(0xFFFFFF)
			mainLight.position.set(1.5, 2.75, 1.5);
			mainLight.position.multiplyScalar(50);
			scene.add(mainLight)
			light.color.set(0xFFFFFF)
			scene.add(light)
		}
		BuildWorld.unloadCurrentLevel(scene, world)
		scene.remove(skybox)
		cancelAnimationFrame(animationID);
		currentWorld = 1
		BuildWorld.loadLevel(banana, scene, world, currentWorld, function () {
			afterLoad();
			hud.setStartTime()
			init(false)
		});
		rainSound(0)
		thunderSound(0)
		changeLevel=false
	} else {
		//remove visual effects from previous levels
		if (currentWorld == 3) {
			light.color.set(0xFFFFFF)
			mainLight.color.set(0xFFFFFF)
			mainLight.position.set(1.5, 2.75, 1.5);
			mainLight.position.multiplyScalar(50);
			scene.remove(mainLight);
			scene.remove(light);
		}
		else if (currentWorld == 2) {
			scene.add(light);
			scene.remove(scene.getObjectByName("cloud"));
			scene.remove(scene.getObjectByName("flash"))
			cloudMeshArr = []
			scene.remove(scene.getObjectByName("rainDrops"))
		}
		hudTexture.needsUpdate = true
	removeTargets();
	addTargets(TargetPos, TargetQuat);
	enableMoving()
	hud.gamestate = 0;
	hud.currtargets = 0;
	playerBody.noBullets = totalammo;
	playerBody.canJump = false
	playerBody.prevVel = 0;
	playerBody.counter = 0;
	hud.updateAmmoCount(playerBody.noBullets);
	playerBody.velocity = new CANNON.Vec3(0, 0, 0)
	playerBody.position.copy(initposition)
	controls.getObject().position.copy(playerBody.position)
	controls.getObject().lookAt(0, 5, 0)
	playerBody.quaternion.copy(controls.getObject().quaternion)
	if (Load.loading) {
		var milliseconds=1000
		if(currentWorld==2){
			milliseconds=5000
		}
		else if(currentWorld==3){
			milliseconds=2500
		}
		setTimeout(doneLoading, milliseconds);
	}
	}


};
/**
 * doneLoading remove loading screen
 * @function doneLoading
 */
function doneLoading(){
	document.body.removeChild(document.body.lastElementChild); //remove loading screen
		Load.loading = false
		
		hud.isPaused(false);
}
/**
 * removeTargets Remove all targets from scene
 * @function removeTargets
 */
function removeTargets() {
	while (TargetArr.length != 0) {
		scene.remove(TargetArr.pop().getCylinder())
	}
};

//Event listener for lock
/**
 * @listens lock#lock when the mouse is captured
 */
controls.addEventListener('lock', () => {
	controls.enabled = true;
});

//Event listener for unlock
/**
 * @listens unlocked#unlocked when the mouse is returned
 */
controls.addEventListener('unlocked', () => {
	controls.enabled = false;
});

//Mouse-up event listener
/**
 * @listens mouseup#mouseUp when the player stops clicking
 */
document.addEventListener("mouseup", (e) => {
	//Remove muzzle flash on mouse up
	try {
		scene.getObjectByName('muzzleFlash').visible = false;
	} catch (error) {
	}
});




//Mouse-down event listener
/**
 * fires the gun
 * used for when buttons are clicked
 * also reset world on failure
 * @listens mousedown#onclick all mouse events are performed here
 */
document.addEventListener("mousedown", (e) => {
	if (e.button == 0) {

		if (homeScreen.Music) {
			backgroundmusic.pause()
			backgroundmusic.play()
		}



		if (controls.isLocked == true) {
			if (playerBody.noBullets > 0 && Load.loading==false) { //if player has any bullets 
				playerBody.noBullets--; //decrement bullet count
				if (homeScreen.soundEffects) {
					var Sounds = [filePath+"Sound Effects/rifle.mp3", filePath+"Sound Effects/PewPew.mp3", filePath+"Sound Effects/Im a banana.mp3", filePath+"Sound Effects/Bang.mp3",filePath+"Sound Effects/JeremyGunShotSound.mp3",filePath+"Sound Effects/Pew.mp3",filePath+"Sound Effects/Pop.mp3",filePath+"Sound Effects/Meow.mp3",filePath+"Sound Effects/BEN.mp3",filePath+"Sound Effects/Villager.mp3",filePath+"Sound Effects/Grunt.mp3"]
					var loc = 0;
					if (banana) {
						loc = Math.floor(Math.random() * (Sounds.length - 1 + 1) + 1)
					}
					gunshotSound(Sounds[loc])
				}
				//Get time of shot
				let d = new Date();
				let sec = d.getSeconds() + d.getMilliseconds() / 1000;
				let min = d.getMinutes() + sec / 60;
				let creationTime = d.getHours() + min / 60;
				creationTime *= 60 * 60;

				scene.getObjectByName('muzzleFlash').visible = true; //Add muzzle flash on shoot
				raycaster.setFromCamera(new THREE.Vector2(0, 0), controls.getObject()); // hit thing in line of sight of crosshair
				const intersects = raycaster.intersectObjects(scene.children);
				for (let j = 0; j < TargetArr.length; j++) {
					var i = 0
					while (Torso.children.includes(intersects[i].object)) {
						i++;
					}
					if (intersects[i].object == TargetArr[j].getCylinder() && TargetArr[j].isHit == false) { // only count if hit target and the target has not been already hit
						var name = intersects[i].object.name
						//Count the target as shot
						HitTarget(name)

						//Target that triggers door is target 3 on world 3, WILL CHANGE IF TARGETS CHANGE!!!!!
						if (currentWorld == 3 && name == '3') {
							doorMovingBool = true;
						}

						//Increase the shot targets on HUD
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
					})
				)


				// [Line, age of line]
				lines.push([line, creationTime])
				scene.add(line);
				const spark = new SPARK(intersects[i].point.clone(), creationTime, scene);
				sparks.push(spark);

				if (gameWon == true) {
					gameWon = false
					init(true);
					controls.unlock()
					menu = true
					hud.cansend=false
					homeScreen.all=[]
					scene.remove(playerModel)
					scene.remove(controls.getObject())
					if(banana &&!rolled &&hud.ricked==true){
						backgroundmusic.pause()
						homeScreen.Music = false
						rolled=true
						hud.ricked=false
						window.open(
							"https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");

					}
				}

			} else if (gameFailed == true) {
				gameFailed = false;
				init(true);


			}

		}
		else {
			if (menu == true ) {
				if( Load.loading==false){
				var ButtonClicked = homeScreen.Clicked(e.clientX, e.clientY)}
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
/**
 * checkState checks whether the game has been won or lost
 * @function checkState
 */
function checkState() {
	if (hud.gamestate == -1 && gameFailed == false) { //Game failed
		gameFailed = true

	}
	else if (hud.gamestate == 1) { //level win 
		hud.Paused=false;
		hud.isPaused(true);
		
		removeTargets();
		//Check that there is a next level to load, otherwise init
		if (currentWorld < 4 && changeLevel == false) {
			//Code to swap levels



			changeLevel = true
			currentWorld++

			if (currentWorld < 4) {
				Load.isLoading(currentWorld, banana);
				BuildWorld.unloadCurrentLevel(scene, world)
				cancelAnimationFrame(animationID);
				BuildWorld.loadLevel(banana, scene, world, currentWorld, function () {
					afterLoad();
					init(false);


					changeLevel = false;
				});
			} else {
				hud.gamestate = 0;
			}
		} else if (hud.entered == true && currentWorld >= 4) {
			gameWon = true;

		}
		// Important for playe reset
	}
}





//Keys pressed container
const pressedKeys = {};
var typedKeys = ""
//var banana=false          //declared higher up (for music reasons)
//Keydown event listener
/**
 * @listens keydown#keydown event when a key is pressed
 */
document.addEventListener("keydown", (e) => {
	if (controls.isLocked && !Load.loading) {
		pressedKeys[e.key] = true;
	} else if (menu == true) {
		typedKeys += e.key.toLowerCase()
		if (typedKeys.includes("banana") && !banana) {
			if(Load.loading) doneLoading();
			Load.isLoading("banana",true)
			banana = true
			homeScreen.enableBanana()
			backgroundmusic.pause()
			backgroundmusic.init(banana)
			init(true)

		}
	} else if (menu == false) {
		if (e.key == "r") {

			init(true);
		}
		if (e.key == "m") {
			Load.isLoading("menu", banana)
			hud.cansend=false
			init(true)
			menu = true
			scene.remove(playerModel)
			scene.remove(controls.getObject())
			homeScreen.all=[]
		}
	}
});

//Keyup event listener
/**
 * @listens keyup#keyup events when key is no longer being pressed
 */
document.addEventListener("keyup", (e) => {
	pressedKeys[e.key] = false;
});

//Target hit logic
/**
 * run when a target is shot
 * @param {integer} name int representing which target is hit
 * @function hitTarget
 */
function HitTarget(name) {
	TargetArr[parseInt(name)].hit();
};

//Movement logic
/**
 * move all the logic regarding the movement of the player
 * @function move
 */
function move() {
	playerBody.linearDamping = 0.9
	playerBody.angularDamping = 0.9
	var tempVec = new THREE.Vector3(0, 0, 0);
	var delta = dt * 1000
	delta *= 0.1
	if (controls.isLocked) {
		if (Math.floor(playerBody.prevVel) == Math.floor(playerBody.velocity.y)) {
			if (playerBody.counter == 10) {
				playerBody.canJump = true;
			} else {
				playerBody.counter++;
			}
		} else {
			playerBody.counter = 0;
		}
		playerBody.prevVel = playerBody.velocity.y;
		if (homeScreen.controls) {
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
				playerBody.canJump = false          //change back jump to false
			}
		} else {
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
/**
 * handleTrails draws the lines after a bullet is shot
 * @function handleTrails
 */
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


}
/**
 * handleSparks sparks when something is shot
 * @function handleSparks
 */
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
/**
 * MoveTargets moves the targets
 * @function MoveTargets
 */
function MoveTargets() {

	var d = new Date();
	var sec = d.getSeconds() + d.getMilliseconds() / 1000;
	var min = d.getMinutes() + sec / 60;
	var time = d.getHours() + min / 60;
	time *= 60 * 60;
	for (var i = 0; i < TargetArr.length; i++) {
		if (TargetArr[i].moves == true) {
			TargetArr[i].moveTarget(time, TargetArr.length)
		}
	}
}
/**
 * enableMoving enables a target to move
 * @function enableMoving
 */
function enableMoving() {
	if (currentWorld == 1) {
		for (var i = 0; i < Level1.length; i++) {
			TargetArr[TargetArr.length - i - 1].enableMove(i, Level1[i])
		}
	} else if (currentWorld == 2) {
		for (var i = 0; i < Level2.length; i++) {
			TargetArr[TargetArr.length - i - 1].enableMove(i, Level2[i])
		}
	} else if (currentWorld == 2) {
		for (var i = 0; i < Level2.length; i++) {
			TargetArr[TargetArr.length - i - 1].enableMove(i, Level2[i])
		}
	} else if (currentWorld == 3) {
		for (var i = 0; i < Level3.length; i++) {
			TargetArr[TargetArr.length - i - 1].enableMove(i, Level3[i])
		}
	}

}

/**
 * Function to handle the door moving
 * @function handleDoor
 */
function handleDoor() {
	var door = BuildWorld.getDoor();
	door[0].translateY(-0.01);
	var offSetVec3 = door[1].shapeOffsets.pop()
	offSetVec3.y -= 0.01
	door[1].shapeOffsets.push(offSetVec3);
}