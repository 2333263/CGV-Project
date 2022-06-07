import { Entry } from "./lbObject.js"

class leaderBoard {
    constructor() {
        this.document = document
        this.requested = false;
        this.LeaderBoard = []
        this.top10 = []
        this.curr10 = []
        this.cansend=false
        this.position = 0
        this.tempPos = 0
        this.startpos = 0
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
                http.parent = this
                const url = "http://155.93.144.117/cgv/extract10.php";
                http.open("GET", url, true)
                http.send();
                http.onreadystatechange = function () {
                    this.parent.top10 = [];
                    if (this.readyState == 4 && this.status == 200) {
                        var temp = JSON.parse(http.responseText)
                        for (var i = 0; i < temp.length; i++) {
                            this.parent.top10.push(new Entry(temp[i].name, temp[i].time / 100))
                        }
                    }
                }
            }
            var top = []
            for (var i = 0; i < this.top10.length; i++) {
                var temp = (i + 1) + ")" + "  " + this.top10[i].name + addSpaces(this.top10[i].name, 10) + this.top10[i].time;
                top.push(temp)

            }

            return (top)
        }
        this.getNearest10 = function (time) {
            if (this.requested == false) {
                var http = new XMLHttpRequest()
                http.parent = this

                const url = "http://155.93.144.117/cgv/extractNearest10.php?Time=" + (time * 100)

                http.open("GET", url, true)
                http.send();
                http.onreadystatechange = function () {
                    this.parent.curr10 = [];
                    this.parent.startpos = 0
                    if (this.readyState == 4 && this.status == 200) {
                        var temp = JSON.parse(http.responseText)

                        for (var i = 0; i < temp.length; i++) {
                            this.parent.curr10.push(new Entry(temp[i].name, temp[i].time / 100))
                        }
                        this.parent.startpos = this.parent.getPos(1,this.parent.curr10[0].time);

                    }
                }
            }


            var close = []
            for (var i = 0; i < this.curr10.length; i++) {
                var temp = (this.tempPos + i) + ")" + "  " + this.curr10[i].name + addSpaces(this.curr10[i].name, 10) + this.curr10[i].time;
                close.push(temp)

            }

            return (close)
        }
        this.getAll = function () {
            if (this.requested == false) {
                var http = new XMLHttpRequest()
                http.parent = this
                const url = "http://155.93.144.117/cgv/extract.php"
                http.open("GET", url, true)
                http.send();
                http.onreadystatechange = function () {
                    this.parent.LeaderBoard = [];
                    if (this.readyState == 4 && this.status == 200) {
                        var temp = JSON.parse(http.responseText)
                        for (var i = 0; i < temp.length; i++) {
                            this.parent.LeaderBoard.push(new Entry(temp[i].name, temp[i].time / 100));
                        }
                    }
                }
                this.requested = true;
            }
            var all = []
            for (var i = 0; i < this.LeaderBoard.length; i++) {
                var temp = (i + 1) + ")" + "  " + String(this.LeaderBoard[i].name) + addSpaces(this.LeaderBoard[i].name, 10) + this.LeaderBoard[i].time;
                all.push(temp)

            }

            return (all)
        }



        this.addItem = function (parent,key, value,callback) {
            if (this.requested == false) {
                var http = new XMLHttpRequest()
                var url = "http://155.93.144.117/cgv/insert.php?NAME=" + key + "&TIME=" + value * 100
                http.open("GET", url, true)
                http.send();
                http.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var temp = http.responseText
                        callback(parent)
                        if (temp == "[]") {
                            return;
                        }

                    }
                }
            }

            this.LeaderBoard.push(new Entry(key, value))
        }

        function addSpaces(word, spaces) {
            var temp = ""
            for (var i = word.length; i < spaces; i++) {
                temp += " "
            }
            return (temp)

        }

        this.getPos = function (CB, time) {
            if(CB==0){
                if (this.requested == false) {
                    var http = new XMLHttpRequest()
                    http.parent = this
                    const url = "http://155.93.144.117/cgv/extractpos.php?Time=" + time * 100
                    http.open("GET", url, true)
                    http.send();
                    http.onreadystatechange = function () {
                       
                        this.parent.position = 0;
                        if (this.readyState == 4 && this.status == 200) {
                            var temp = JSON.parse(http.responseText)
                            this.parent.position = temp[0].POSITION;
                        }
                    }
                    this.requested = true;
                }

                return (this.position)
            }else{
                var http = new XMLHttpRequest()
                http.parent = this
                const url = "http://155.93.144.117/cgv/extractpos.php?Time=" + time * 100
                http.open("GET", url, true)
                http.send();
                http.onreadystatechange = function () {
                    this.parent.tempPos = 0;
                    if (this.readyState == 4 && this.status == 200) {
                        var temp = JSON.parse(http.responseText)
                        this.parent.tempPos = temp[0].POSITION;
                    }
                }
                return (this.tempPos)
            }

            
        }

    }
}
export { leaderBoard }






