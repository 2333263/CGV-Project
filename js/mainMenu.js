const width=window.innerWidth+20;
const height=window.innerHeight+20;
var scaleFitNative = Math.min(width / 1900, height / 935);
var X_LEFT = (-width / 2) * scaleFitNative;    // The xy limits for the coordinate system.
var X_RIGHT = (width / 2) * scaleFitNative;
var Y_BOTTOM = (height / 2) * scaleFitNative;
var Y_TOP = (-height / 2) * scaleFitNative;
var pixelSize;



class MainMenu{
    constructor() {
        //#########################canvas Init#########################
        this.canvas=document.createElement("canvas");
        this.canvas.id = "mainMenu";
        this.canvas.width = width;
        this.canvas.height = height;

        //#########################mainMenu variables init#########################
        this.callMenu=true;
        var graphics = this.canvas.getContext("2d");
        applyLimits(graphics, X_LEFT, X_RIGHT, Y_TOP, Y_BOTTOM, false);
        graphics.lineWidth = pixelSize;

        //#########################functions#########################

        //Idk what this does but I think Lior might use it
        this.addInput=function() {
            var input=document.createElement("input")
            input.type = 'text';
            input.style.position = 'fixed';
            input.style.left = (width/2)-150 + 'px';
            input.style.top = (height/2) + 'px';
            input.id="input"
            input.addEventListener("keypress",function(e){
                var keyCode = e.keyCode;
                if (keyCode == 13) {
                    ///console.log(this.entered)
                    ///console.log(document.body.getElementsByClassName("input"))
                    //drawText(this.value, parseInt(this.style.left, 10), parseInt(this.style.top, 10));

                    console.log(input.id)
                    document.body.removeChild(document.body.lastElementChild)
                    
                    //console.log("removed")
                   // hasInput = false;
                   
                }
            })
            
            input.className="input"
            document.body.appendChild(input).focus;

            input.focus();

            //hasInput = true;        
        }

        //Same for this one
        this.callMenu=function(bool){
            this.callMenu=bool;
        }

        //Ok this one I know what it is
        this.draw = function() {
            graphics.clearRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP)

            if (!callMenu) {return;} 
            
            g = graphics;
            g.fillColor = black;
            g.fillRect(X_LEFT+30/100*X_RIGHT,
                       Y_TOP-30/100*Y_TOP,
                       X_RIGHT*40/100,
                       Y_TOP*10/100)
        }

        function applyLimits(g, xleft, xright, ytop, ybottom, preserveAspect) {
            //var width = canvas.width;   // The width of this drawing area, in pixels.
            //var height = canvas.height; // The height of this drawing area, in pixels.
            if (preserveAspect) {
                // Adjust the limits to match the aspect ratio of the drawing area.
                var displayAspect = Math.abs(height / width);
                var requestedAspect = Math.abs((ybottom - ytop) / (xright - xleft));
                var excess;
                if (displayAspect > requestedAspect) {
                    excess = (ybottom - ytop) * (displayAspect / requestedAspect - 1);
                    ybottom += excess / 2;
                    ytop -= excess / 2;
                }
                else if (displayAspect < requestedAspect) {
                    excess = (xright - xleft) * (requestedAspect / displayAspect - 1);
                    xright += excess / 2;
                    xleft -= excess / 2;
                }
            }
            var pixelWidth = Math.abs((xright - xleft) / width);
            var pixelHeight = Math.abs((ybottom - ytop) / height);
            pixelSize = Math.min(pixelWidth, pixelHeight);
            g.scale(width / (xright - xleft), height / (ybottom - ytop));
            g.translate(-xleft, -ytop);
        }
    }
}
export{MainMenu}