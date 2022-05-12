import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { threeToCannonObj } from '../js/ThreeToCannonObj.js'

const loader = new THREE.TextureLoader();
const manager = new THREE.LoadingManager();
var hullCollision = [];
var hullCollisionCANNON = [];
var barrelCollision = [];
var barrelCollisionCANNON = [];
var boxCollision = [];
var boxCollisionCANNON = [];

//Wire fences must be kept same size for optimisation
var wireColor = loader.load('../Objects/Textures/Fence/Fence003_0_5K_Color.png')
var wireNormal = loader.load('../Objects/Textures/Fence/Fence003_0_5K_NormalGL.png')
var wireAlpha = loader.load('../Objects/Textures/Fence/Fence003_1K_Opacity.png')
wireColor.wrapS = wireColor.wrapT = THREE.RepeatWrapping;
wireNormal.wrapS = wireNormal.wrapT = THREE.RepeatWrapping;
wireAlpha.wrapS = wireAlpha.wrapT = THREE.RepeatWrapping;
const models = {
    level1body: { url: '/Objects/Level_1/Level_1.gltf' },
    level2body: { url: '/Objects/Level_1/Level_2.gltf' },
    level3body: { url: '/Objects/Level_1/Level_3.gltf' }
};

class BuildWorld {
    constructor() {
    }

    /**
     * Function to load a specified level into the scene and world
     * @param {THREE.Scene} scene The scene that the level is loaded to
     * @param {CANNON.World} world The world that the collisions are loaded to
     * @param {int} level The level of the world as an int
     * 
     */
    static loadLevel(scene, world, level = 1) {
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
                //In Case the level is defined incorrectly, load level 1
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
                    /*

                    const sizeWidth = (child.geometry.boundingBox.max.x - child.geometry.boundingBox.min.x) 
                    const sizeDepth = (child.geometry.boundingBox.max.z - child.geometry.boundingBox.min.z) 
                    const sizeHeight = (child.geometry.boundingBox.max.z - child.geometry.boundingBox.min.z) 

                    const normal = loader.load('../Objects/Textures/Wall/concrete_normal_low.jpg')
                    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
                    normal.repeat.set(sizeHeight*4, (sizeWidth + sizeDepth)*2)
                    console.log(sizeWidth, sizeDepth, sizeHeight)
                    child.material.side = THREE.FrontSide
                    child.material.normalMap = normal
                    console.log(child)
                    */
                }
                else if (name.substring(0, 11) === 'InvisHitbox') {
                    //Add the invisible hitboxes
                    child.visible = false
                    hullCollision.push(child)
                }
                else if (name.substring(0, 4) === 'Wall') {
                    //Add barrels to collision detection
                    boxCollision.push(child)
                }
                else if (name.substring(0, 8) === 'TrashBin' || name.substring(0, 5) === 'Crate') {
                    //Add trash bins and crates to collision detection
                    boxCollision.push(child)
                }

                else if (name.substring(0, 11) === 'WindowGlass') {
                    child.material.specular = new THREE.Color('#31A5E7')
                }
                else if (name.substring(0, 6) === 'Window' || name.substring(0, 4) === 'Door' || name.substring(0, 4) === 'Sign') {
                    child.castShadow = false;
                }


                else if (name.substring(0, 5) === 'Sign0') {
                    //Replace textures
                    const textureTemp = child.material.map
                    const newMat = new THREE.MeshPhongMaterial({
                        map: textureTemp,

                    })
                    child.material = newMat
                }

                else if (name.substring(0, 5) === 'Floor') {
                    //Replace textures and add to floor collision
                    boxCollision.push(child)
                    const textureTemp = loader.load('../Objects/Textures/Floor/Ground049B_1K_Color.jpg')
                    textureTemp.wrapS = textureTemp.wrapT = THREE.RepeatWrapping;
                    textureTemp.repeat.set(9, 9)
                    const normal = loader.load('../Objects/Textures/Floor/Ground049B_1K_NormalGL.jpg')
                    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
                    normal.repeat.set(9, 9)

                    const newMat = new THREE.MeshPhongMaterial({
                        map: textureTemp,
                        normalMap: normal,
                        shininess: 0
                    })
                    child.material = newMat
                }

                else if (name.substring(0, 8) === 'PathLong') {
                    //Replace textures
                    child.castShadow = false;

                    const sizeWidth = (child.geometry.boundingBox.max.x - child.geometry.boundingBox.min.x) * child.scale.x / 2
                    const sizeHeight = (child.geometry.boundingBox.max.z - child.geometry.boundingBox.min.z) * child.scale.z

                    //Wrap texture depending on path size
                    const textureTemp = loader.load('../Objects/Textures/Path/Bricks075A_1K_Color.png')
                    textureTemp.wrapS = textureTemp.wrapT = THREE.RepeatWrapping;
                    textureTemp.repeat.set(sizeWidth, sizeHeight)
                    const normal = loader.load('../Objects/Textures/Path/Bricks075A_1K_NormalGL.png')
                    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
                    normal.repeat.set(sizeWidth, sizeHeight)

                    const newMat = new THREE.MeshPhongMaterial({
                        map: textureTemp,
                        normalMap: normal,
                        shininess: 5
                    })
                    child.material = newMat
                }
                else if (name.substring(0, 11) === 'Pathoutline') {
                    //Turn off shadows
                    child.castShadow = false;
                }

