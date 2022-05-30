import * as THREE from '../node_modules/three/build/three.module.js';
import * as CANNON from '../node_modules/cannon-es/dist/cannon-es.js';

const loader = new THREE.TextureLoader();

class Targets{
    /**
     * 
     * @param {int} name Number of the target
     * @param {THREE.Vector3} position Position of the target
     * @param {THREE.Quaternion} quaternion Rotation of the target
     * @param {THREE.Vector3} endPoint Target's endpoint for motion
     */
    constructor(name, position, quaternion,level,scene){
        this.geometry=new THREE.CylinderGeometry(1,1,0.01,32);
        this.CrossMat=new THREE.MeshBasicMaterial({
            map: loader.load("../Objects/Textures/Targets/crosstarget.png")
        });
        this.TickMat=new THREE.MeshBasicMaterial({
            map: loader.load("../Objects/Textures/Targets/correctTarget.jpg")
        });
        this.cylinder=new THREE.Mesh(this.geometry,this.CrossMat)
        /*######################### DEPRECATED ###########################
        this.cylinder.translateX(tX)
        this.cylinder.translateY(tY)
        this.cylinder.translateZ(tZ)
        this.cylinder.rotation.x=Math.PI/2
        this.cylinder.rotation.y=Math.PI/2
        */
        this.cylinder.position.copy(position)
        this.cylinder.quaternion.copy(quaternion)
        this.isHit=false;
        this.cylinder.name=name
        this.cp=[]
        this.moves=false
        this.id=-1
        this.getCylinder=function (){
            return this.cylinder
        };
    this.hit=function(){
        this.isHit=true;
        this.cylinder.material=this.TickMat
    }

    this.moveTarget=function(time,size){
        //time*=0.001
        const ptime=time*0.01
        const ndx=this.cylinder.id
        const u=ptime+ndx/size
        var pos=new THREE.Vector3()
        var nextPos=new THREE.Vector3()
        this.curve.getPointAt(u%1,pos)
        pos.applyMatrix4(this.curveObject.matrixWorld)
        this.curve.getPointAt((u+0.01)%1,nextPos)
        nextPos.applyMatrix4(this.curveObject.matrixWorld)
        var tempQuat=new THREE.Vector3()
        tempQuat.copy(this.cylinder.quaternion)
        this.cylinder.position.copy(pos)
        this.cylinder.lookAt(nextPos)
        this.cylinder.position.lerpVectors(pos,nextPos,0.5)
        this.cylinder.rotateX(Math.PI/2)
        this.cylinder.rotateZ(Math.PI/2)
       // this.cylinder.quaternion.copy(tempQuat)
        
    }

    this.enableMove=function(id,critPoints){
                    this.id=id
                    this.moves=true
                    this.cp=critPoints
                    const p0=new THREE.Vector3();
                    const p1=new THREE.Vector3();
                    this.curve=new THREE.CatmullRomCurve3(
                    this.cp.map((p,ndx)=>{
                    p0.set(...p);
                    p1.set(...this.cp[(ndx+1)%this.cp.length]);
                    return[
                        (new THREE.Vector3()).copy(p0),
                        (new THREE.Vector3()).lerpVectors(p0, p1, 0.1),
                        (new THREE.Vector3()).lerpVectors(p0, p1, 0.9),
                      ];
                    }).flat(),
                    true,
                  );
                {   
                    const points=this.curve.getPoint(250)
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({color: 0xff0000});
                    this.curveObject = new THREE.Line(geometry, material);
                    material.depthTest=false;
                    this.curveObject.renderOrder=1
                    //this.curveObject.scale.set(100,100,100)
                    scene.add(this.curveObject)
                }
    
    }
    }
}
//Final Export
export {Targets}