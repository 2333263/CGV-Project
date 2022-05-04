var dpr=window.devicePixelRatio
const conversionW=window.innerWidth/1900
const conversionH=window.innerHeight/935
const width=window.innerWidth
const height=window.innerHeight


console.log(dpr)
class HUD{
    constructor(currammo,totalammo, totaltarget, currtargets){
        this.currammo=currammo
        this.totalammo=totalammo
        this.document=document
        this.canvas=document.createElement("canvas")
        this.canvas.id="HUD";
        this.canvas.width=width
        this.canvas.height=height
        this.totaltarget=totaltarget
        this.currtargets=currtargets

//var body=document.getElementsByTagName("body")[0];
//document.body.appendChild(this.canvas)

//body.appendChild(this.canvas)
var scaleFillNative=Math.max(width/1900,height/935)
var scaleFitNative=Math.min(width/1900,height/935)


var X_LEFT = (-width/2)*scaleFitNative;    // The xy limits for the coordinate system.
var X_RIGHT = (width/2)*scaleFitNative;
var Y_BOTTOM = (height/2)*scaleFitNative;
var Y_TOP = (-height/2)*scaleFitNative;
var pixelSize;
var gamestate=0 //0 is playing, -1 fail, 1 win, 2 paused


var graphics=this.canvas.getContext("2d")




this.updateTargetNumbers=function(totaltarget,currtargets){
    graphics.save();
    graphics.setTransform(1, 0, 0, 1, 0, 0)
    graphics.clearRect(0,0,this.canvas.width,this.canvas.height)
    graphics.restore();
    this.totaltarget=totaltarget;
    this.currtargets=currtargets;
}


applyLimits(graphics, X_LEFT, X_RIGHT, Y_TOP, Y_BOTTOM, false);
graphics.lineWidth=pixelSize
//graphics.scale(width/1900,height/935)
//graphics.translate(width/2,height/2)

//graphics.scale(scaleFitNative,scaleFitNative)

this.draw=function(){
    if(this.currammo==0 || this.currtargets==this.totaltarget){

        graphics.font="60px Arial"
        var word="";
        if  (this.currammo==0) {word="level failed"
        gamestate=-1 //failed
        graphics.fillStyle="rgb(255,0,0)"}
        else {word="level complete"
        gamestate=1 //win
        graphics.fillStyle="rgb(0,255,0)"
        }
        graphics.fillText(word,-200,0 ) }
        else{
graphics.clearRect(0,0,width,height)
graphics.save();
drawCrossHair()
graphics.restore();
graphics.save()
bulletCount(this.currammo,this.totalammo)
graphics.restore();
graphics.save();
graphics.translate(X_LEFT+115,Y_BOTTOM-18)
graphics.scale(0.6,0.6)
drawBullet();
graphics.translate(25,0)
drawBullet();
graphics.translate(25,0)
drawBullet();
graphics.restore();
graphics.save();
targetCount(this.currtargets,this.totaltarget);
graphics.restore();
graphics.save();
graphics.translate(X_LEFT+90,Y_TOP+30)
drawTarget();
graphics.restore();}

};

function drawCrossHair(){
    graphics.save();
    for(var i=0;i<4;i++){
    graphics.rotate(Math.PI/2);
    drawLine(0,2,0,15);
    }
    graphics.restore();
    filledCircle();
}

function drawLine(x1, y1, x2,y2){
    graphics.beginPath();
    graphics.moveTo(x1,y1);
    graphics.lineTo(x2,y2);
    graphics.stroke();
}

function drawTarget(){
graphics.save()
graphics.fillStyle="rgb(25,25,25)"
graphics.scale(30,30)
graphics.translate(0,-0.35);
filledCircle();
graphics.scale(0.75,0.75);
graphics.fillStyle="white"
filledCircle();
graphics.scale(0.75,0.75)
graphics.fillStyle="rgb(25,25,25)"
filledCircle();
graphics.scale(0.25,0.25)
graphics.fillStyle="white"
filledCircle();
graphics.restore();

}

function drawCustomPoly(points,size){
    graphics.beginPath();
    graphics.moveTo(points[0][0],points[0][1]);
    for (var i=1;i<points.length;i++){
        graphics.lineTo(points[i][0],points[i][1]);
    }
    graphics.lineTo(points[0][0],points[0][1]);
    var currwidth=graphics.lineWidth
    graphics.lineWidth=size
    graphics.stroke();
    graphics.lineWidth=currwidth
}

function fillCustomPoly(points, size){
    graphics.beginPath();
    graphics.moveTo(points[0][0],points[0][1]);
    for (var i=1;i<points.length;i++){
        graphics.lineTo(points[i][0],points[i][1]);
    }
    graphics.lineTo(points[0][0],points[0][1]);
    var currwidth=graphics.lineWidth
    graphics.lineWidth=size
    graphics.fill();
    graphics.lineWidth=currwidth
}
function circle() { // Strokes a circle, diameter = 1, center = (0,0)
    graphics.beginPath();
    graphics.arc(0, 0, 0.5, 0, 2 * Math.PI);
    graphics.stroke();
}

function filledCircle() { // Fills a circle, diameter = 1, center = (0,0)
    graphics.beginPath();
    graphics.arc(0, 0, 0.5, 0, 2 * Math.PI);
    graphics.fill();
}

function bulletCount(currammo,totalammo){
    graphics.fillStyle="rgb(25,25,25)"
    graphics.font="30px Arial"
    var word=currammo+" / "+totalammo;
    graphics.fillText(word,X_LEFT+10,Y_BOTTOM-10 )
}
function targetCount(currHits,totaltarget){
    graphics.fillStyle="rgb(25,25,25)"
    graphics.font="30px Arial"
    var word=currHits+" / "+totaltarget;
    graphics.fillText(word,X_LEFT+10,Y_TOP+30)
}
function drawBullet(){
    graphics.save();
    graphics.lineWidth=1;
    
    fillCustomPoly([[-10,-10],[-10,10],[10,10],[10,-10]],0.1)
    fillCustomPoly([[-10,-10],[-10,10],[10,10],[10,-10]],0.1)
    graphics.fillStyle="white"
    graphics.translate(0,23);
    fillCustomPoly([[-10,-10],[-10,-12],[10,-12],[10,-10]],0.1)
    graphics.fillStyle="rgb(25,25,25)"
    fillCustomPoly([[-10,-10],[-10,-5],[10,-5],[10,-10]],0.1)
    graphics.restore();
    graphics.save();
    graphics.lineWidth=1;
    graphics.fillStyle="rgb(25,25,25)"
    graphics.translate(0,-13);
    graphics.scale(2,2)
    semiCircle(0.1)
    graphics.fillStyle="white"
    fillCustomPoly([[-5,1],[-5,0],[5,0],[5,1]],0.1)
    graphics.restore();
    
}

function semiCircle(size){
    graphics.beginPath();
    graphics.moveTo(-5,0)
    graphics.lineTo(5,0);
    graphics.bezierCurveTo(5,-8,-5,-8,-5,0);
    var currwidth=graphics.lineWidth
    graphics.lineWidth=size
    graphics.fill();
    graphics.lineWidth=currwidth

}
this.updateAmmoCount=function(currammo,totalammo){
    graphics.save();
    graphics.setTransform(1, 0, 0, 1, 0, 0)
    graphics.clearRect(0,0,this.canvas.width,this.canvas.height)
    graphics.restore();
    this.currammo=currammo;
    this.totalammo=totalammo;
   
}

this.getCanvas=function(){
    return(this.canvas)
}
this.increaseTarget=function(){
    this.currtargets++
    this.updateTargetNumbers(this.totaltarget,this.currtargets)
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
export{HUD};