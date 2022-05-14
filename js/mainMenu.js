const width=window.innerWidth+20;
const height=window.innerHeight+20;
var scaleFitNative = Math.min(width / 1900, height / 935);
var X_LEFT = (-width / 2);    // The xy limits for the coordinate system.
var X_RIGHT = (width / 2);
var Y_BOTTOM = (height / 2);
var Y_TOP = (-height / 2);
var pixelSize;



class MainMenu{
    constructor() {
        //#########################this.canvas Init#########################
        this.canvas = document.createElement("canvas")
        this.canvas.id = "mainMenu";
        this.canvas.width = width;
        this.canvas.height = height;
        //#########################mainMenu variables init#########################
        this.callMenu=true;
        this.graphics = this.canvas.getContext("2d");
        //graphics.translate(width/2, height/2);
        
        applyLimits(this.graphics, X_LEFT, X_RIGHT, Y_TOP, Y_BOTTOM, false);
        this.graphics.lineWidth = pixelSize;
        

        
        //#########################functions#########################

        //?
        this.getMenu=function(){
            return this.canvas
        }

        //Ok this one I know what it is
        this.draw=function() {
            this.graphics.clearRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP)
            
          var g = this.graphics;
            g.fillStyle = "rgba(172, 166, 166, 0.90)";
            var size = 1/3000*Y_BOTTOM*60/100*X_RIGHT*60/100;
            g.font = String(size)+"px Courier";
            g.fillRect(X_LEFT*50/100,
                       Y_TOP*20/100,
                       -X_LEFT,
                       Y_TOP*20/100)
            g.fillRect(X_LEFT*50/100,
                       Y_TOP*-10/100,
                       -X_LEFT,
                       Y_TOP*20/100)
            g.fillRect(X_LEFT*50/100,
                       Y_TOP*-40/100,
                       -X_LEFT,
                       Y_TOP*20/100)
            g.fillRect(X_LEFT*50/100,
                       Y_TOP*-70/100,
                       -X_LEFT,
                       Y_TOP*20/100);

            //Words
            g.fillStyle = 'rgb(0,0,0)';
            var word = "PLAY";
            g.fillText(word,X_LEFT*7/100,Y_TOP*26/100);
            var word = "LEADERBOARD";
            g.fillText(word,X_LEFT*20/100,Y_TOP*-4/100);
            var word = "OPTIONS";
            g.fillText(word,X_LEFT*12/100,Y_TOP*-34/100);
            var word = "CREDITS";
            g.fillText(word,X_LEFT*12/100,Y_TOP*-64/100);
            }

            this.Clicked=function(posX,posY){
                var centerX=(width/2)
                var centerY=height/2
                //converts click coords to canvas coords
                posX=(posX-centerX)
                posY=(posY-centerY)

                if(posX>=X_LEFT*50/100 && posX<=(X_LEFT*50/100)+X_RIGHT){//check to see if theyre clicking in the right place on the x plane
                    if(posY<=Y_TOP*20/100 && posY>=(Y_TOP*20/100)+(Y_TOP*20/100)){//if they click in the same Y position as the play button, return 0
                        return(0)
                    }else if(posY<=Y_TOP*-10/100 && posY>=(Y_TOP*-10/100)+(Y_TOP*20/100)){//if they click in the same position as the leader board return 1
                        console.log("LeaderBoard");
                        return (1) 
                    }else if(posY<=Y_TOP*-40/100 && posY>=(Y_TOP*-40/100)+(Y_TOP*20/100)){//if they click in the same Y position as the options button return 2
                        console.log("options")
                        return(2)
                    }else if(posY<=Y_TOP*-70/100 && posY>=(Y_TOP*-70/100)+(Y_TOP*20/100)){ //if they click in the same Y position as the credits button return 3
                        console.log("credits")
                        return(3)
                    }
                }
            }

            function applyLimits(g, xleft, xright, ytop, ybottom, preserveAspect) {
                //var width = this.canvas.width;   // The width of this drawing area, in pixels.
                //var height = this.canvas.height; // The height of this drawing area, in pixels.
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