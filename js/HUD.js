const width=window.innerWidth-20
const height=window.innerHeight-20
var X_LEFT = -width/2;    // The xy limits for the coordinate system.
var X_RIGHT = width/2;
var Y_BOTTOM = height/2;
var Y_TOP = -height/2;
var pixelSize;


class HUD{
    constructor(currammo,totalammo){
        this.currammo=currammo
        this.totalammo=totalammo
        this.document=document
        this.canvas=document.createElement("canvas")
        this.canvas.id="HUD";
        this.canvas.width=width-20;
        this.canvas.height=height-20;
    

//var body=document.getElementsByTagName("body")[0];
//document.body.appendChild(this.canvas)

//body.appendChild(this.canvas)
var graphics=this.canvas.getContext("2d")




//applyLimits(graphics, X_LEFT, X_RIGHT, Y_TOP, Y_BOTTOM, false);
graphics.scale(width/1900,height/935)
graphics.translate(width/2,height/2)


this.draw=function(){
graphics.clearRect(0,0,width/1900,height/935)
graphics.save();
//graphics.scale(10,10)
//semiCircle(0.1)
drawCrossHair()
graphics.restore();
bulletCount(this.currammo,this.totalammo)
graphics.save();
graphics.translate(X_LEFT+200,Y_BOTTOM-130)
graphics.scale(0.6,0.6)
drawBullet();
graphics.translate(25,0)
drawBullet();
graphics.translate(25,0)
drawBullet();
graphics.restore();
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
    graphics.fillText(word,X_LEFT+70,Y_BOTTOM-120)
}
function drawBullet(){
    graphics.save();
    graphics.lineWidth=1;
    graphics.fillStyle="rgb(25,25,25)"
    fillCustomPoly([[-10,-10],[-10,10],[10,10],[10,-10]],0.1)
    graphics.translate(0,23);
    fillCustomPoly([[-10,-10],[-10,-5],[10,-5],[10,-10]],0.1)
    graphics.restore();
    graphics.save();
    graphics.lineWidth=1;
    graphics.fillStyle="rgb(25,25,25)"
    graphics.translate(0,-13);
    graphics.scale(2,2)
    semiCircle(0.1)
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

function applyLimits(g, xleft, xright, ytop, ybottom, preserveAspect) {
    var width = canvas.width;   // The width of this drawing area, in pixels.
    var height = canvas.height; // The height of this drawing area, in pixels.
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