import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { threeToCannon, ShapeType } from 'three-to-cannon';

class threeToCannonObj{
    constructor(){
        
    }
    static getCannonMesh (threeOBJ, meshType = 'HULL'){
        //Optional param of item type
        var result = null;

        switch(meshType){
            case 'CYLINDER':
                result = threeToCannon(threeOBJ, {type: ShapeType.CYLINDER});
                break;
            case 'HULL':
                result = threeToCannon(threeOBJ, {type: ShapeType.HULL});
                break;
            default:
                //If meshtype invalid, make a convext hull
                result = threeToCannon(threeOBJ, {type: ShapeType.HULL});
                break;
        }
        
        const quaternionObj = threeOBJ.quaternion //Set offset and quaternion manually
        const offsetObj = threeOBJ.position
    
        const objCollisionBody=new CANNON.Body()
        objCollisionBody.addShape(result.shape, offsetObj, quaternionObj)
        return objCollisionBody
    }
}

export {threeToCannonObj};