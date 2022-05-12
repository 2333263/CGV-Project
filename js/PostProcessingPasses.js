import * as THREE from 'three';
import * as POSTPROCESSING from "postprocessing";



/*
//USING BUILT IN THREE.JS POST PROCESSING
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, controls.getObject());
composer.addPass(renderPass);


//new UnrealBloomPass(RES: {x: 512, y: 512}, STRENGTH : 2.0, RADIUS: 0.0, THRESHOLD : 0.75);
const unrealBloomPass = new UnrealBloomPass({x: 512, y: 512}, 0.2, 0.0, 0.25);
composer.addPass(unrealBloomPass);
*/

class POSTPROCESSINGPASSES {
    constructor() {

    }
    
    /**
     * Apply preset Post Processing effects to the scene
     * @param {THREE.WebGLRenderer} renderer The renderer to be used
     * @param {THREE.PerspectiveCamera} camera The camera to be used
     * @param {THREE.Scene} scene The scene to be used
     * @param {THREE.DirectionalLight | THREE.PointLight} mainLight The light to be used
     * @returns {POSTPROCESSING.EffectComposer} The composer with post processing applied
     */
    static doPasses(renderer, camera, scene, mainLight) {
        const composer = new POSTPROCESSING.EffectComposer(renderer);
        composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));

        const areaImage = new Image();
        areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;
        const searchImage = new Image();
        searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;
        const smaaEffect = new POSTPROCESSING.SMAAEffect(searchImage, areaImage, 1);

        //New Bloom Effect
        const bloomEffect = new POSTPROCESSING.BloomEffect({
            luminanceThreshold: 0.45,
            intensity: 0.5

        })
        const bloomPass = new POSTPROCESSING.EffectPass(
            camera,
            bloomEffect
        );

        //Add some chromatic aberration for visual effect
        const chromaticAberrationEffect = new POSTPROCESSING.ChromaticAberrationEffect({ blendFunction: 13, offset: new THREE.Vector2(1e-3, 5e-4) })
        const chromaticAberationPass = new POSTPROCESSING.EffectPass(
            camera,
            //
            chromaticAberrationEffect
        );

        //Sun material (changed color og volumetric lighting)
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffddaa,
            transparent: true,
            fog: false
        });

        //Sun to act as volumetric source
        const sunGeometry = new THREE.SphereBufferGeometry(10, 32, 32);
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.frustumCulled = false;
        sun.matrixAutoUpdate = false;


        //Copy sun position to where light is
        const group = new THREE.Group();
        group.position.copy(mainLight.position);
        group.add(sun);

        //Add volumetric lighting with antialias
        const godRayEffect = new POSTPROCESSING.GodRaysEffect(
            camera,
            sun,
            {
                height: 480,
                density: 1,
                decay: 0.92,
                weight: 0.5,
                exposure: 0.54,
                samples: 30,
                clampMax: 1.0
            })
        const godRayPass = new POSTPROCESSING.EffectPass(
            camera,
            smaaEffect,
            godRayEffect
        )





        //Add to different passes composer
        composer.addPass(godRayPass);

        composer.addPass(bloomPass);

        //composer.addPass(chromaticAberationPass)

        return composer;
    }
}
export {POSTPROCESSINGPASSES};