                else if (name.substring(0, 9) === 'WireFence') {
                    var sideShown = THREE.FrontSide;
                    child.castShadow = false
                    child.receiveShadow = false
                    //Add fence to collision detection
                    boxCollision.push(child);

                    //Replace textures
                    child.castShadow = false;
                    const sizex = (child.geometry.boundingBox.max.x - child.geometry.boundingBox.min.x) * child.scale.x
                    const sizey = (child.geometry.boundingBox.max.y - child.geometry.boundingBox.min.y) * child.scale.y
                    const sizeWidth = Math.sqrt(Math.pow(sizex, 2) + Math.pow(sizey, 2)) / 2
                    const sizeHeight = (child.geometry.boundingBox.max.z - child.geometry.boundingBox.min.z) * child.scale.z / 2
                    //console.log(sizeHeight)

                    //Wrap texture depending on path size
                    wireColor.repeat.set(sizeWidth, sizeHeight)
                    wireNormal.repeat.set(sizeWidth, sizeHeight)
                    wireAlpha.repeat.set(sizeWidth, sizeHeight)


                    const newMat = new THREE.MeshPhongMaterial({
                        map: wireColor,
                        normalMap: wireNormal,
                        alphaMap: wireAlpha,
                        transparent: true,
                        shininess: 5,
                        side: sideShown
                    })
                    child.material = newMat

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


    /**
     * Function to unload current world
     * @param {THREE.Scene} scene The scene to have only the level objects removed
     * @param {CANNON.World} world The world to have only the level collisions removed
     */
    static unloadCurrentLevel(scene, world) {

        //Unload THREE meshes
        //console.log(scene.getObjectByName('Scene'))
        scene.remove(scene.getObjectByName('Level_Root'))

        //Unload CANNON collisions of different types
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

    /**
     * Method to build the player
     * @returns {THREE.Mesh} Player mesh
     */
    static buildPlayer(){
        //Player colours
        const colorRed = new THREE.Color('#BC4937');
        const colorPeach = new THREE.Color('#F7C0A3');
        const colorBlack = new THREE.Color('#000000');

        //Define geometries
        const torseGeometry = new THREE.BoxGeometry(1.2,1.5,0.5);
        const armGeometry = new THREE.BoxGeometry(0.4,1.3,0.4);
        const handGeometry = new THREE.BoxGeometry(0.36,0.2,0.36);
        const headGeometry = new THREE.BoxGeometry(0.7,0.7,0.4);
        const eyeGeometry = new THREE.PlaneGeometry(0.1,0.2);
        const legGeometry = new THREE.BoxGeometry(0.45,0.8,0.45);
        

        //Define materials
        const redMat = new THREE.MeshPhongMaterial({
            color: colorRed,
            side: THREE.FrontSide
        });
        const skinMat = new THREE.MeshPhongMaterial({
            color: colorPeach,
            side: THREE.FrontSide
        });
        const blackMat = new THREE.MeshPhongMaterial({
            color: colorBlack,
            side: THREE.FrontSide
        });
        
        //Make main player mesh
        const torsoMesh = new THREE.Mesh(torseGeometry, redMat);
        torsoMesh.name = 'torso';

        //Make arms, add pivot for rotation
        const armRight = new THREE.Mesh(armGeometry, redMat);
        armRight.name = 'armRight';
        const armLeft = new THREE.Mesh(armGeometry, redMat);
        armLeft.name = 'armLeft';

        //Make hands
        const handRight = new THREE.Mesh(handGeometry, skinMat);
        handRight.name = 'handRight';
        const handLeft = new THREE.Mesh(handGeometry, skinMat);
        handLeft.name = 'handLeft';

        //Make head
        const head = new THREE.Mesh(headGeometry, skinMat);
        head.name = 'head';

        //Make eyes
        const eyeRight = new THREE.Mesh(eyeGeometry, blackMat);
        eyeRight.name = 'eyeRight';
        const eyeLeft = new THREE.Mesh(eyeGeometry, blackMat);
        eyeLeft.name = 'eyeLeft';

        //Make Legs
        const legLeft = new THREE.Mesh(legGeometry,blackMat);
        legLeft.name = 'legLeft';
        const legRight = new THREE.Mesh(legGeometry, blackMat);
        legRight.name = 'legRight';

        //Add limbs + head to torse
        torsoMesh.add(armRight.translateX(0.8));
        torsoMesh.add(armLeft.translateX(-0.8).rotateY(Math.PI / 2));
        torsoMesh.add(head.translateY(0.7))
        torsoMesh.add(legRight.translateX(0.25).translateY(-0.8))
        torsoMesh.add(legLeft.translateX(-0.25).translateY(-0.8))

        //Add eyes to head slight in front of head to avoid clipping
        head.add(eyeLeft.translateX(-0.15).translateZ(0.201).translateY(0.15));
        head.add(eyeRight.translateX(0.15).translateZ(0.201).translateY(0.15));

        //Add hands to arms
        armRight.add(handRight.translateY(-0.7));
        armLeft.add(handLeft.translateY(-0.7));
        
        //torsoMesh.rotateY(Math.PI)
        
        return torsoMesh;
    }

}


export { BuildWorld };