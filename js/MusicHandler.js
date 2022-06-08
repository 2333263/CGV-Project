import * as THREE from 'three';
/**music class
 * @classdesc
 */
class musicHandler{
    /**music handeler constructor
    * @constructor
     */
    constructor(camera, banana){
        /**
        * @param {boolean} isPlaying keep track of if audio is playing
        * @param {THREE.PerspectiveCamera} camera listener is attached to camera
        * @param {THREE.AudioListener} listner audio is attached to listener
        * @param {THREE.Audio} backgroundSound 
        * @param {THREE.AudioLoader} audioLoader loads the music track 
        */
        this.playing=false;
        this.camera=camera
        this.listener = new THREE.AudioListener();
        this.listener.setMasterVolume = 1;
        this.camera.add(this.listener)
        this.backgroundSound = new THREE.Audio(this.listener);
        this.audioLoader = new THREE.AudioLoader();
        this.audioLoader.parent=this
        this.init=function(backgroundSound,banana){
            try{
                let audiourl;
                if(banana){
                    audiourl=filePath+"Sound Effects/bananaTrack.mp3";
                }
                else{audiourl=filePath+"Sound Effects/GameMusic.mp3"}
            this.audioLoader.load(audiourl, function (buffer) {
               try {backgroundSound.setBuffer(buffer);
              
                backgroundSound.setLoop(true);
                backgroundSound.setVolume(0.4);
                backgroundSound.play();}
                catch{}
            });
            this.playing=true;
        }catch (error){
            this.playing=false
        }
        }
        
        this.pause=function(){
            if(this.playing==true){
            this.backgroundSound.pause();
            this.playing=false;
            }
        }
        
        this.play=function(){
            if(this.playing==false){
            this.backgroundSound.play();
            this.playing=true;
            }
        }
    }
    
    
    }

export {musicHandler}