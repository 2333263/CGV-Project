import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { threeToCannon, ShapeType } from 'three-to-cannon';

class threeToCannonObj{
    constructor(){
        
    }

    /**
     * Convert a THREE.Mesh to a CANNON.Body
     * @param {THREE.Mesh} threeOBJ The object to be converted
     * @param {string} meshType An optioanl param to determing the body's shape
     * @returns {CANNON.Body} The finished body with collisions
     */
    static getCannonMesh (threeOBJ, meshType = 'HULL'){
        //Optional param of item type
        var result = null;

        switch(meshType){
            case 'CYLINDER':
                result = threeToCannon(threeOBJ, {type: ShapeType.CYLINDER});
                break;
            case 'BOX':
                result = threeToCannon(threeOBJ, {type: ShapeType.BOX});
                break;
            default:
                //If meshtype invalid, make a convext hull
                result = threeToCannon(threeOBJ, {type: ShapeType.HULL});
                break;
        }
        
        //Set offset and quaternion manually
        const quaternionObj = threeOBJ.quaternion 
        const offsetObj = threeOBJ.position
        const planeMaterial = new CANNON.Material({
            friction: 10,
            restitution: 0
        })
        const objCollisionBody=new CANNON.Body({
            material: planeMaterial
        })
        objCollisionBody.addShape(result.shape, offsetObj, quaternionObj)
        return objCollisionBody
    }
}

export {threeToCannonObj};