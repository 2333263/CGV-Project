import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { threeToCannonObj } from '/js/ThreeToCannonObj.js'

const loader = new THREE.TextureLoader();
const manager = new THREE.LoadingManager();
var hullCollision = [];
var hullCollisionCANNON = [];
var barrelCollision = [];
var barrelCollisionCANNON = [];
var boxCollision = [];
var boxCollisionCANNON = [];

const models = {
    level1body: { url: '/Objects/Level_1/Level_1.gltf' },
    level2body: { url: '/Objects/Level_1/Level_2.gltf' },
    level3body: { url: '/Objects/Level_1/Level_3.gltf' }
};

class loadLevelWithCollision {
    constructor() {
    }

    static loadLevel(scene, world, level) {
        var url;
        //Select which level to load with switch 
        switch (level) {
            case 1: 
                url = models.level1body.url
                break;
            case 2: 
                url = models.level2body.url
                break;
            case 3: 
                url = models.level3body.url
                break;
            default: 
                //In Case the level is not defined, load level 1
                url = models.level1body.url
        }
        const gltfLoader = new GLTFLoader(manager);

        gltfLoader.load(url, (gltf) => {


            gltf.scene.traverse(function (child) {

                //Traverse through all objects to get the collision

                //Change Material for lighting purposes
                if (child instanceof THREE.Mesh && child.name.substring(0, 4) != 'Sign') {
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
                    child.castShadow = false;
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
                    const textureTemp = loader.load('Objects/Textures/Floor/Ground049B_1K_Color.jpg')
                    textureTemp.wrapS = textureTemp.wrapT = THREE.RepeatWrapping;
                    textureTemp.repeat.set(9, 9)
                    const normal = loader.load('Objects/Textures/Floor/Ground049B_1K_NormalGL.jpg')
                    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
                    normal.repeat.set(9, 9)

                    const newMat = new THREE.MeshPhongMaterial({
                        map: textureTemp,
                        normalMap: normal,
                        shininess: 0
                    })
                    child.material = newMat
                }

                if (name.substring(0, 8) === 'PathLong') {
                    //Replace textures
                    child.castShadow = false;

                    const sizeWidth = (child.geometry.boundingBox.max.x - child.geometry.boundingBox.min.x) * child.scale.x / 2
                    const sizeHeight = (child.geometry.boundingBox.max.z - child.geometry.boundingBox.min.z) * child.scale.z

                    //Wrap texture depending on path size
                    const textureTemp = loader.load('Objects/Textures/Path/Bricks075A_1K_Color.png')
                    textureTemp.wrapS = textureTemp.wrapT = THREE.RepeatWrapping;
                    textureTemp.repeat.set(sizeWidth, sizeHeight)
                    const normal = loader.load('Objects/Textures/Path/Bricks075A_1K_NormalGL.png')
                    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
                    normal.repeat.set(sizeWidth, sizeHeight)

                    const newMat = new THREE.MeshPhongMaterial({
                        map: textureTemp,
                        normalMap: normal,
                        shininess: 5
                    })
                    child.material = newMat
                }
                if (name.substring(0, 11) === 'Pathoutline') {
                    //Turn off shadows
                    child.castShadow = false;
                }


            });

            const root = gltf.scene;

            //Visually render scene
            root.name = 'Level_Root'
            scene.add(root);
            

            //Add collisions
            for (const obj of hullCollision) {
                var CANNONBody = threeToCannonObj.getCannonMesh(obj)
                world.addBody(CANNONBody);
                hullCollisionCANNON.push(CANNONBody)
            }
            for (const obj of barrelCollision) {
                var CANNONBody = threeToCannonObj.getCannonMesh(obj, 'CYLINDER')
                world.addBody(CANNONBody);
                barrelCollisionCANNON.push(CANNONBody)
            }

            for (const obj of boxCollision) {
                var CANNONBody = threeToCannonObj.getCannonMesh(obj, 'BOX')
                world.addBody(CANNONBody);
                boxCollisionCANNON.push(CANNONBody)
            }

        });
    }

    static unloadCurrentLevel(scene, world){
        
        //Unload THREE meshes
        //console.log(scene.getObjectByName('Scene'))
        scene.remove(scene.getObjectByName('Level_Root'))

        //Unload CANNON collisions
        for (const obj of hullCollisionCANNON) {
            console.log('Unloading CANNON Body')
            world.removeBody(obj)
            hullCollisionCANNON.pop(obj)
        }
        for (const obj of barrelCollisionCANNON) {
            world.removeBody(obj)
            barrelCollisionCANNON.pop(obj)
        }

        for (const obj of boxCollisionCANNON) {
            world.removeBody(obj)
            boxCollisionCANNON.pop(obj)
        }
    }

}


export { loadLevelWithCollision };