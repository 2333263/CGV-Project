const width=window.innerWidth+20
const height=window.innerHeight+20
const scaleFitNative = Math.min(width / 1900, height / 935);

class LoadingScreen {
    constructor() {
        this.loading=false;
   
        this.isLoading=function(currentWorld,banana){
        var random=Math.floor(Math.random()  * 8);

        this.loading=true
        var loadingScreen=document.createElement("canvas")
        
        loadingScreen.style.position = 'fixed';
        loadingScreen.style.left = 0+'px';
        loadingScreen.style.top = 0 + 'px';
        loadingScreen .width = width;
        loadingScreen.height = height;
       
        loadingScreen.id="loadingScreen";
      var  graphics = loadingScreen.getContext("2d");
        
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
    };
   
    
}
export { LoadingScreen };
