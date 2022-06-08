import { Entry } from "./lbObject.js"
/**
 * @classdesc LeaderBoard class used to interact with php
 */
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
        /**
         * getNearest10 
         * @param {float} time score from player 
         */
        this.getNearest10 = function (time) {
            if (this.requested == false) {
                var http = new XMLHttpRequest()
                http.parent = this

                const url = httpUrls+"extractNearest10.php?Time=" + (time * 100)

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
        /**
         * getAll 
         * @returns {list} all entries in the leaderboard
         */
        this.getAll = function () {
            if (this.requested == false) {
                var http = new XMLHttpRequest()
                http.parent = this
                const url = httpUrls+"extract.php"
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


        /**
         * addItem
         * @param {class}parent leaderBoard.js 
         * @param {string}key name of player added to leaderboard
         * @param {float}value time (score) of player
         * @callback callback
         */
        this.addItem = function (parent,key, value,callback) {
            if (this.requested == false) {
                key=key.replaceAll("&","")
                var http = new XMLHttpRequest()
                var url = httpUrls+"insert.php?NAME=" + key.replaceAll("`", "")+ "`TIME=" + value * 100
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
        /**
         * addSpaces
         * @param {string} word any string
         * @param {int} spaces number of spaces for display purposes
         */
        function addSpaces(word, spaces) {
            var temp = ""
            for (var i = word.length; i < spaces; i++) {
                temp += " "
            }
            return (temp)

        }

        /**
         * getPos
         * @param {int} CB which class is calling
         * @param {float} time score of player
         */
        this.getPos = function (CB, time) {
            if(CB==0){
                if (this.requested == false) {
                    var http = new XMLHttpRequest()
                    http.parent = this
                    const url = httpUrls+"extractpos.php?Time=" + time * 100
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
                const url = httpUrls+"extractpos.php?Time=" + time * 100
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






