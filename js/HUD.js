import {leaderBoard} from "../js/LeaderBoard.js"
const width=window.innerWidth+20
const height=window.innerHeight+20

class HUD {
    constructor(currammo, totalammo, totaltarget, currtargets) {

        //Variable Init
        this.currammo = currammo;
        this.totalammo = totalammo;
        this.document = document;
        this.canvas = document.createElement("canvas");
        this.canvas.id = "HUD";
        this.canvas.width = width;
        this.canvas.height = height;
        this.totaltarget = totaltarget;
        this.currtargets = currtargets;
        this.gamestate = 0;  //0 is playing, -1 fail, 1 win, 2 paused
        this.startTime=0;
        this.timetaken=99999;
        this.pausedtime=0;
        this.timepaused=0;
        this.entered=true;
        this.Paused=false;
        this.loading=false;
        this.cansend=false
        this.name="";
        this.leaderBoard=new leaderBoard();
        this.level=1
        this.ricked=false
        var scaleFitNative = Math.min(width / 1900, height / 935);

        //XY Dimensions Init
        var X_LEFT = (-width / 2);
        var X_RIGHT = (width / 2);
        var Y_BOTTOM = (height / 2);
        var Y_TOP = (-height / 2);
        var pixelSize;
        var graphics = this.canvas.getContext("2d");

        /**
         * Updates the number of targets on the level
         * @param {int} totaltarget 
         * @param {int} currtargets 
         */
        this.updateTargetNumbers = function (totaltarget, currtargets) {
            graphics.save();
            graphics.setTransform(1, 0, 0, 1, 0, 0);
            graphics.clearRect(0, 0, this.canvas.width, this.canvas.height);
            graphics.restore();
            this.totaltarget = totaltarget;
            this.currtargets = currtargets;
        };

        /**
         * Creates the start time of the level
         * @function setStartTime
         */
        this.setStartTime=function(){
            let d = new Date();
            let sec=d.getSeconds()+d.getMilliseconds()/1000;
            let min =d.getMinutes()+sec/60;
            this.startTime =d.getHours()+min/60;
        };

        //Start time init
        this.setStartTime();

        //Apply Limits, courtesy of Richard Klein
        applyLimits(graphics, X_LEFT, X_RIGHT, Y_TOP, Y_BOTTOM, false);
        graphics.lineWidth = pixelSize;

        //Adds an input
        this.addInput=function(){
            var input=document.createElement("input")
            input.type = 'text';
            input.style.position = 'fixed';
            input.style.left = (width/2)-150 + 'px';
            input.style.top = (height/2) + 'px';
            input.id="input";
            input.addEventListener("keypress",function(e){
                var keyCode = e.keyCode;
                if (keyCode == 13) {
                    document.body.removeChild(document.body.lastElementChild);
                }
            })
            input.className="input";
            document.body.appendChild(input).focus;
            input.focus();
        };
        this.isLoading=function(currentWorld,banana){ var random=Math.floor(Math.random()  * 8);

            this.loading=true
            var loadingScreen=document.createElement("canvas")
            
            loadingScreen.style.position = 'fixed';
            loadingScreen.style.left = 0+'px';
            loadingScreen.style.top = 0 + 'px';
            loadingScreen .width = width;
            loadingScreen.height = height;
           
            loadingScreen.id="loadingScreen";
            graphics = loadingScreen.getContext("2d");
            
            graphics.fillStyle = "black";
            graphics.fillRect(0,0,width,height)
            var size=60*scaleFitNative;
            graphics.font = String(size)+"px Arial";
            graphics.fillStyle = "rgb(255,255,255)";
            
            if(currentWorld=="Start"){graphics.font = String(size)+"px Courier";
                size=80*scaleFitNative;
                var bottom=1*height/4;
               
               var names=["Ben","Jeremy","Justin","Lazarus","Lior"]
               for (let i=0; i<names.length; i++)
               {
                graphics.fillText(names[i], width/2-size, bottom);
                bottom+= size}
               
                bottom+=2* size
                graphics.fillText("Present", width/2-size, bottom);
                }
                else{
                    drawImage(graphics,random,banana);
           
                    var word=""
                     
                if((currentWorld)==1 ||(currentWorld)==2 || (currentWorld)==3 ){
                 word = "Loading Level "+currentWorld;}
                 else {
                     word= "Loading "+currentWorld;
                 }
            graphics.fillText(word, width/2-size/2*word.length/2, 3*height/4);}
            
            graphics = this.canvas.getContext("2d");
            document.body.appendChild(loadingScreen).focus;
            
        };
        function drawImage(graphics, random,banana){
            graphics.save();
            var sign=new Image()
            var path=""
            if(!banana){
            path=filePath+"Textures/Signs/Normal/sign_"+random
            }else{
            path=filePath+"Textures/Signs/Banana/sign_"+random
            }
            sign.src=path+".png"
            var scales=500
            sign.onload = function() {
                
                graphics .drawImage(
                  sign,
                  width/2-2*scales*scaleFitNative/2,
                  height/2- 4*scales*scaleFitNative/5,
                  2*scales*scaleFitNative,
                  1*scales*scaleFitNative
                );
                
              };
              graphics.restore()
            
            
        };
        //Sets the entered value of the HUD to true when called
        this.setEntered=function(){
            this.entered=true
        };

        //Draw function of HUD, responsible for handling all the elements of the HUD
        this.draw = function (level,banana) 
            {graphics.clearRect(X_LEFT, Y_TOP, (X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP)
            if(this.Paused){
                graphics.fillStyle="rgba(0,0,0,0.6)";
                fillCustomPoly([[X_LEFT,Y_TOP],[X_RIGHT,Y_TOP],[X_RIGHT,Y_BOTTOM],[X_LEFT,Y_BOTTOM]]);
                graphics.fillStyle = "black";
                var size=30*scaleFitNative;
                graphics.font = String(size)+"px Arial";
                graphics.fillStyle = "rgb(255,255,255)";
                var word = "Paused";
                graphics.fillText(word,    -size/2*word.length/2, -40);
                word="Press R to restart";
                graphics.fillText(word,  -size/2*word.length/2, 0);
                word="Click anywhere to resume";
                graphics.fillText(word,  -size/2*word.length/2, 40);
                word="Press M to return to Main Menu";
                graphics.fillText(word,  -size/2*word.length/2, 80);
                return;
            }
            if (!this.checkgameState(level,banana)) {
                graphics.save();
                drawCrossHair(this.level);
                graphics.restore();
                graphics.save();
                drawTime(this.startTime);
                graphics.restore();
                graphics.save();
                graphics.translate(X_LEFT+20,Y_BOTTOM-20)
                this.drawAmmo()
                graphics.restore();
                graphics.save()
                graphics.translate(X_RIGHT-140*scaleFitNative,Y_TOP+35*scaleFitNative)
                this.drawTargetObject()
               graphics.restore()
                graphics.restore();
            }
        };

        this.drawAmmo=function(){
            graphics.save()
            this.bulletCount(this.currammo, this.totalammo);
            graphics.translate(120*scaleFitNative,-8*scaleFitNative)
            graphics.scale(0.6*scaleFitNative, 0.6*scaleFitNative);
                drawBullet();
                graphics.translate(25, 0);
                drawBullet();
                graphics.translate(25, 0);
                drawBullet();
            graphics.restore()
        }
        this.drawTargetObject=function(){
            graphics.save();
            this.targetCount(this.currtargets, this.totaltarget);
            graphics.translate(120*scaleFitNative,(-0.5)*scaleFitNative)
            drawTarget();
            graphics.restore();
        }

        //Checks the gamestate and returns either a true or false value
        this.checkgameState=function(level,banana) {
            if (this.currammo == 0 || this.currtargets == this.totaltarget) {
                graphics.fillStyle="rgba(0,0,0,0.6)";
                fillCustomPoly([[X_LEFT,Y_TOP],[X_RIGHT,Y_TOP],[X_RIGHT,Y_BOTTOM],[X_LEFT,Y_BOTTOM]]);
                var size=60*scaleFitNative;
                graphics.font = String(size)+"px Arial";
                var word = "";
                var bottom=Y_TOP+50;
                if ( this.currtargets == this.totaltarget) { 
                    if(level==4){
                    if(this.gamestate==0){
                        this.timetaken=getTimeElappsedSec(this.startTime);
                        this.entered=false;
                        this.addInput();

                    }
                    if(this.entered==true &&this.cansend==true){
                        var size=60*scaleFitNative;
                        graphics.font = String(size)+"px monospace";
                        var top=this.leaderBoard.getNearest10(this.timetaken);
                        graphics.fillStyle = "rgb(255,255,255)";
                        graphics.fillText("Leaderboard", X_LEFT+200, Y_TOP+50*scaleFitNative);
                        for (var i=0 ;i<top.length; i++){
                            graphics.fillText(top[i],  X_LEFT+200, bottom+60*scaleFitNative);
                            bottom=bottom+60*scaleFitNative;
                        }
                        graphics.fillText("Congrats your position is "+this.leaderBoard.getPos(0,this.timetaken)+" with a time of "+this.timetaken, X_LEFT+200*scaleFitNative,bottom+60*scaleFitNative);
                        this.leaderBoard.Cequest++;
                        bottom+=60*scaleFitNative;
                        var specialtime=160 //incentive to get a good time
                        if(banana){
                            specialtime-=35
                        }
                         word="Try complete all 3 levels in under "+specialtime+" sec"
                        if(this.timetaken<specialtime){ //if good time acheived, told about 'banana mode'
                            if(!banana){
                            graphics.fillStyle = "rgb(255,0,0)";
                            word="Enter 'banana' on the main menu for a suprise"
                            }else{
                            word="Thank you for playing our game"
                               
                        }
                        }
                       
                        graphics.fillText(word,  X_LEFT+200, bottom+60*scaleFitNative)
                        word=""
                        bottom+=60*scaleFitNative;
                        
                        
                        if((this.timetaken<specialtime)&& banana){
                            this.ricked=true
                            graphics.fillText("Click for a special suprise!!", X_LEFT+200, bottom+60*scaleFitNative)}
                            else{
                                graphics.fillText("click anywhere to return to the main menu",  X_LEFT+200, bottom+60*scaleFitNative)
                            }
                        
                    }   
                    else{
                        if (!document.getElementById("input") &&this.entered==false) { 
                            this.entered=true;
                            this.leaderBoard.addItem(this,this.name, this.timetaken, function(parent){
                                parent.cansend=true
                            });
                        }
                        if(this.entered==false){ 
                            this.name=(document.getElementById("input").value.toUpperCase())
                        }
                        word = "Level complete! Please enter your name and press enter.";
                        this.gamestate = 1; //win
                        graphics.fillStyle = "rgb(0,255,0)";
                        graphics.fillText("Your Time: "+this.timetaken, X_LEFT+200*scaleFitNative, Y_TOP+250*scaleFitNative)
                        graphics.fillText("NOTE: Your name will get cut off at 8 characters", X_LEFT+200*scaleFitNative, Y_TOP+800*scaleFitNative)
                    }
                }else{
                    this.gamestate=1
                }
                }
                else {
                    word = "Level failed. You ran out of ammunition.";
                    this.gamestate = -1; //failed
                    graphics.fillStyle = "rgb(255,0,0)";
                }
                var instruct="Click anywhere to restart.";
                graphics.fillText(word, X_LEFT+200*scaleFitNative, Y_TOP+450*scaleFitNative);
                if(this.gamestate!=1){
                    graphics.fillText(instruct, X_LEFT+200*scaleFitNative,Y_TOP+350*scaleFitNative);
                }
                return true;
            }
            else {return false;}
        };
        
        //Checks the state of the game with regards to it being paused and logic it should execute thereof
        this.isPaused = function (paused) {
            if(paused){
                if(this.Paused==false) {
                    this.pausedtime =getTimeElappsed(this.startTime);
                   
                }
                this.Paused=true;
            }
            else{  
                if(this.Paused==true){ 
                    if(getTimeElappsed(this.startTime)>=this.pausedtime) {
                        this.startTime+=getTimeElappsed(this.startTime) - this.pausedtime
                                       }
                    else {
                        this.setStartTime()
                    }
                }
                this.Paused=false;
            }
        };
        this.clear=function(){
            graphics.fillStyle="rgba(0,0,0,0.6)";
                fillCustomPoly([[X_LEFT,Y_TOP],[X_RIGHT,Y_TOP],[X_RIGHT,Y_BOTTOM],[X_LEFT,Y_BOTTOM]]);
        }
        this.changeLevel=function(level){
            this.level=level
        }
        //Draws the crosshair
        function drawCrossHair(level) {
            graphics.save();
            graphics.fillStyle="black";
            for (var i = 0; i < 4; i++) {
                if(level>1){
                graphics.rotate(Math.PI / 2);
                var size=graphics.lineWidth
                graphics.lineWidth=size*2
                graphics.strokeStyle="black"
                drawLine(0, 2, 0, 15);
                graphics.lineWidth=size
                graphics.strokeStyle="white"
                drawLine(0, 2, 0, 15);
                graphics.strokeStyle="black"

                }else{
                graphics.rotate(Math.PI / 2);
                drawLine(0, 2, 0, 15);
                }
            }
            graphics.restore();
            graphics.fillStyle="black";
            filledCircle();
        };

        //Draws the time indicator
        function drawTime(startTime){
          
            graphics.fillStyle = "rgb(255,255,255)";
            var size=30*scaleFitNative;
            graphics.font = String(size)+"px Arial";
            var word = ""+ getTimeElappsedSec(startTime);
            graphics.strokeStyle ="rgb(0,0,0)";
            graphics.lineWidth=1.2*scaleFitNative;
            graphics.strokeText(word, -40-word.length*5, Y_TOP + 30);
            graphics.fillText(word, -40-word.length*5, Y_TOP + 30);
         
        }

        //Returns the elapsed time of the given run
        function getTimeElappsed(startTime){
            let d = new Date();
            let sec=d.getSeconds()+d.getMilliseconds()/1000;
            let min =d.getMinutes()+sec/60;
            let hour =d.getHours()+min/60;
            return (hour-startTime);
        }

        //Returns the elapsed time of the given run (sec)
        function getTimeElappsedSec(startTime){
            return (getTimeElappsed(startTime)*60*60).toFixed(2);
        }

        //Basic draw line function
        function drawLine(x1, y1, x2, y2) {
            graphics.beginPath();
            graphics.moveTo(x1, y1);
            graphics.lineTo(x2, y2);
            graphics.stroke();
        }

        //Draws the target symbol on the HUD
        function drawTarget() {
            graphics.save();
            graphics.fillStyle = "rgb(25,25,25)";
            graphics.scale(30, 30);
            graphics.translate(0, -0.35);
            filledCircle();
            graphics.scale(0.75, 0.75);
            graphics.fillStyle = "white";
            filledCircle();
            graphics.scale(0.75, 0.75);
            graphics.fillStyle = "rgb(25,25,25)";
            filledCircle();
            graphics.scale(0.25, 0.25);
            graphics.fillStyle = "white";
            filledCircle();
            graphics.restore();

        }


        //Fills a custom polygon
        function fillCustomPoly(points, size) {
            graphics.beginPath();
            graphics.moveTo(points[0][0], points[0][1]);
            for (var i = 1; i < points.length; i++) {
                graphics.lineTo(points[i][0], points[i][1]);
            }
            graphics.lineTo(points[0][0], points[0][1]);
            var currwidth = graphics.lineWidth;
            graphics.lineWidth = size;
            graphics.fill();
            graphics.lineWidth = currwidth;
        }


        //Fills a custom circle
        function filledCircle() { // Fills a circle, diameter = 1, center = (0,0)
            graphics.beginPath();
            graphics.arc(0, 0, 0.5, 0, 2 * Math.PI);
            graphics.fill();
        }

        //Draws the current bullet count indicator text
        this.bulletCount=function(currammo, totalammo) {
            graphics.fillStyle = "rgb(255,255,255)";
            var size=30*scaleFitNative;
            graphics.font = String(size)+"px Arial";
            var word = currammo + " / " + totalammo;
            graphics.strokeStyle ="rgb(0,0,0)";
            graphics.lineWidth=1.2*scaleFitNative;
            graphics.strokeText(word, 0, 0);
            graphics.fillText(word,0, 0);
        }

        //Draws the current target count indicator text
        this.targetCount=function(currHits, totaltarget) {
            graphics.fillStyle = "rgb(255,255,255)";
            var size=30*scaleFitNative;
            graphics.font = String(size)+"px Arial";
            var word = currHits + " / " + totaltarget;
            graphics.strokeStyle ="rgb(0,0,0)";
            graphics.lineWidth=1.2*scaleFitNative;
            graphics.strokeText(word,  0, 0);
            graphics.fillText(word, 0,0);
        }
        this.setBullets=function(currBullets,totalBullets){
            this.currammo=currBullets
            this.totalammo=totalBullets
        }
        this.setTargets=function(currTargets,totalTargets){
            this.currtargets=currTargets;
            this.totaltarget=totalTargets;
        }
        //Draws the bullet indicator shape
        function drawBullet() {
            graphics.save();
            graphics.lineWidth = 1;
            graphics.fillStyle = "rgb(25,25,25)";
            fillCustomPoly([[-10, -10], [-10, 10], [10, 10], [10, -10]], 0.1);
            fillCustomPoly([[-10, -10], [-10, 10], [10, 10], [10, -10]], 0.1);
            graphics.fillStyle = "white";
            graphics.translate(0, 23);
            fillCustomPoly([[-10, -10], [-10, -12], [10, -12], [10, -10]], 0.1);
            graphics.fillStyle = "rgb(25,25,25)";
            fillCustomPoly([[-10, -10], [-10, -5], [10, -5], [10, -10]], 0.1);
            graphics.restore();
            graphics.save();
            graphics.lineWidth = 1;
            graphics.fillStyle = "rgb(25,25,25)";
            graphics.translate(0, -13);
            graphics.scale(2, 2);
            semiCircle(0.1);
            graphics.fillStyle = "white";
            fillCustomPoly([[-5, 1], [-5, 0], [5, 0], [5, 1]], 0.1);
            graphics.restore();

        }

        //Fills a custom semi-circle
        function semiCircle(size) {
            graphics.beginPath();
            graphics.moveTo(-5, 0);
            graphics.lineTo(5, 0);
            graphics.bezierCurveTo(5, -8, -5, -8, -5, 0);
            var currwidth = graphics.lineWidth;
            graphics.lineWidth = size;
            graphics.fill();
            graphics.lineWidth = currwidth;
        }

        //Updates the ammo count of the current run
        this.updateAmmoCount = function (currammo) {
            graphics.save();
            graphics.setTransform(1, 0, 0, 1, 0, 0);
            graphics.clearRect(0, 0, this.canvas.width, this.canvas.height);
            graphics.restore();
            this.currammo = currammo;
        }

        //Returns the current canvas
        this.getCanvas = function () {
            return (this.canvas);
        }

        //Increase the current target count
        this.increaseTarget = function () {
            this.currtargets++;
            this.updateTargetNumbers(this.totaltarget, this.currtargets);
        }

        //Apply limits function to fix the scaling of screen on multiple aspect ratios, courtesy of Richard Klein
        function applyLimits(g, xleft, xright, ytop, ybottom, preserveAspect) {
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
    };
};
//Final export
export { HUD };