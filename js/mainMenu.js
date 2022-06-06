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

        //Canvas Init
        this.canvas = document.createElement("canvas")
        this.canvas.id = "mainMenu";
        this.canvas.width = width;
        this.canvas.height = height;
        this.page=0
        this.leaderBoardPage=0
        //Variables Init
        this.callMenu=true;
        this.graphics = this.canvas.getContext("2d");
        this.Music=true;
        this.soundEffects=true;
        this.controls=true;
        this.banana=false
        this.logo=new Image()
        this.logo.src="../Objects/Textures/Misc/Logo.png"
        //Apply limits, courtesy of Richard Klein
        applyLimits(this.graphics, X_LEFT, X_RIGHT, Y_TOP, Y_BOTTOM, false);
        this.graphics.lineWidth = pixelSize;
        
        //----------------------------------------Functions----------------------------------------
        this.getMenu=function(){
            return this.canvas
        };

        //This function draws a different screen depending on what page the person is on
        this.draw=function() {
           switch(this.page){
               case 0://main menu
                   this.drawMainMenu();
                   break;
                case 1://leaderboard
                    this.drawLeaderboard(this.leaderBoardPage);
                    break;
                case 2://options
                    this.drawOptions();
                    break;
                case 3://credits
                    this.drawCredits();
                    break;
                
           }
        }
        
        
        //Draws MainMenu
        this.drawMainMenu=function(){
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
            g.save()
            this.drawLogo(g)
            g.restore()
            if(this.banana){
            var word = "Banana mode enabled";
            g.fillText(word,X_LEFT,Y_BOTTOM);
            }
        }
       this.drawLogo=function(graphics){
            graphics.save();
         
            graphics.translate(X_LEFT-X_LEFT*85/100,Y_TOP-Y_TOP*5/100)
            graphics.scale(0.25*scaleFitNative,0.25*scaleFitNative)
            graphics.drawImage(this.logo,0,0)
            graphics.restore()
        }
        this.enableBanana=function(){
            this.banana=true
        }

        //Draws the leaderboard on the screen
        this.drawLeaderboard=function(pageNum){
            this.graphics.clearRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP)
            this.graphics.fillStyle="rgba(255,255,255,0.6)"
            this.graphics.fillRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP);
            var size=60*scaleFitNative
            var amount=Math.floor(height/size)-1
            this.graphics.font = String(size)+"px monospace"
            
            var all=lb.getAll()
            this.graphics.fillStyle = "rgb(0,0,0)"
            this.graphics.fillText("Top Players:", X_LEFT+200*scaleFitNative, Y_TOP+50*scaleFitNative)
            var bottom=Y_TOP+60*scaleFitNative
            for (var i=pageNum*amount ;i<((pageNum+1)*amount); i++){
                if(all[i]!==undefined){
                this.graphics.fillText(all[i],  X_LEFT+200, bottom+60*scaleFitNative)
                bottom=bottom+60*scaleFitNative
                }
            }
            this.graphics.save()
            this.graphics.translate(X_LEFT,Y_BOTTOM-80*scaleFitNative)
            this.graphics.scale(scaleFitNative,scaleFitNative)
            this.drawBackButton()
            this.graphics.restore()
            this.graphics.save()
            this.graphics.translate(X_RIGHT-180*scaleFitNative,Y_BOTTOM-80*scaleFitNative)
            this.graphics.scale(scaleFitNative,scaleFitNative)
            this.drawNextButton()
            this.graphics.restore()
        }

        //Draws the credit screen
        this.drawCredits=function() {
            this.graphics.clearRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP)
            this.graphics.fillStyle="rgba(255,255,255,0.6)"
            this.graphics.fillRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP);
        /*put the credits in here----> */var credits=[ 
            "H.Developers","Justin Knopfmacher: 2356115 ","Lior Becker: 2333263","Benjamin Servant: 2420656","Stuart 'Lazarus' Groves: 2356823","Jeremy Stott: 2368841",
            "H.Models","Unless otherwise stated, all were handcrafted by developement team in JS code or Blender","Lamp Post Model: Algirdas Lalys is licensed under CC BY 4.0 - https://bit.ly/3NfeBnj","Banan Gun with Scope: Used with permission from Microsoft - from Microsofts 3D Library",
            "H.Textures","Unless otherwise stated, handcrafted by developement team in JS code,", "PowerPoint, or under CC0", "Icons used in textures from Microsoft 365 illustrations","Skybox Texture:Pieter ‘Spiney’ Verhoeven: http://www.spiney.me/ ",
            "H.Audio", "BGM: Original composition by Jeremy Stott", "Gun sound effect: rifle by Konita Tutorials on opengameart.org ",
            "H.Dependencies","Cannon es", "ThreeToCannon", "Three.js modules: Orbit controls, Pointer lock controls", "Post Processing", "Stats.js"]
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
            this.graphics.save();
            this.graphics.translate(X_LEFT,Y_BOTTOM-80*scaleFitNative)
            this.graphics.scale(1*scaleFitNative,1*scaleFitNative)
            this.drawBackButton()  
            this.graphics.restore()
        }

        //Draw Back Button
        this.drawBackButton=function(){
            this.graphics.fillStyle = "rgba(172, 166, 166, 0.90)";
            this.graphics.fillRect(0,0,180,80)
            this.graphics.fillStyle = 'rgb(0,0,0)';
            this.graphics.font = "60px Courier";
            var word = "BACK";
            this.graphics.save()
            this.graphics.translate(15,55)
            this.graphics.fillText(word,0,0)
            this.graphics.restore()
        }

        //Draws Next Button
        this.drawNextButton=function(){
            this.graphics.fillStyle = "rgba(172, 166, 166, 0.90)";
            this.graphics.fillRect(0,0,180,80)
            this.graphics.fillStyle = 'rgb(0,0,0)';
            this.graphics.font = "60px Courier";
            var word = "NEXT";
            this.graphics.save()
            this.graphics.translate(15,55)
            this.graphics.fillText(word,0,0)
            this.graphics.restore()
        }


        //This function simulates an on click listner for the buttons but seeing where the user clicked on the screen
        this.Clicked=function(posX,posY) {
            var centerX=(width/2)
            var centerY=height/2
            var scale=(1/3000*Y_BOTTOM*60/100*X_RIGHT*60/100)
            //converts click coords to canvas coords
            posX=(posX-centerX)
            posY=(posY-centerY)
            switch (this.page){//checks different locations based on which screen theyre on
                case(0)://if on first page
                    if(posX>=X_LEFT*50/100 && posX<=(X_LEFT*50/100)+X_RIGHT){//check to see if theyre clicking in the right place on the x plane
                        if(posY<=Y_TOP*20/100 && posY>=(Y_TOP*20/100)+(Y_TOP*20/100)){//if they click in the same Y position as the play button, return 0
                            return(0)
                        }else if(posY<=Y_TOP*-10/100 && posY>=(Y_TOP*-10/100)+(Y_TOP*20/100)){//if they click in the same position as the leader board return 1
                            this.page=1
                            return (1) 
                        }else if(posY<=Y_TOP*-40/100 && posY>=(Y_TOP*-40/100)+(Y_TOP*20/100)){//if they click in the same Y position as the options button return 2
                            this.page=2 //for now this is 0, we need to change it to 2 when we add a page for it
                            return(2)
                        }else if(posY<=Y_TOP*-70/100 && posY>=(Y_TOP*-70/100)+(Y_TOP*20/100)){ //if they click in the same Y position as the credits button return 3
                            this.page=3
                            return(3)
                        }
                    }
                break;
                case(1)://if theyre on the leaderboard
                    if(posX<=X_LEFT+180*scaleFitNative && posY>=Y_BOTTOM-80){//if they click the back button
                        lb.requested=false;
                        if(this.leaderBoardPage!=0){
                            this.leaderBoardPage--;
                        }else{
                            this.page=0
                        }
                        return(4)
                    }else if(posX>=X_RIGHT-210*scaleFitNative &&posY>=Y_BOTTOM-80){//if they click next
                        lb.requested=false;
                        this.leaderBoardPage++;
                    }    
                    break;
                case(2)://if theyre on options
                    if(posX<=X_LEFT+180*scaleFitNative && posY>=Y_BOTTOM-80){//press the back button
                        this.page=0
                    }else if(posX>=X_LEFT+50+900*0.75 && posX<=X_LEFT+50+900*0.75+250*0.75){//toggle button left side is clicked
                        if(posY>=Y_TOP+250-70*0.75 && posY<=Y_TOP+250-70*0.75+100*0.75){//left side music
                            this.Music=true;   
                        }else if(posY>=Y_TOP+500-70*0.75 && posY<=Y_TOP+500-70*0.75+100*0.75){//left side sound
                            this.soundEffects=true;
                        }else if(posY>=Y_TOP+750-70*0.75 && posY<=Y_TOP+750-70*0.75+100*0.75){//left side controls
                            this.controls=true;
                        }

                    }else if(posX>=X_LEFT+50+900*0.75+250*0.75 && posX<=X_LEFT+50+900*0.75+500*0.75){//right side toggle button is clicked
                        if(posY>=Y_TOP+250-70*0.75 && posY<=Y_TOP+250-70*0.75+100*0.75){//right side music
                            this.Music=false;
                            
                        }else if(posY>=Y_TOP+500-70*0.75 && posY<=Y_TOP+500-70*0.75+100*0.75){//right side sound
                            this.soundEffects=false;
                        }else if(posY>=Y_TOP+750-70*0.75 && posY<=Y_TOP+750-70*0.75+100*0.75){//right side controls
                            this.controls=false
                        }
                    }
                    break;
                case(3)://if theyre on credits
                    if(posX<=X_LEFT+180*scaleFitNative && posY>=Y_BOTTOM-80){//if they click the back button
                        this.page=0
                        return(4)
                    }
                    break;
            }
        }

        this.drawOptions=function(){
            this.graphics.clearRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP);
            this.graphics.fillStyle="rgba(255,255,255,0.6)"
            this.graphics.fillRect(X_LEFT,Y_TOP,(X_RIGHT-X_LEFT),Y_BOTTOM-Y_TOP);
            var size = 2/3000*Y_BOTTOM*60/100*X_RIGHT*60/100;
            this.graphics.font = String(size)+"px Courier";
            var word = "OPTIONS";
            this.graphics.fillStyle="black"
            this.graphics.fillText(word,-300*scaleFitNative,Y_TOP+90*scaleFitNative);
            this.toggleMusicButton(this.Music)
            this.toggleSoundEffects(this.soundEffects);
            this.toggleControls(this.controls)
            this.graphics.save();
            this.graphics.translate(X_LEFT,Y_BOTTOM-80*scaleFitNative)
            this.graphics.scale(scaleFitNative,scaleFitNative);
            this.drawBackButton()
            this.graphics.restore()
        }

        this.toggleMusicButton=function(on){
            this.graphics.save();
            this.graphics.translate(X_LEFT+50,Y_TOP+250);
            var word="Music:"
            this.graphics.font = "70px Courier";
            this.graphics.fillText(word,0,0);
            this.graphics.save();
            this.graphics.scale(0.75,0.75)
            this.graphics.translate(900,-70)
            this.drawToggleButton(on);
            this.graphics.restore();
            this.graphics.restore();
        }
        this.toggleSoundEffects=function(on){
            this.graphics.save();
            this.graphics.translate(X_LEFT+50,Y_TOP+500);
            var word="Sound Effects:"
            this.graphics.font = "70px Courier";
            this.graphics.fillText(word,0,0);
            this.graphics.save();
            this.graphics.scale(0.75,0.75)
            this.graphics.translate(900,-70)
            this.drawToggleButton(on);
            this.graphics.restore();
            this.graphics.restore();
        }
        this.toggleControls=function(on){
            this.graphics.save();
            this.graphics.translate(X_LEFT+50,Y_TOP+750);
            var word="Controls:"
            this.graphics.font = "70px Courier";
            this.graphics.fillText(word,0,0);
            this.graphics.save();
            this.graphics.scale(0.75,0.75)
            this.graphics.translate(900,-70)
            this.drawToggleControls(on);
            this.graphics.restore();
            this.graphics.restore();
        }




        this.drawToggleButton=function(on){
            this.graphics.save()
            this.graphics.fillStyle="black";
            this.graphics.fillRect(0,0,500,100)
            if(on){
            this.graphics.save();
            this.graphics.fillStyle="rgb(90,90,90)";
            this.graphics.scale(0.5,1);
            this.graphics.fillRect(0,0,500,100);
            this.graphics.restore();
            }else{
            this.graphics.save();
            this.graphics.fillStyle="rgb(90,90,90)";
            this.graphics.scale(0.5,1);
            this.graphics.translate(500,0)
            this.graphics.fillRect(0,0,500,100);
            this.graphics.restore();
            }
            this.graphics.fillStyle="white";
            var word="ON"
            var size=60
            this.graphics.font=String(size)+"px Courier"
            this.graphics.fillText(word,25,65)
            var word="OFF"
            this.graphics.fillText(word,350,65)
            this.graphics.restore();
        }

        this.drawToggleControls=function(on){
            this.graphics.save()
            this.graphics.fillStyle="black";
            this.graphics.fillRect(0,0,500,100)
            if(on){
                this.graphics.save();
                this.graphics.fillStyle="rgb(90,90,90)";
                this.graphics.scale(0.5,1);
                this.graphics.fillRect(0,0,500,100);
                this.graphics.restore();
                }else{
                this.graphics.save();
                this.graphics.fillStyle="rgb(90,90,90)";
                this.graphics.scale(0.5,1);
                this.graphics.translate(500,0)
                this.graphics.fillRect(0,0,500,100);
                this.graphics.restore();
                }
            this.graphics.fillStyle="white";
            var word="AWDS"
            var size=60
            this.graphics.font=String(size)+"px Courier"
            this.graphics.fillText(word,25,65)
            var word="ARROWS"
            this.graphics.fillText(word,265,65)
            this.graphics.restore();
        }



        //Apply Limits function, courtesy of Richard Klein
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