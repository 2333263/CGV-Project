import * as THREE from '../node_modules/three/build/three.module.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var mouse=new THREE.Vector2(0,0);
var mouseDown=false;
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const loader = new THREE.TextureLoader();
const material = new THREE.MeshStandardMaterial({
	map: loader.load('textureOne.jpg')
});

const geometry = new THREE.BoxGeometry();
const floorGeo = new THREE.BoxGeometry(15,0.1,15);
const floorMat = new THREE.MeshLambertMaterial({color: 0x404040});
const light = new THREE.HemisphereLight("white", "white", 0.8);
const floor = new THREE.Mesh(floorGeo, floorMat);
const cube = new THREE.Mesh( geometry, material );
scene.add(cube.translateZ(-6).translateY(-1));
scene.add(light);
scene.add(floor.translateZ(-6).translateY(-2));

camera.position.z = 5;

document.addEventListener("mousedown",onMouseDown);
document.addEventListener("mouseup",onMouseUp);
document.addEventListener("mousemove",onMouseMove);

function onMouseDown(event){
	mouseDown=true;
	
}
function onMouseUp(event){
	mouseDown=false;
}
function onMouseMove(event){
	if(mouseDown){
		mouse.x=(event.clientX/window.innerWidth);
		mouse.y=-(event.clientY/window.innerHeight);
		console.log(mouse.x+" "+ mouse.y);
	}
}



function animate() {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	cube.rotation.z += 0.01;

	renderer.render( scene, camera );
};

animate();