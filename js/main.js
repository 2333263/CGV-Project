import * as THREE from 'three';
import * as CANNON from 'cannon-es';
//{ BloomEffect, EffectComposer, EffectPass, RenderPass }
import * as POSTPROCESSING from "postprocessing";

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


import Stats from "stats";
import { PointerLockControls } from '/js/PointerLockControls.js';
import { HUD } from "/js/HUD.js"
import { Targets } from '/js/targets.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { threeToCannonObj } from '/js/ThreeToCannonObj.js'
import { leaderBoard } from './LeaderBoard.js';
const width = window.innerWidth + 20
const height = window.innerHeight + 20
console.log(width - window.innerWidth)
var scene = new THREE.Scene();
const aspectRatio = width / height
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
const HudCamera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 30)
var sceneHUD = new THREE.Scene();
var frustumSize = 14;
var dt = 0;
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
const timestep = 1 / 60
const material = new THREE.MeshStandardMaterial({
	map: loader.load('textureOne.jpg') //test texture
});
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
console.log(board.getBoard())
board.addItem("f", -99)
console.log(board.getBoard())
//Import the level from Blender and apply physics bounding
const manager = new THREE.LoadingManager();
//manager.onLoad = init;
//init function ?????????
const controls = new PointerLockControls(camera, document.body); //links controls to the camera

scene.add(controls.getObject());

//CODE TO GET TOON/CELL SHADING WORKING_COLOR_SPACE
/*
const alphaIndex = 5
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


const models = {
	body: { url: '/Objects/Level_1/Level_1.gltf' },
};
{
	const gltfLoader = new GLTFLoader(manager);
	for (const model of Object.values(models)) {
		gltfLoader.load(model.url, (gltf) => {
			var hullCollision = [];
			var barrelCollision = [];
			var boxCollision = [];
			gltf.scene.traverse(function (child) {
				
				//Traverse through all objects to get the collision

				//Change Material for lighting purposes
				if(child instanceof THREE.Mesh && child.name.substring(0, 4) != 'Sign'){
					const colourTemp = new THREE.Color(child.material.color)
					const newMat = new THREE.MeshPhongMaterial({
						color: colourTemp,
						//specular: new THREE.Color('#31A5E7'),
						shininess: 10
					})
					child.material = newMat
				}
				var name = child.name
				//Enable shadows for all objects
				child.castShadow = true;
				child.receiveShadow = true;
				if (name.substring(0, 4) === 'Base') {
					//Add houses to collision detection
					hullCollision.push(child)
				}
				if (name.substring(0, 10) === 'BarrelBody') {
					//Add barrels to collision detection
					barrelCollision.push(child)
				}
				if (name.substring(0, 11) === 'WindowGlass') {
					child.material.specular = new THREE.Color('#31A5E7')
				}
				if (name.substring(0, 6) === 'Window' || name.substring(0, 4) === 'Door' || name.substring(0, 4) === 'Sign') {
					child.castShadow=false;
				}


				if (name.substring(0, 5) === 'Sign0') {
					//Replace textures
					const textureTemp = child.material.map
					const newMat = new THREE.MeshPhongMaterial({
						map: textureTemp,
						
					})
					child.material = newMat
				}

				if (name.substring(0, 5) === 'Floor') {
					//Replace textures and add to floor collision
					boxCollision.push(child)
					const textureTemp =loader.load('Objects/Textures/Floor/Ground049B_1K_Color.jpg')
					textureTemp.wrapS = textureTemp.wrapT = THREE.RepeatWrapping;
					textureTemp.repeat.set(9,9)
					const normal = loader.load('Objects/Textures/Floor/Ground049B_1K_NormalGL.jpg')
					normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
					normal.repeat.set(9,9)
					
					const newMat = new THREE.MeshPhongMaterial({
						map: textureTemp,
						normalMap: normal,
						shininess:0
					})
					child.material = newMat
				}
				if (name.substring(0, 4) === 'Path') {
					//Replace textures
					const textureTemp =loader.load('Objects/Textures/Path/Bricks075A_1K_Color.png')
					textureTemp.wrapS = textureTemp.wrapT = THREE.RepeatWrapping;
					textureTemp.repeat.set(9,90)
					const normal = loader.load('Objects/Textures/Path/Bricks075A_1K_NormalGL.png')
					normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
					normal.repeat.set(9,90)
					
					const newMat = new THREE.MeshPhongMaterial({
						map: textureTemp,
						normalMap: normal,
						shininess:0
					})
					child.material = newMat
				}


			});

			const root = gltf.scene;

			//Visually render scene
			scene.add(root);

			//Add collisions
			for (const obj of hullCollision) {
				world.addBody(threeToCannonObj.getCannonMesh(obj));
			}
			for (const obj of barrelCollision) {
				world.addBody(threeToCannonObj.getCannonMesh(obj, 'CYLINDER'));
			}

			for (const obj of boxCollision) {
				world.addBody(threeToCannonObj.getCannonMesh(obj, 'BOX'));
			}

		});
	}
}


const geometry = new THREE.BoxGeometry(1, 1, 1);


/*
const ft = new THREE.TextureLoader().load("daylightbox_Front.bmp");
const bk = new THREE.TextureLoader().load("daylightbox_Back.bmp");
const up = new THREE.TextureLoader().load("daylightbox_Top.bmp");
const dn = new THREE.TextureLoader().load("daylightbox_Bottom.bmp");
const rt = new THREE.TextureLoader().load("daylightbox_Right.bmp");
const lf = new THREE.TextureLoader().load("daylightbox_Left.bmp");*/

