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
import {Entry} from "./lbObject.js"

class leaderBoard {
    constructor() {
        this.document = document
        this.requested = false;
        this.LeaderBoard = []
        this.top10=[]
        this.curr10=[]
        this.position=[]
        this.startpos=0
        this.Sort = function () {
            var items = Object.keys(this.LeaderBoard).map(
                (key) => { return [key, this.LeaderBoard[key]] }
            )
            items.sort((first, second) => { return first[1] - second[1] })
            var keys = items.map(
                (e) => { return e[0] });

            return keys
        }
        this.keys = this.Sort()

        this.getBoard = function () {

            var keys = this.Sort()
            var temp = ""
            for (var i = 0; i < keys.length; i++) {

                temp += String(keys[i]) + ":" + this.LeaderBoard[keys[i]];
                if (i != keys.length - 1) temp += ","
            }
            return (temp)
        }
        this.getTop10 = function () {
            if (this.requested == false) {
                var http = new XMLHttpRequest()
                http.parent=this
                const url = "http://155.93.144.117/cgv/extract10.php";
                http.open("GET", url, true)
                http.send();
                http.onreadystatechange = function () {
                    this.parent.top10=[];
                    if (this.readyState == 4 && this.status == 200) {
                        var temp = JSON.parse(http.responseText)
                        for (var i = 0; i < temp.length; i++) {
                            this.parent.top10.push(new Entry(temp[i].name,temp[i].time/100))
                        }
                    }
                }
            }
            var top=[]
            for (var i=0;i<this.top10.length;i++) {
                var temp = (i + 1) + ")" + "  " + this.top10[i].name+ addSpaces(this.top10[i].name, 10) + this.top10[i].time;
                top.push(temp)

            }

            return (top)
        }
        this.getNearest10 = function (time) {
            if (this.requested == false) {
                var http = new XMLHttpRequest()
                http.parent=this
                
                const url = "http://155.93.144.117/cgv/extractNearest10.php?Time="+(time*100)
              
                http.open("GET", url, true)
                http.send();
                http.onreadystatechange = function () {
                    this.parent.curr10=[];
                    this.parent.startpos=0
                    if (this.readyState == 4 && this.status == 200) {
                        var temp = JSON.parse(http.responseText)
                      
                        for (var i = 0; i < temp.length; i++) {
                            this.parent.curr10.push(new Entry(temp[i].name,temp[i].time/100))
                            console.log(this.parent.curr10)
                        }
                        this.parent.startpos= this.parent.getPos(this.parent.curr10[0].time);
                       
                        
                    }
                }
            }
         
             
            var close=[]
            for (var i=0;i<this.curr10.length;i++) {
                var temp = (this.startpos+i) + ")" + "  " + this.curr10[i].name+ addSpaces(this.curr10[i].name, 10) + this.curr10[i].time;
                close.push(temp)
              
            }

            return (close)
        }
        this.getAll = function () {
            if (this.requested == false) {
                var http = new XMLHttpRequest()
                http.parent=this
                const url = "http://155.93.144.117/cgv/extract.php"
                http.open("GET", url, true)
                http.send();
                http.onreadystatechange = function () {
                    this.parent.LeaderBoard=[];
                    if (this.readyState == 4 && this.status == 200) {
                        var temp = JSON.parse(http.responseText)
                        //console.log(temp)
                        for (var i = 0; i < temp.length; i++) {
                            this.parent.LeaderBoard.push(new Entry(temp[i].name,temp[i].time/100));
                        }
                    }
                }
                this.requested=true;
            }
            var all = []
            for (var i=0;i<this.LeaderBoard.length;i++) {
                var temp = (i + 1) + ")" + "  " + String(this.LeaderBoard[i].name) + addSpaces(this.LeaderBoard[i].name, 10) + this.LeaderBoard[i].time;
                all.push(temp)

            }

            return (all)
        }

       

        this.addItem = function (key, value) {
            if (this.requested == false) {
                var http = new XMLHttpRequest()
                var url = "http://155.93.144.117/cgv/insert.php?NAME="+key+"&TIME="+value*100
                http.open("GET", url, true)
                http.send();
                http.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var temp =http.responseText
                        if (temp=="[]"){
                            return;
                        }
                        
                    }
                }
            }

            this.LeaderBoard.push(new Entry(key,value))
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
        function addSpaces(word, spaces) {
            var temp = ""
            for (var i = word.length; i < spaces; i++) {
                temp += " "
            }
            return (temp)

        }

        this.getPos = function ( time) {
            if (this.requested == false) {
                var http = new XMLHttpRequest()
                http.parent=this
                const url = "http://155.93.144.117/cgv/extractpos.php?Time="+time*100
                http.open("GET", url, true)
                http.send();
                http.onreadystatechange = function () {
                    this.parent.position=0;
                    if (this.readyState == 4 && this.status == 200) {
                        var temp = JSON.parse(http.responseText)
                        console.log(temp)
                        this.parent.position=temp[0].POSITION;
                    }
                }
                this.requested = true;
            }
            
                    return (this.position)
                
            
        }
    }
}
export { leaderBoard }






