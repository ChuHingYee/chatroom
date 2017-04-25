window.onload = function() {
    var funchat = new funChat();
    funchat.init();
    // funchat.init()._seleBtn("selebtn");

};

var funChat = function() {
    this.socket = null;
    this.mobile = false;
};

funChat.prototype = {
    init: function() {
        var that = this;
        that._getCreen();
        that._setHeight();
        that._seleBtn("selebtn");
        this.socket = io.connect();
        this.socket.on("connect", function() {
            // console.log(11);
            if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
                that.$("typeBlock").style.display = "none";
                that.$("selebtn").style.display = "none";
            }
            that.$("mask").style.display = "block";
            that.$("login").style.display = "block";
            that.$("info").textContent = "get your nick name by yourself";
            that.$("name").focus();
        });
        that.$("confirm").addEventListener("click", function() {
            console.log("nickname");
            that.$("name").focus();
            var nickname = that.$("name").value;
            if (nickname != 0) {
                that.socket.emit("login", nickname);
            } else {
                that.$("name").focus();
            };
        }, false);
        that.socket.on("nickExisted", function() {
            that.$("info").textContent = "this name is existed";
            that.$("name").focus();
        });
        that.socket.on('loginSuccess', function() {
            that.$("mask").style.display = "none";
            that.$("login").style.display = "none";
            // console.log(11);
            if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
                that.$("typeBlock").style.display = "block";
                that.$("selebtn").style.display = "block";
            }
            if(!that.mobile){
                that.$("type").focus();
            }
        });
        that.socket.on("system", function(nickName, usersCount, type) {
            var msg = nickName + (type == "login" ? " joined" : " left");
            that._showMessage("system", msg, "#ff0000");
            that.$("static").textContent = usersCount + (usersCount > 1 ? " users " : " user ") + "online";
        })
        that.$("send").addEventListener("click", function() {
            var type = that.$("type");
            var sendMsg = that.$("type").value;
            color = that.$("color").value;
            type.value = "";
            if(!that.mobile){
                type.focus();
            }
            if (sendMsg.trim().length != 0) {
                that.socket.emit("postMsg", sendMsg, color);
                that._showMessage("me", sendMsg, color);
            };
        }, false);
        that.socket.on("newMsg", function(user, msg, color) {
            console.log(1);
            that._showMessage(user, msg, color);
        });
        that.$("sendImage").addEventListener("change", function() {
            if (this.files.length != 0) {
                var file = this.files[0],
                    reader = new FileReader();
                if (!reader) {
                    that._showMessage("stystem", "your browser vension is too old", "#ff0000");
                    this.value = "";
                    return;
                };
                reader.onload = function(e) {
                    e = event || window.event;
                    this.value = "";
                    that.socket.emit("img", e.target.result);
                    that._showImage("me", e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }, false);
        that.socket.on("newImg", function(user, img) {
            that._showImage(user, img);
        })
        that._initImg();
        that.$("fun").addEventListener("click", function(e) {
            var e = event || window.event;
            var funwrapper = that.$("funwrapper");
            // console.log(funwrapper);
            funwrapper.style.display = "block";
            e.stopPropagation();
        }, false);
        document.addEventListener("click", function(e) {
            var e = event || window.event;
            var funwrapper = that.$("funwrapper");
            if (e.target != funwrapper) {
                funwrapper.style.display = "none";
            }
        }, false);
        that.$("funwrapper").addEventListener("click", function(e) {
            var e = event || window.event;
            var target = e.target;
            if (target.nodeName.toLowerCase() == "img") {
                var type = that.$("type");
                type.focus();
                type.value = type.value + "[fun:" + target.title + "]";
            };
        }, false);
        that.$("name").addEventListener("keyup", function(e) {
            var e = event || window.event;
            if (e.keyCode == 13) {
                var nickName = that.$("name").value;
                if (nickName.trim().length != 0) {
                    that.socket.emit("login", nickName);
                };
            };
        }, false);
        that.$("type").addEventListener("keyup", function(e) {
            var e = event || window.event;
            var type = that.$("type"),
                msg = type.value,
                color = that.$("color").value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                type.value = '';
                that.socket.emit("postMsg", msg, color);
                that._showMessage("me", msg, color);
            };
        }, false);
        that.$("clean").addEventListener("click", function(e) {
            that.$("showMessage").innerHTML = "";
        });
        that.$("utlbtn").addEventListener("click", function() {
            that.socket.emit("utl");
            that._showMessage("me", "u use the UTLAAAAAAA", "red")
        });
        that.socket.on("utlshow", function(name, mes, num) {
            that._showUtl(num);
            // that._showMessage("name", mes)
        });
        that.socket.on("tip", function(num) {
            that._tipForU(num);
        });
    },
    _getCreen: function(){
        var cw = window.innerWidth || document.documentElement.clientX || document.body.clientX;
        if(cw < 768){
            this.mobile = true;
        }
    },
    _showMessage: function(user, msg, color) {
        var container = this.$("showMessage"),
            p = document.createElement("p"),
            date = new Date().toTimeString().substr(0, 8);
        msg = this._showFun(msg);
        p.style.color = color || "#333";
        p.innerHTML = user + "<span class='time'>(" + date + ")</span>" + msg;
        container.appendChild(p);
        container.scrollTop = container.scrollHeight;
    },
    _showImage: function(user, imgData, color) {
        var container = this.$("showMessage"),
            p = document.createElement("p"),
            date = new Date().toTimeString().substr(0, 8);
        p.style.color = color || "#333";
        p.innerHTML = user + '<span class="time">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(p);
        container.scrollTop = container.scrollHeight;
    },
    _initImg: function() {
        var imgContainer = this.$("funwrapper"),
            docFragment = document.createDocumentFragment();
        for (var i = 9; i > 0; i--) {
            var item = document.createElement("img");
            item.src = "./imgs/funs/fun" + i + ".gif";
            item.title = i;
            docFragment.appendChild(item);
        };
        imgContainer.appendChild(docFragment);
    },
    _showFun: function(msg) {
        var that = this;
        var match, result = msg,
            reg = /\[fun:\d+\]/g,
            funIndex,
            totalFunNum = that.$("funwrapper").children.length;
        while (match = reg.exec(msg)) {
            console.log(match[0]);
            funIndex = match[0].slice(5, -1);
            if (funIndex > totalFunNum) {
                result = result.replace(match[0], "[x]");
            } else {
                result = result.replace(match[0], "<img class='fun' src='./imgs/funs/fun" + funIndex + ".gif' />");
            };
        };
        return result;
    },
    _showUtl: function() {
        // console.log(555);
        var that = this;
        var timeA = null;
        var timeB = null;
        var big = that.$("big")
        timeA = setTimeout(function() {
            big.className = "utlImg active"
        }, 3000);
        timeB = setTimeout(function() {
            big.className = "utlImg"
        }, 9000)
    },
    _tipForU: function(num) {
        var that = this;
        var btn = that.$("utlbtn");
        if (num != 0) {
            btn.value = "FUll-ATTACK" + "(" + num + "time)";
        } else {
            btn.value = "utl had left you ";
            btn.disabled = "disabled";
            btn.className = "utlbtn disabled"
        }
    },
    _seleBtn: function(ele) {
        var that = this;
        var selebtn = that.$(ele);
        var btns = that.$("btns")
        selebtn.addEventListener("click", function() {
            if (btns.style.display !== "block") {
                btns.style.display = "block";
                return
            } else {
                btns.style.display = "none";
            }
        }, false)
    },
    _setHeight: function() {
        // $("body").height( $(window).height() );
        var that = this;
        if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
            document.body.offsetHeight = window.screen.availHeight;
            console.log(that.$("showMessage").offsetHeight)
            that.$("showMessage").style.height = window.screen.availHeight - 55 - 130 + "px";
            console.log(window.screen.availHeight - 55 + "px");
        }
    },
    $: function(id) {
        return document.getElementById(id);
    }
};
