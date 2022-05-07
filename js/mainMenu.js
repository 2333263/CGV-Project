const width=window.innerWidth+20
const height=window.innerHeight+20
var scaleFitNative = Math.min(width / 1900, height / 935)
var X_LEFT = (-width / 2) * scaleFitNative;    // The xy limits for the coordinate system.
var X_RIGHT = (width / 2) * scaleFitNative;
var Y_BOTTOM = (height / 2) * scaleFitNative;
var Y_TOP = (-height / 2) * scaleFitNative;
var pixelSize;



class MainMenu{
    constructor(){
        this.canvas=document.createElement("canvas")


        var graphics = this.canvas.getContext("2d")
    }
}
export{MainMenu}