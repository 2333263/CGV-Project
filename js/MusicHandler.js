import * as THREE from 'three';
class musicHandler{
    constructor(camera, banana){
        this.playing=false;
        this.camera=camera
        this.listener = new THREE.AudioListener();
        this.listener.setMasterVolume = 1;
        this.camera.add(this.listener)
        this.backgroundSound = new THREE.Audio(this.listener);
        this.audioLoader = new THREE.AudioLoader();
        this.audioLoader.parent=this
        this.init=function(backgroundSound){
            try{
                let audiourl;
                if(banana){
                    audiourl="js/bananaTrack.mp3";
                }
                else{audiourl="js/GameMusic.mp3"}
            this.audioLoader.load(audiourl, function (buffer) {
                backgroundSound.setBuffer(buffer);
                backgroundSound.setLoop(true);
                backgroundSound.setVolume(0.4);
                backgroundSound.play();
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