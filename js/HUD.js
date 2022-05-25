import {leaderBoard} from "../js/LeaderBoard.js"
const width=window.innerWidth+20
const height=window.innerHeight+20

class HUD {
    constructor(currammo, totalammo, totaltarget, currtargets) {

        //Varible Init
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
        this.name="";
        this.leaderBoard=new leaderBoard();
        var scaleFitNative = Math.min(width / 1900, height / 935);

        //XY Scalings
        var X_LEFT = (-width / 2);
        var X_RIGHT = (width / 2);
        var Y_BOTTOM = (height / 2);
        var Y_TOP = (-height / 2);
        var pixelSize;
        var graphics = this.canvas.getContext("2d");

        //Updates the number of targets on the level
        this.updateTargetNumbers = function (totaltarget, currtargets) {
            graphics.save();
            graphics.setTransform(1, 0, 0, 1, 0, 0);
            graphics.clearRect(0, 0, this.canvas.width, this.canvas.height);
            graphics.restore();
            this.totaltarget = totaltarget;
            this.currtargets = currtargets;
        };

        //Creates the start time of the level
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
                    console.log(input.id);
                    document.body.removeChild(document.body.lastElementChild);
                }
            })
            input.className="input";
            document.body.appendChild(input).focus;
            input.focus();
        };

        //Sets the entered value of the HUD to true when called
        this.setEntered=function(){
            this.entered=true
        };

        //Draw function of HUD, responsible for handling all the elements of the HUD
        this.draw = function () {graphics.clearRect(X_LEFT, Y_TOP, (X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP)
            if(this.Paused){
                graphics.fillStyle="rgba(0,0,0,0.6)";
                fillCustomPoly([[X_LEFT,Y_TOP],[X_RIGHT,Y_TOP],[X_RIGHT,Y_BOTTOM],[X_LEFT,Y_BOTTOM]]);
                graphics.fillStyle = "black";
                var size=30*scaleFitNative;
                graphics.font = String(size)+"px Arial";
                graphics.fillStyle = "rgb(255,255,255)";
                var word = "Paused";
                graphics.fillText(word, -20, -40);
                word="Press R to restart";
                graphics.fillText(word, -20, 0);
                word="Click anywhere to resume";
                graphics.fillText(word, -20, 40);
                word="Press M to return to Main Menu";
                graphics.fillText(word, -20, 80);
                return;
            }
            if (!this.checkgameState()) {
                graphics.save();
                drawCrossHair();
                graphics.restore();
                graphics.save();
                bulletCount(this.currammo, this.totalammo);
                graphics.restore();
                graphics.save();
                drawTime(this.startTime);
                graphics.restore();
                graphics.save();
                graphics.translate(X_LEFT + 115, Y_BOTTOM - 18);
                graphics.scale(0.6, 0.6);
                drawBullet();
                graphics.translate(25, 0);
                drawBullet();
                graphics.translate(25, 0);
                drawBullet();
                graphics.restore();
                graphics.save();
                targetCount(this.currtargets, this.totaltarget);
                graphics.restore();
                graphics.save();
                graphics.translate(X_RIGHT - 20, Y_TOP + 30);
                drawTarget();
                graphics.restore();
            }
        };

        //Checks the gamestate and returns either a true or false value
        this.checkgameState=function() {
            if (this.currammo == 0 || this.currtargets == this.totaltarget) {
                graphics.fillStyle="rgba(0,0,0,0.6)";
                fillCustomPoly([[X_LEFT,Y_TOP],[X_RIGHT,Y_TOP],[X_RIGHT,Y_BOTTOM],[X_LEFT,Y_BOTTOM]]);
                var size=60*scaleFitNative;
                graphics.font = String(size)+"px Arial";
                var word = "";
                var bottom=Y_TOP+50;
                if ( this.currtargets == this.totaltarget) { 
                    if(this.gamestate==0){
                        this.timetaken=getTimeElappsedSec(this.startTime);
                        this.entered=false;
                        this.addInput();
                    }
                    if(this.entered==true){
                        var size=60*scaleFitNative;
                        graphics.font = String(size)+"px monospace";
                        var top=this.leaderBoard.getTop10();
                        graphics.fillStyle = "rgb(255,255,255)";
                        graphics.fillText("Top "+top.length, X_LEFT+200, Y_TOP+50*scaleFitNative);
                        for (var i=0 ;i<top.length; i++){
                            graphics.fillText(top[i],  X_LEFT+200, bottom+60*scaleFitNative);
                            bottom=bottom+60*scaleFitNative;
                        }
                        graphics.fillText("Congrats your position is "+this.leaderBoard.getPlayer(this.name,this.timetaken)+" with a time of "+this.timetaken, X_LEFT+200,bottom+60*scaleFitNative);
                        bottom+=60*scaleFitNative;
                    }   
                    else{
                        if (!document.getElementById("input") &&this.entered==false) { 
                            this.entered=true;
                            this.leaderBoard.addItem(this.name, this.timetaken);
                        }
                        if(this.entered==false){ 
                            this.name=(document.getElementById("input").value.toUpperCase())
                        }
                        word = "Level complete! Please enter your name and press enter";
                        this.gamestate = 1; //win
                        graphics.fillStyle = "rgb(0,255,0)";
                        graphics.fillText("Your Time: "+this.timetaken, X_LEFT+200, Y_TOP+250)
                    }
                }
                else {
                    word = "Level failed. You ran out of ammunition.";
                    this.gamestate = -1; //failed
                    graphics.fillStyle = "rgb(255,0,0)";
                }
                var instruct="Click anywhere to restart.";
                graphics.fillText(word, X_LEFT+200, Y_TOP+450);
                if(this.gamestate!=1){
                    graphics.fillText(instruct, X_LEFT+200,Y_TOP+350);
                }
                return true;
            }
            else {return false;}
        };
        
        //Checks the state of the game with regards to it being paused and logic it should execute thereof
        this.isPaused = function (paused) {
            if(paused && this.gamestate==0){
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

        //Draws the crosshair
        function drawCrossHair() {
            graphics.save();
            graphics.fillStyle="black";
            for (var i = 0; i < 4; i++) {
                graphics.rotate(Math.PI / 2);
                drawLine(0, 2, 0, 15);
            }
            graphics.restore();
            graphics.fillStyle="black";
            filledCircle();
        };

        //Draws the time indicator
        function drawTime(startTime){
          
            graphics.fillStyle = "rgb(25,25,25)";
            var size=30*scaleFitNative;
            graphics.font = String(size)+"px Arial";
            var word = ""+ getTimeElappsedSec(startTime);
            graphics.strokeStyle ="rgb(255,255,255)";
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

        //Outlines a custom polygon
        function drawCustomPoly(points, size) {
            graphics.beginPath();
            graphics.moveTo(points[0][0], points[0][1]);
            for (var i = 1; i < points.length; i++) {
                graphics.lineTo(points[i][0], points[i][1]);
            }
            graphics.lineTo(points[0][0], points[0][1]);
            var currwidth = graphics.lineWidth;
            graphics.lineWidth = size;
            graphics.stroke();
            graphics.lineWidth = currwidth;
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

        //Outlines a custom circle
        function circle() { // Strokes a circle, diameter = 1, center = (0,0)
            graphics.beginPath();
            graphics.arc(0, 0, 0.5, 0, 2 * Math.PI);
            graphics.stroke();
        }

        //Fills a custom circle
        function filledCircle() { // Fills a circle, diameter = 1, center = (0,0)
            graphics.beginPath();
            graphics.arc(0, 0, 0.5, 0, 2 * Math.PI);
            graphics.fill();
        }

        //Draws the current bullet count indicator text
        function bulletCount(currammo, totalammo) {
            graphics.fillStyle = "rgb(25,25,25)";
            var size=30*scaleFitNative;
            graphics.font = String(size)+"px Arial";
            var word = currammo + " / " + totalammo;
            graphics.strokeStyle ="rgb(255,255,255)";
            graphics.lineWidth=1.2*scaleFitNative;
            graphics.strokeText(word, X_LEFT + 10, Y_BOTTOM - 10);
            graphics.fillText(word, X_LEFT + 10, Y_BOTTOM - 10);
        }

        //Draws the current target count indicator text
        function targetCount(currHits, totaltarget) {
            graphics.fillStyle = "rgb(25,25,25)";
            var size=30*scaleFitNative;
            graphics.font = String(size)+"px Arial";
            var word = currHits + " / " + totaltarget;
            graphics.strokeStyle ="rgb(255,255,255)";
            graphics.lineWidth=1.2*scaleFitNative;
            graphics.strokeText(word,  X_RIGHT-110, Y_TOP + 30);
            graphics.fillText(word, X_RIGHT-110, Y_TOP + 30);
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