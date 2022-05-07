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
        this.LeaderBoard={
            "a":99,
            "b":45,
            "c":-1,
            "d":8
        }

        this.getBoard=function () {
            var keys=this.Sort()
            var temp=""
            for (var i=0;i<keys.length;i++){
                
                temp+=String(keys[i])+":"+this.LeaderBoard[keys[i]];
                if(i!=keys.length-1) temp+=","
            }
            return(temp)
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
        
        this.addItem=function(key,value){
            this.LeaderBoard[key]=value
        }
        }
      
}
export{leaderBoard}