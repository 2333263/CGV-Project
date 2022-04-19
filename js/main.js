import * as THREE from '../node_modules/three/build/three.module.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry();
const floorGeo = new THREE.BoxGeometry(15,0.1,15);
const material = new THREE.MeshLambertMaterial({color: 0x00ff00 });
const floorMat = new THREE.MeshLambertMaterial({color: 0xb0b0b0});
const light = new THREE.HemisphereLight(0x404040, 0x010101, 3.5);
const floor = new THREE.Mesh(floorGeo, floorMat);
const cube = new THREE.Mesh( geometry, material );
scene.add(cube.translateZ(-6).translateY(-1));
scene.add(light);
scene.add(floor.translateZ(-6).translateY(-2));

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	cube.rotation.z += 0.01;

	renderer.render( scene, camera );
};

animate();