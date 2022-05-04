import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { threeToCannon, ShapeType } from 'three-to-cannon';

class threeToCannonObj{
    constructor(){
        
    }
    static getCannonMesh (threeOBJ){
        //WARNING JANKY CODE ------------------------------------------------------------------------
        //Convert root to cannon object
        const result = threeToCannon(threeOBJ, {type: ShapeType.BOX});
        
        const quaternionObj = threeOBJ.quaternion //Set offset and quaternion manually
        const offsetObj = threeOBJ.position
    
        const objCollisionBody=new CANNON.Body()
        objCollisionBody.addShape(result.shape, offsetObj, quaternionObj)
        return objCollisionBody
        //-------------------------------------------------------------------------------------------
    }
}

export {threeToCannonObj};