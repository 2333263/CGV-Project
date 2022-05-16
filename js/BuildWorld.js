import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { threeToCannonObj } from '../js/ThreeToCannonObj.js'
import { Reflector } from "../node_modules/three/examples/jsm/objects/Reflector.js"

const loader = new THREE.TextureLoader();
const manager = new THREE.LoadingManager();

const emissiveMapTex = loader.load('../Objects/Textures/WhiteEmission/square.png')


const width = window.innerWidth + 20
const height = window.innerHeight + 20

//Arrays of collision objects
var hullCollision = [];
var hullCollisionCANNON = [];
var barrelCollision = [];
var barrelCollisionCANNON = [];
var boxCollision = [];
var boxCollisionCANNON = [];

//Array of street lights (spotlights)
var streetLights = [];

//Array of glowing objects
var glowing = [];

//Array of targets
var targetsMoving = [];
var targetsStill = [];




//Wire fences must be kept same size for optimisation
var wireColor = loader.load('../Objects/Textures/Fence/Fence003_0_5K_Color.png')
var wireNormal = loader.load('../Objects/Textures/Fence/Fence003_0_5K_NormalGL.png')
var wireAlpha = loader.load('../Objects/Textures/Fence/Fence003_1K_Opacity.png')
wireColor.wrapS = wireColor.wrapT = THREE.RepeatWrapping;
wireNormal.wrapS = wireNormal.wrapT = THREE.RepeatWrapping;
wireAlpha.wrapS = wireAlpha.wrapT = THREE.RepeatWrapping;
const models = {
    level1body: { url: '../Objects/Level_1/Level_1.glb' },
    level2body: { url: '../Objects/Level_1/Level_2.glb' },
    level3body: { url: '../Objects/Level_1/Level_3.glb' }
};

class BuildWorld {
    constructor() {
    }

    /**
     * Function to load a specified level into the scene and world
     * @param {THREE.Scene} scene The scene that the level is loaded to
     * @param {CANNON.World} world The world that the collisions are loaded to
     * @param {int} level The level of the world as an int
     * @param {Function} callback function to run when level loaded
     * 
     */

