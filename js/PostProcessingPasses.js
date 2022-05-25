import * as THREE from 'three';
import * as POSTPROCESSING from "postprocessing";

var BlendFunction = {
    SKIP: 0,
    ADD: 1,
    ALPHA: 2,
    AVERAGE: 3,
    COLOR_BURN: 4,
    COLOR_DODGE: 5,
    DARKEN: 6,
    DIFFERENCE: 7,
    EXCLUSION: 8,
    LIGHTEN: 9,
    MULTIPLY: 10,
    DIVIDE: 11,
    NEGATION: 12,
    NORMAL: 13,
    OVERLAY: 14,
    REFLECT: 15,
    SCREEN: 16,
    SOFT_LIGHT: 17,
    SUBTRACT: 18
  };

/* ################################# DEPRECATED ######################################
//USING BUILT IN THREE.JS POST PROCESSING
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, controls.getObject());
composer.addPass(renderPass);


//new UnrealBloomPass(RES: {x: 512, y: 512}, STRENGTH : 2.0, RADIUS: 0.0, THRESHOLD : 0.75);
const unrealBloomPass = new UnrealBloomPass({x: 512, y: 512}, 0.2, 0.0, 0.25);
composer.addPass(unrealBloomPass);
*/
const areaImage = new Image();
areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;
const searchImage = new Image();
searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;
const smaaEffect = new POSTPROCESSING.SMAAEffect(searchImage, areaImage, 1);

class POSTPROCESSINGPASSES {
    constructor() {}
    /**
     * Apply preset Post Processing effects to the scene
     * @param {THREE.WebGLRenderer} renderer The renderer to be used
     * @param {THREE.PerspectiveCamera} camera The camera to be used
     * @param {THREE.Scene} scene The scene to be used
     * @param {THREE.DirectionalLight | THREE.PointLight} mainLight The light to be used
     * @returns {POSTPROCESSING.EffectComposer} The composer with post processing applied
     */
    static doPasses(renderer, camera, scene, mainLight) {

        //Const Init
        const composer = new POSTPROCESSING.EffectComposer(renderer);
        composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));

        //New Bloom Effect
        const bloomEffect = new POSTPROCESSING.BloomEffect({luminanceThreshold: 0.45,intensity: 0.6});
        //Bloom Pass
        const bloomPass = new POSTPROCESSING.EffectPass(camera,bloomEffect);

        //Add some chromatic aberration for visual effect
        const chromaticAberrationEffect = new POSTPROCESSING.ChromaticAberrationEffect({ blendFunction: 13, offset: new THREE.Vector2(1e-4, 5e-5) });
        const chromaticAberationPass = new POSTPROCESSING.EffectPass(camera,chromaticAberrationEffect);

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
            });
        const godRayPass = new POSTPROCESSING.EffectPass(
            camera,
            smaaEffect,
            godRayEffect
        );

        //Colour Depth Init Const
        const colorDepthEffect = new POSTPROCESSING.ColorDepthEffect({ bits: 16 });
        const colorDepthPass = new POSTPROCESSING.EffectPass(camera, smaaEffect, colorDepthEffect)

        //Add to different passes composer
        composer.addPass(godRayPass);
        composer.addPass(bloomPass);

        //Return
        return composer;
    }

    //Selective bloom pass
    static selectiveBloomPass(composer, camera, scene, glowing) {
        const selectiveBloomEffect = new POSTPROCESSING.SelectiveBloomEffect(
            scene, camera, 
            {
            luminanceThreshold: 0.1,
            intensity: 4
        })

        //TODO: Comments maybe?
        const selection = selectiveBloomEffect.selection;
        for (var selectedObject of glowing){
            //console.log(glowing)
            selection.add(selectedObject);
        } 
        selectiveBloomEffect.selection = selection;
        selectiveBloomEffect.ignoreBackground = true;
        selectiveBloomEffect.inverted = false;

        const blendMode = selectiveBloomEffect.blendMode
        blendMode.setBlendFunction(BlendFunction.SCREEN);
        selectiveBloomEffect.blendMode = blendMode;
        
        const selectiveBloomPass = new POSTPROCESSING.EffectPass(
            camera,
            //smaaEffect,
            selectiveBloomEffect
        )

        const depthEff = new POSTPROCESSING.DepthEffect()
        const depthPass = new POSTPROCESSING.EffectPass(
            camera,
            depthEff
        )
        composer.addPass(selectiveBloomPass)
        return composer
    }
}
//Final Export
export { POSTPROCESSINGPASSES };