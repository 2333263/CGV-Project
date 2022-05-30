import * as THREE from 'three';
class stormClouds{    //not used yet
    //this.
    let loader = new THREE.TextureLoader();
    loader.load("../Objects/Textures/Skybox/cloud/smoke-particle-texture.png", function(texture){

        cloudGeo = new THREE.PlaneBufferGeometry(500,500);
        cloudMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true
        });

        for(let p=0; p<25; p++) {
            let cloud = new THREE.Mesh(cloudGeo,cloudMaterial);
            cloud.position.set(
                Math.random()*800 -400,
                    500,
                Math.random()*500 - 450
                );
            cloud.rotation.x = 1.16;
            cloud.rotation.y = -0.12;
            cloud.rotation.z = Math.random()*360;
            cloud.material.opacity = 0.6;
            scene.add(cloud);
        }
    });
}
