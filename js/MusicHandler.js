import * as THREE from 'three';
class musicHandler{
    constructor(camera){
        this.playing=false;
        this.camera=camera
        this.listener = new THREE.AudioListener();
        this.listener.setMasterVolume = 1;
        this.camera.add(this.listener)
        this.backgroundSound = new THREE.Audio(this.listener);
        this.audioLoader = new THREE.AudioLoader();
        this.audioLoader.parent=this
        this.init=function(backgroundSound){
            this.audioLoader.load("js/GameMusic.mp3", function (buffer) {
                backgroundSound.setBuffer(buffer);
                backgroundSound.setLoop(true);
                backgroundSound.setVolume(0.4);
                backgroundSound.play();
            });
            this.playing=true;
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