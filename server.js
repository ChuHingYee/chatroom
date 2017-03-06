var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];


app.use('/', express.static(__dirname + '/www'));
server.listen(666);

io.on('connection', function (socket) {
    socket.on('login', function (nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            socket.utl = 3;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
            // io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    socket.on('disconnect', function () {
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    socket.on('postMsg',function (msg){
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
    socket.on('img',function (imgData){
        socket.broadcast.emit('newImg',socket.nickname, imgData);
        console.log(socket.nickname);
    });
    socket.on("utl",function(){
        if(socket.utl!=0){
        socket.utl-=1;
        socket.broadcast.emit('newMsg', socket.nickname, "UTL is Coming");
        socket.broadcast.emit('utlshow',socket.nickname)
        socket.emit('tip',socket.utl)
        }
    })
});
