import * as THREE from '../node_modules/three/build/three.module.js';
import * as CANNON from '../node_modules/cannon-es/dist/cannon-es.js';
import {FirstPersonControls} from '/js/FirstPersonControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var mouse=new THREE.Vector2(0,0);
var mouseMove=false;
var TimeOut;
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const controls=new FirstPersonControls(camera,renderer.domElement);
const loader = new THREE.TextureLoader();
const timestep=1/60
const material = new THREE.MeshStandardMaterial({
	map: loader.load('textureOne.jpg')
});
const world= new CANNON.World({
	gravity: new CANNON.Vec3(0,-9.81,0)
});
const geometry = new THREE.BoxGeometry();
const floorGeo = new THREE.BoxGeometry(15,0.1,15);
const floorMat = new THREE.MeshLambertMaterial({color: 0x404040});
const light = new THREE.HemisphereLight("white", "white", 0.8);
const floor = new THREE.Mesh(floorGeo, floorMat);
const cube = new THREE.Mesh( geometry, material );
var planeShape=new CANNON.Plane()
const groundBody= new CANNON.Body({
shape: planeShape,
mass: 0
});
//groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
groundBody.position.set(-1,-3,-1);
world.addBody(groundBody)
scene.add(cube.translateZ(-6).translateY(-1));
scene.add(light);
scene.add(floor.translateZ(-6).translateY(-2));
camera.position.z = 5;

controls.maxPolarAngle=Math.PI/2;
//controls.movementSpeed=0;

document.addEventListener("mousemove",onMouseMove);

function onMouseMove(event){
		clearTimeout(TimeOut);
		TimeOut=setTimeout(onMouseNotMove,100);
		mouse.x=(event.clientX/window.innerWidth);
		mouse.y=-(event.clientY/window.innerHeight);
		controls.activeLook=true;
		//console.log("moved");

}


function onMouseNotMove(){
	controls.activeLook=false;
	//console.log("not moving");
}




function animate() {
	world.step(timestep);
	requestAnimationFrame( animate );
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	cube.rotation.z += 0.01;
	controls.update(1.0);
	floor.position.copy(groundBody.position);
	floor.quaternion.copy(groundBody.quaternion);
	renderer.render( scene, camera );
};

animate();