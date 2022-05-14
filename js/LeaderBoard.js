/*var http=new XMLHttpRequest()
const url='https://api.lyrics.ovh/v1/toto/africa'
http.open("GET",url)
http.send()
http.onreadystatechange=function(){
    if(this.readyState==4 && this.status==200){
        console.log(http.responseText)
    }
}
*/


class leaderBoard{
    constructor(){
        this.document=document
        this.LeaderBoard={
            "J":99,
            "L":45,
            "B":1,
            "D":8
        }
        this.Sort=function(){
            var items=Object.keys(this.LeaderBoard).map(
                (key)=>{return[key,this.LeaderBoard[key]]}
            )
                items.sort((first,second)=>{return first[1]-second[1]})
                var keys = items.map(
                    (e) => { return e[0] });
                
               return keys
            }
        this.keys=this.Sort()

        this.getBoard=function () {
            var keys=this.Sort()
            var temp=""
            for (var i=0;i<keys.length;i++){
                
                temp+=String(keys[i])+":"+this.LeaderBoard[keys[i]];
                if(i!=keys.length-1) temp+=","
            }
            return(temp)
        }
        this.getTop10= function (){
            this.keys=this.Sort()
            var top=[]
            var max= Math.min(10,this.keys.length);
             for (var i=0;i<max;i++){
               var temp=(i+1)+")"+"  "+String(this.keys[i])+addSpaces(String(this.keys[i]),10)+this.LeaderBoard[this.keys[i]];
                top.push(temp)
                             
             }
          
             return (top)
        }
        this.getAll=function(){
            this.keys=this.Sort()
            var all=[]
             for (var i=0;i<this.keys.length;i++){
               var temp=(i+1)+")"+"  "+String(this.keys[i])+addSpaces(String(this.keys[i]),10)+this.LeaderBoard[this.keys[i]];
                all.push(temp)
                             
             }
          
             return (all)
        }

        
        
        this.addItem=function(key,value){
            this.LeaderBoard[String(key).trim()]=value
        }

       /* this.addTextField=function(){
            
            var board=document.createElement('board')
            board.type = 'text';
            board.style.position = 'fixed';
            board.style.backgroundColour="rgba(0,0,0,0)"
            board.style.left = (90) + 'px';
            board.style.top = (90) + 'px';
            board.style['width']='50px'
            board.style['height']='50px'
            board.value="HELLLOEEEEEEEEEEEEE"
            board.id="Board"
            console.log(board)
            document.body.appendChild(board)
            board.focus()
            
            
        }*/
        function  addSpaces(word,spaces) {
            var temp=""
            for(var i=word.length;i<spaces;i++){
                temp+=" "
            }
            return (temp)
            
        }

        this.getPlayer=function(name,time){
            for(var i=0;i<this.keys.length;i++){
               if(this.keys[i].toLowerCase()===name.toLowerCase()&& this.LeaderBoard[this.keys[i]]==time){
                    return(i+1)
                }
            }
            return(999999)
        }
        }
}
export{leaderBoard}






