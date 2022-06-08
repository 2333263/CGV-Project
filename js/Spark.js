import * as THREE from 'three';


const sparkDist = 1.5
//Essentially speed
const lifeTime = 0.2

/**
 * @classdesc Gun Spark object
 */
class SPARK {
    /**Spark object on bullet collision
    * @constructor
    * @param {THREE.Vector3} startPos Position where the spark is created
    * @param {int} startTime Time when the spark was created in seconds
    * @param {THREE.Scene} scene The scene where the spark must be created
    */
    constructor(startPos, startTime, scene) {
        this.startTime = startTime;
        this.startPos = startPos;
        this.startLoc = {
            x: startPos.x,
            y: startPos.y,
            z: startPos.z
        }

        //Create mesh sparks
        this.endLocs = [];
        this.particles = [];
        //this.spark

        for (var i = 0; i < 18; i++) {

            const endLoc = {
                x: startPos.x,
                y: startPos.y,
                z: startPos.z
            }
            endLoc.x += THREE.MathUtils.randFloat(-sparkDist, sparkDist);
            endLoc.y += THREE.MathUtils.randFloat(-sparkDist, sparkDist);
            endLoc.z += THREE.MathUtils.randFloat(-sparkDist, sparkDist);
            this.endLocs.push(endLoc);
            const sparkGeo = new THREE.BoxGeometry(0.10, 0.10, 0.10);
            const sparkMat = new THREE.MeshPhongMaterial({
                color: new THREE.Color('#FFFF00'),
                emissive: new THREE.Color('#FFFF00'),
                emissiveIntensity: 1,
                transparent: true,
                opacity: 1
            });
            const spark = new THREE.Mesh(sparkGeo, sparkMat);

            spark.position.copy(new THREE.Vector3(this.startLoc.x, this.startLoc.y, this.startLoc.z));
            const randRot = THREE.MathUtils.randInt(-Math.PI, Math.PI);

            spark.rotation.set(randRot, randRot, randRot)

            scene.add(spark)
            this.particles.push(spark)
        }

        /**
        * Function to update the position of the spark based on linear interpolation
        * @param {int} currTime Current time in seconds
        */
        this.updatePos = function (currTime) {
            const timeScale = (currTime - this.startTime) / lifeTime;

            //Update particle properties over time using interpolation (THREE.MathUtils.lerp)
            for (let i = 0; i < this.endLocs.length; i++) {
                const currLoc = {
                    x: THREE.MathUtils.lerp(this.startLoc.x, this.endLocs[i].x, timeScale),
                    y: THREE.MathUtils.lerp(this.startLoc.y, this.endLocs[i].y, timeScale),
                    z: THREE.MathUtils.lerp(this.startLoc.z, this.endLocs[i].z, timeScale)
                }
                //Move particles outwards
                this.particles[i].position.copy(new THREE.Vector3(currLoc.x, currLoc.y, currLoc.z));

                //Scale particle sizes
                var scaleValue = THREE.MathUtils.lerp(1, 0, timeScale)
                if (scaleValue < 0) {
                    scaleValue = 0;
                }
                this.particles[i].scale.set(scaleValue, scaleValue, scaleValue)
            }
        }

        /**
         * Gets the time of spark creation
         * @returns {int} Time when the spark was created in seconds
         */
        this.getCreateTime = function () {
            return this.startTime;
        }

        /**
         * Functions to delete and dispose of the object in the scene
         */
        this.delete = function () {
            for (const spark of this.particles) {
                //Delete and dispose
                spark.geometry.dispose();
                spark.material.dispose();
                scene.remove(spark)

            }
        }


    }

} export { SPARK }