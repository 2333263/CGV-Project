import {leaderBoard} from "../js/LeaderBoard.js"
const width=window.innerWidth+20;
const height=window.innerHeight+20;
var scaleFitNative = Math.min(width / 1900, height / 935);
var X_LEFT = (-width / 2);    // The xy limits for the coordinate system.
var X_RIGHT = (width / 2);
var Y_BOTTOM = (height / 2);
var Y_TOP = (-height / 2);
var pixelSize;
var lb=new leaderBoard(); 


class MainMenu{
    constructor() {
        //#########################this.canvas Init#########################
        this.canvas = document.createElement("canvas")
        this.canvas.id = "mainMenu";
        this.canvas.width = width;
        this.canvas.height = height;
        this.page=0
        //#########################mainMenu variables init#########################
        this.callMenu=true;
        this.graphics = this.canvas.getContext("2d");
        //graphics.translate(width/2, height/2);
        
        applyLimits(this.graphics, X_LEFT, X_RIGHT, Y_TOP, Y_BOTTOM, false);
        this.graphics.lineWidth = pixelSize;
        

        
        //#########################functions#########################

        this.getMenu=function(){
            return this.canvas
        }

        //Ok this one I know what it is
        this.draw=function() {//this function draws a different screen depending on what page the person is on
           switch(this.page){
               case 0://main menu
                   this.drawMainMenu();
                   break;
                case 1://leaderboard
                    this.drawLeaderboard();
                    break;
                case 2://options
                    break;
                case 3://credits
                    this.drawCredits();
                    break;
                
           }
            }
            this.drawMainMenu=function(){//draws the main menu
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
            this.drawLeaderboard=function(){//this function draws the leaderboard on the screen
                this.graphics.clearRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP)
                this.graphics.fillStyle="rgba(255,255,255,0.6)"
                this.graphics.fillRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP);
                var size=60*scaleFitNative
                this.graphics.font = String(size)+"px monospace"
                var all=lb.getAll()
                this.graphics.fillStyle = "rgb(0,0,0)"
                this.graphics.fillText("Top Players:", X_LEFT+200*scaleFitNative, Y_TOP+50*scaleFitNative)
                var bottom=Y_TOP+60*scaleFitNative
                for (var i=0 ;i<all.length; i++){
                    
                    this.graphics.fillText(all[i],  X_LEFT+200, bottom+60*scaleFitNative)
                    bottom=bottom+60*scaleFitNative
                }
                this.drawBackButton()
                this.drawNextButton()
                
               
            }
            this.drawCredits=function(){//this draws the credits on the screen
                this.graphics.clearRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP)
                this.graphics.fillStyle="rgba(255,255,255,0.6)"
                this.graphics.fillRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP);
            /*put the credits in here----> */var credits=[ 
                "H.Developers","Justin Knopfmacher: 2356115 ","Lior Becker: 2333263","Benjamin Servant: 2420656","Stuart 'Lazarus' Groves: 2356823","Jeremy Stott: 2368841",
                "H.Models","Unless otherwise stated, all were handcrafted by developement team in JS code or Blender","Lamp Post Model:",
                "H.Textures","Unless otherwise stated, handcrafted by developement team in JS code or PowerPoint", "Icons used in textures from Microsoft 365 illustrations","Skybox Texture:Pieter ‘Spiney’ Verhoeven: http://www.spiney.me/ ",
                "H.Audio", "BGM: Original composition by Jeremy Stott", "Gun sound effect: ",
                "H.Dependencies","Cannon es", "ThreeToCannon", "Three.js modules: Orbit controls, Pointer lock controls, Stats, Postprossing"

            ]
                var size=35*scaleFitNative
                this.graphics.font = "bold "+String(size)+"px monospace";
                this.graphics.fillStyle = "rgb(0,0,0)"
                this.graphics.fillText("Credits:", X_LEFT+200*scaleFitNative, Y_TOP+50*scaleFitNative)
                var bottom=Y_TOP+50*scaleFitNative
                for(var i=0;i<credits.length;i++){
                    if(credits[i].startsWith("H.")) this.graphics.font="bold "+String(size)+"px monospace"; //H. used to indicate headings so that they can be made bold
                    else  this.graphics.font = String(size)+"px monospace"
                    this.graphics.fillText(credits[i].replace("H.",""),  X_LEFT+200, bottom+35*scaleFitNative)
                    bottom=bottom+35*scaleFitNative
                }
                this.drawBackButton()
                
            }
            this.drawBackButton=function(){//this draws a back button in the bottom left corner
                this.graphics.fillStyle = "rgba(172, 166, 166, 0.90)";
                this.graphics.fillRect(X_LEFT,Y_BOTTOM-90*scaleFitNative,180*scaleFitNative,90*scaleFitNative)
                this.graphics.fillStyle = 'rgb(0,0,0)';
                var size = 1/3000*Y_BOTTOM*60/100*X_RIGHT*60/100;
                this.graphics.font = String(size)+"px Courier";
                var word = "BACK";
                this.graphics.fillText(word,X_LEFT+20*scaleFitNative,Y_BOTTOM-30*scaleFitNative)
            }
            this.drawNextButton=function(){//this draws a next button in the bottom right corner
                this.graphics.fillStyle = "rgba(172, 166, 166, 0.90)";
                this.graphics.fillRect(X_RIGHT-180*scaleFitNative,Y_BOTTOM-90*scaleFitNative,180*scaleFitNative,90*scaleFitNative)
                this.graphics.fillStyle = 'rgb(0,0,0)';
                var size = 1/3000*Y_BOTTOM*60/100*X_RIGHT*60/100;
                this.graphics.font = String(size)+"px Courier";
                var word = "NEXT";
                this.graphics.fillText(word,X_RIGHT-150*scaleFitNative,Y_BOTTOM-30*scaleFitNative)
            }



            this.Clicked=function(posX,posY){//this function simulates an on click listner for the buttons but seeing where the user clicked on the screen
                var centerX=(width/2)
                var centerY=height/2
                //converts click coords to canvas coords
                posX=(posX-centerX)
                posY=(posY-centerY)
                switch (this.page){//checks different locations based on which screen theyre on
                    case(0)://if on first page
                        if(posX>=X_LEFT*50/100 && posX<=(X_LEFT*50/100)+X_RIGHT){//check to see if theyre clicking in the right place on the x plane
                            if(posY<=Y_TOP*20/100 && posY>=(Y_TOP*20/100)+(Y_TOP*20/100)){//if they click in the same Y position as the play button, return 0
                                return(0)
                            }else if(posY<=Y_TOP*-10/100 && posY>=(Y_TOP*-10/100)+(Y_TOP*20/100)){//if they click in the same position as the leader board return 1
                                console.log("LeaderBoard");
                                this.page=1
                                return (1) 
                            }else if(posY<=Y_TOP*-40/100 && posY>=(Y_TOP*-40/100)+(Y_TOP*20/100)){//if they click in the same Y position as the options button return 2
                                console.log("options")
                                this.page=0 //for now this is 0, we need to change it to 2 when we add a page for it
                                return(2)
                            }else if(posY<=Y_TOP*-70/100 && posY>=(Y_TOP*-70/100)+(Y_TOP*20/100)){ //if they click in the same Y position as the credits button return 3
                                console.log("credits")
                                this.page=3
                                return(3)
                            }
                        }
                        break;
                    case(1)://if theyre on the leaderboard
                        if(posX<=X_LEFT+180*scaleFitNative && posY>=Y_BOTTOM-120*scaleFitNative){//if they click the back button
                            console.log("BACK")
                            this.page=0
                            return(4)
                        }else if(posX>=X_RIGHT-150*scaleFitNative &&posY>=Y_BOTTOM-120*scaleFitNative){//if they click next
                            console.log("next")
                        }    
                        break;
                    case(2)://if theyre on options
                        this.page=0
                        break;
                    case(3)://if theyre on credits
                        if(posX<=X_LEFT+180*scaleFitNative && posY>=Y_BOTTOM-120*scaleFitNative){//if they click the back button
                            console.log("BACK")
                            this.page=0
                            return(4)
                        }
                        break;

                }
            }

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
    }
}
export{MainMenu}