    static loadLevel(scene, world, level = 1, callback) {
        var url;
        const toRemove = [];

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

            const root = gltf.scene;

            //Add scene to object
            root.name = 'Level_Root'
            

            root.traverse(function (child) {

                //Traverse through all objects to get the collision

                //Change Material for lighting purposes
                if (child instanceof THREE.Mesh && !(child.name.substring(0, 4) === 'Sign' || child.name.substring(0, 6) === 'Mirror')) {
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
                else if (name.substring(0, 6) === 'Target') {
                    //Add targets to respective arrays
                    if (name.substring(6, 10) === 'Move') {
                        targetsMoving.push(child);
                    } else {
                        targetsStill.push(child);
                    }

                    //Remove target ref from scene
                    toRemove.push(child);
                }
                else if (name.substring(0, 6) === 'Mirror') {
                    //Add Mirror
                    const mirrorGeo = new THREE.PlaneGeometry(3, 3);
                    const mirror = new Reflector(mirrorGeo, {
                        clipBias: 0.003,
                        textureWidth: width,
                        textureHeight: height
                    })
                    mirror.position.copy(child.position)
                    mirror.quaternion.copy(child.quaternion)
                    mirror.rotateX(-Math.PI / 2)
                    
                    scene.add(mirror)

                    //Remove mirror red from scene
                    toRemove.push(child)
                }
                else if (name.substring(0, 11) === 'InvisHitbox') {
                    //Add the invisible hitboxes
                    toRemove.push(child)
                    hullCollision.push(child)
                }
                else if (name.substring(0, 4) === 'Wall') {
                    //Add walls to collision detection
                    hullCollision.push(child)
                }
                else if (name.substring(0, 8) === 'TrashBin' /*|| name.substring(0, 5) === 'Crate'*/) {
                    //Add trash bins to collision detection, crates handled with invis
                    boxCollision.push(child)
                }

                else if (name.substring(0, 11) === 'WindowGlass') {
                    //Make glass specular
                    child.material.specular = new THREE.Color('#31A5E7')
                }
                else if (name.substring(0, 15) === 'StreetLightSpot') {
                    //Add spotlights to the street lights

                    //Create light
                    const streetLight = new THREE.SpotLight('#FFFFE0')

                    //Adjust light properties
                    //scene.add( new THREE.CameraHelper( streetLight.shadow.camera ) )
                    streetLight.power = 2
                    streetLight.decay = 2
                    streetLight.castShadow = true;
                    streetLight.shadow.mapSize.width = 512;
                    streetLight.shadow.mapSize.height = 512;
                    streetLight.shadow.focus = 0.9
                    // streetLight.shadow.camera.near = 2;
                    // streetLight.shadow.camera.far = 10;
                    streetLight.angle = Math.PI / 3
                    streetLight.penumbra = 0.5
                    streetLight.position.set(
                        child.position.x,
                        child.position.y,
                        child.position.z
                    )
                    //Create light target
                    const target = new THREE.Object3D

                    //position.copy was creating problems, do it manually
                    target.position.set(child.children[0].position.x + child.position.x,
                        child.children[0].position.y + child.position.y,
                        child.children[0].position.z + child.position.z
                    );

                    scene.add(target)


                    streetLight.target = target

                    //Add light to lights array
                    streetLights.push(streetLight)

                    //Add light to scene
                    scene.add(streetLight)

                    //Remove light ref from scene
                    toRemove.push(child)

                    //Only make glass glow if the light is present

                } else if (name.substring(0, 16) === 'StreetLightGlass') {

                    glowing.push(child)
                    const newMat = new THREE.MeshPhongMaterial({
                        color: child.material.color,
                        emissiveMap: emissiveMapTex,
                        emissive: child.material.color,
                        emissiveIntensity: 1
                    })
                    child.material = newMat
                }
                else if (name.substring(0, 6) === 'Window' || name.substring(0, 4) === 'Door' || name.substring(0, 4) === 'Sign' || name.substring(0, 11) === 'Pathoutline') {
                    //Stop these from cast shadows
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

                else if (name.substring(0, 5) === 'Crate') {
                    //child.visible = false;
                    // toRemove.push(child)
                    // child.receiveShadow = false;
                    // child.castShadow = false;
                }

                else if (name.substring(0, 5) === 'Floor') {
                    //Replace textures and add to floor collision
                    hullCollision.push(child)
                    const textureTemp = loader.load('../Objects/Textures/Floor/Ground049B_1K_Color.jpg')
                    textureTemp.wrapS = textureTemp.wrapT = THREE.RepeatWrapping;
                    textureTemp.repeat.set(11, 11)
                    const normal = loader.load('../Objects/Textures/Floor/Ground049B_1K_NormalGL.jpg')
                    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
                    normal.repeat.set(11, 11)

                    const newMat = new THREE.MeshPhongMaterial({
                        map: textureTemp,
                        normalMap: normal,
                        shininess: 0
                    })
                    child.castShadow = false;
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


            for (const i of toRemove){
                root.remove(i)
            }

            //Add group to scene
            scene.add(root);



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
            //Callback to ensure that the scene is loaded (will only run when scene is loaded due to .load of GLTF loader)
            callback();

        });

        //callback();
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
     * Method to build the player using THREE objects
     * @returns {THREE.Mesh} Player mesh
     */
    static buildPlayer() {
        //Player colours
        const colorRed = new THREE.Color('#BC4937');
        const colorPeach = new THREE.Color('#F7C0A3');
        const colorBlack = new THREE.Color('#000000');

        //Define geometries
        const torseGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.5);
        const armGeometry = new THREE.BoxGeometry(0.4, 1.1, 0.4);
        const handGeometry = new THREE.BoxGeometry(0.36, 0.2, 0.36);
        const headGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.4);
        const eyeGeometry = new THREE.PlaneGeometry(0.1, 0.2);
        const legGeometry = new THREE.BoxGeometry(0.45, 0.8, 0.45);


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
        const armRightPivot = new THREE.Object3D()
        armRightPivot.add(armRight.translateY(-0.4));
        armRight.name = 'armRight';
        armRightPivot.name = 'armRightPivot';
        const armLeft = new THREE.Mesh(armGeometry, redMat);
        const armLeftPivot = new THREE.Object3D()
        armLeftPivot.add(armLeft.translateY(-0.4));
        armLeft.name = 'armLeft';
        armLeftPivot.name = 'armLeftPivot';

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
        const legLeft = new THREE.Mesh(legGeometry, blackMat);
        legLeft.name = 'legLeft';
        const legRight = new THREE.Mesh(legGeometry, blackMat);
        legRight.name = 'legRight';

        //Add limbs + head to torse
        torsoMesh.add(armRightPivot.translateX(-0.8).translateY(0.5).rotateY(Math.PI));
        torsoMesh.add(armLeftPivot.translateX(0.8).translateY(0.5).rotateY(Math.PI));
        torsoMesh.add(head.translateY(0.7))
        torsoMesh.add(legRight.translateX(-0.25).translateY(-0.8))
        torsoMesh.add(legLeft.translateX(0.25).translateY(-0.8))

        //Add eyes to head slight in front of head to avoid clipping
        head.add(eyeLeft.translateX(0.15).translateZ(0.201).translateY(0.15));
        head.add(eyeRight.translateX(-0.15).translateZ(0.201).translateY(0.15));

        //Add hands to arms
        armRight.add(handRight.translateY(-0.6));
        armLeft.add(handLeft.translateY(-0.6));

        //set up arms 
        armRightPivot.rotateX(Math.PI / 2)
        //armLeftPivot.rotateY(Math.PI / 4)





        return torsoMesh;
    }

    static addGun(scene) {
        const gltfLoader = new GLTFLoader(manager);

        const url = '../Objects/Weapons/m4_2.gltf'
        gltfLoader.load(url, (gltf) => {
            const weapon = gltf.scene
            weapon.name = 'weaponsM4'
            weapon.translateX(0.2)
            weapon.scale.set(0.7, 0.7, 0.7)
            weapon.rotateX(Math.PI / 2)



            scene.getObjectByName('handRight').add(weapon)

        });

        const muzzelFlashGeo = new THREE.ConeGeometry(0.3, 0.7, 16)
        const muzzleFlash = new THREE.Mesh(muzzelFlashGeo, new THREE.MeshPhongMaterial({
            color: new THREE.Color('#FFA500'),
            emissiveMap: emissiveMapTex,
            emissive: new THREE.Color('#FFA500'),
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.7
        }))
        //Translate muzzle flash to be in position with gun
        muzzleFlash
            .translateZ(0.11)
            .translateX(0.2)
            .translateY(-1);

        muzzleFlash.name = 'muzzleFlash'
        glowing.push(muzzleFlash)
        muzzleFlash.visible = false;
        //Add muzzleflash to hand to ensure it will be in the glowing objects when called
        scene.getObjectByName('handRight').add(muzzleFlash)
    }

    /**
     * Function to turn OFF street light shadows
     */
    static turnOffLightShadow() {
        for (const light of streetLights) {
            light.castShadow = false
        }
    }

    /**
     * Function to turn ON street light shadows
     */
    static turnOnLightShadow() {
        for (const light of streetLights) {
            light.castShadow = true
        }
    }

    /**
     * Function get all objects that must be glowing
     * @returns {Array.<THREE.Object3D>} The glowing objects
     */
    static getGlowing() {
        return glowing
    }

    /**
     * Function get all the stationary targets' positions
     * @returns {Array.<THREE.Object3D>} The positions of the targets
     */
    static getTargetsStill() {
        return targetsStill
    }

    /**
     * Function get all the moving targets' positions
     * @returns {Array.<THREE.Object3D>} The positions of the targets
     */
    static getTargetsMoving() {
        return targetsMoving
    }

}


export { BuildWorld };