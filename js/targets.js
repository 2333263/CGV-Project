import * as THREE from 'three';
//added a comment to force update
const loader = new THREE.TextureLoader();

class Targets{
    /**
     * 
     * @param {int} name Number of the target
     * @param {THREE.Vector3} position Position of the target
     * @param {THREE.Quaternion} quaternion Rotation of the target
     * @param {THREE.Vector3} endPoint Target's endpoint for motion
     */
    constructor(name, position, quaternion, endPoint){
        this.geometry=new THREE.CylinderGeometry(1,1,0.01,32);
        this.CrossMat=new THREE.MeshBasicMaterial({
            map: loader.load("/CGV-Project/Objects/Textures/Targets/crosstarget.png")
          
        })
        this.TickMat=new THREE.MeshBasicMaterial({
            map: loader.load("/CGV-Project/Objects/Textures/Targets/correctTarget.jpg")

        })
        this.cylinder=new THREE.Mesh(this.geometry,this.CrossMat)
        /*
        this.cylinder.translateX(tX)
        this.cylinder.translateY(tY)
        this.cylinder.translateZ(tZ)
        */
        // this.cylinder.rotation.x=Math.PI/2
        // this.cylinder.rotation.y=Math.PI/2
        this.cylinder.position.copy(position)
        this.cylinder.quaternion.copy(quaternion)
        this.isHit=false;
        this.cylinder.name=name
        this.endPoint=endPoint
        this.startPoint=position
        this.moves=false
        this.moveX=false
        this.moveY=false
        this.moveZ=false
        this.getCylinder=function (){
            return this.cylinder
        };
    this.hit=function(){
        this.isHit=true;
        this.cylinder.material=this.TickMat
    }
    }
}
export {Targets}