//let pathStrings = ["miramar_ft.tga","miramar_bk.tga","miramar_up.tga","miramar_dn.tga","miramar_rt.tga","miramar_lf.tga"]
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

/*
const floorGeo = new THREE.BoxGeometry(100, 0.1, 100);
const floorMat = new THREE.MeshLambertMaterial({ map: loader.load("goomba.png") }); //testure on floor to show depth of movement
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
floor.position.copy(groundBody.position);
floor.quaternion.copy(groundBody.quaternion);

scene.add(floor.translateZ(-6).translateY(-2))
*/
scene.add(light)
camera.position.z = 9; //initialise camera position
camera.position.y = 9;
pipcamera.position.set(0, 30, 0); // place top down camera at a height above the world 
pipcamera.rotateX(-Math.PI / 2) //rotate so that it is top down

const initcam = controls.getObject().quaternion // save camera rotation to be used in init function


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
direcLight.position.set( 1.5, 2.75, 1.5 );
direcLight.position.multiplyScalar(50)
direcLight.target = player
direcLight.castShadow = true;
//scene.add(direcLight)

var temp = 50
direcLight.shadow.camera.top = temp;
direcLight.shadow.camera.bottom = -temp;
direcLight.shadow.camera.left = -temp;
direcLight.shadow.camera.right = temp;
direcLight.shadow.camera.near = 0;
direcLight.shadow.camera.far = 3500;
direcLight.shadow.bias = 0.0000; //EVIL ATTRIBUTE THAT BREAKS THIGNS (SET TO 0)
direcLight.shadow.mapSize.width = direcLight.shadow.mapSize.height = 1024*8;
direcLight.shadow.camera.fov = 70;

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
	if (controls.isLocked == true) {
	//	console.log(hud.entered)
		if (playerBody.noBullets > 0) { //if player has any bullets 
			playerBody.noBullets--; //decrement bullet count

			raycaster.setFromCamera(new THREE.Vector2(0, 0), controls.getObject()); // hit thing in line of sight of crosshair
			const intersects = raycaster.intersectObjects(scene.children);
			for (let j = 0; j < TargetArr.length; j++) {
				if (intersects[0].object == TargetArr[j].getCylinder() && TargetArr[j].isHit == false) { // only count if hit target and the target has not been already hit
					HitTarget(intersects[0].object.name)
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
		else if (hud.gamestate == 1 && hud.entered==true) { //game win (only one level so just resets)
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
		if (player.position.y < -25) { init(); } // if player out of bounds, reset level
		player.position.copy(playerBody.position);
		player.quaternion.copy(controls.getObject().quaternion);
		dt = Clock.getDelta()
		if(hud.gamestate==0)
		move();
		controls.getObject().position.copy(playerBody.position);
		hud.updateAmmoCount(playerBody.noBullets)
		hud.draw();
		hudTexture.needsUpdate = true;
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

//Post Proccessing
//USING CUSTOM POSTPROCESSING PACKAGE

const composer = new POSTPROCESSING.EffectComposer(renderer);
composer.addPass(new POSTPROCESSING.RenderPass(scene, controls.getObject()));

//New Bloom Effect
const bloomPass = new POSTPROCESSING.EffectPass(
	controls.getObject(), 
	new POSTPROCESSING.BloomEffect({
		intensity:0.5
	})
);

const chromaticAberationPass = new POSTPROCESSING.EffectPass(
	controls.getObject(), 
	new POSTPROCESSING.ChromaticAberrationEffect(13, new THREE.Vector2(1e-3, 5e-4),{
		//chromaticAberrationOffset: new THREE.Vector2(1,1)
	})
);


const sunMaterial = new THREE.MeshBasicMaterial({
	color: 0xffddaa,
	transparent: true,
	fog: false
});

const sunGeometry = new THREE.SphereBufferGeometry(10, 32, 32);
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.frustumCulled = false;
sun.matrixAutoUpdate = false;



const mainLight = new THREE.PointLight(0xffe3b1);
		mainLight.position.copy(direcLight.position);
		mainLight.castShadow = true;
		mainLight.shadow.radius = 3;
		mainLight.shadow.bias = 0.0000125;
		mainLight.shadow.mapSize.width = mainLight.shadow.mapSize.height = 1024*4;

scene.add(mainLight)

const group = new THREE.Group();
group.position.copy(mainLight.position);
group.add(sun);

const godRayPass = new POSTPROCESSING.EffectPass(
	controls.getObject(), 
	new POSTPROCESSING.GodRaysEffect(
		controls.getObject(), 
		sun, 
		{
			height: 480,
			//kernelSize: KernelSize.SMALL,
			density: 1,
			decay: 0.92,
			weight: 0.5,
			exposure: 0.54,
			samples: 30,
			clampMax: 1.0
	})
)
//Add to composer


composer.addPass(godRayPass);
//godRayPass.renderToScreen = true

composer.addPass(bloomPass);
//bloomPass.renderToScreen = true;

composer.addPass(chromaticAberationPass)
/*
//USING BUILT IN THREE.JS POST PROCESSING
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, controls.getObject());
composer.addPass(renderPass);


//new UnrealBloomPass(RES: {x: 512, y: 512}, STRENGTH : 2.0, RADIUS: 0.0, THRESHOLD : 0.75);
const unrealBloomPass = new UnrealBloomPass({x: 512, y: 512}, 0.2, 0.0, 0.25);
composer.addPass(unrealBloomPass);


//new BloomPass( strength = 1, kernelSize = 25, sigma = 4, resolution = 256 );
//const bloomPass = new BloomPass(1, 25, 4, 512);
//composer.addPass(bloomPass);

//Film Grain
//composer.addPass(new ShaderPass(FilmShader))

//Colour correction
//composer.addPass(new ShaderPass(ColorCorrectionShader))

//composer.addPass(new ShaderPass(ColorCorrectionShader))
*/
animate();


function renderWorld() {
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
	direcLight.castShadow = false;
	mainLight.castShadow = false;
	renderer.render(scene, pipcamera);
	worldTargets();
	direcLight.castShadow = true;
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


function addTargets(position) { // places targets

	for (var i = 0; i < position.length; i++) {
		var target = new Targets(i, position[i][0], position[i][1], position[i][2]);
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
	playerBody.canJump=false
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