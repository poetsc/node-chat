const path = require('path');
const express = require('express');
const io = require('socket.io');

const app = express();

app.use(express.static(path.join(__dirname, '/static/')));

const server = app.listen(8080);

const ws = io.listen(server);

ws.on('connection', function (client) {
    console.log('someone is connect');
    client.on('join', function (msg) {
        if (checkNickname(msg)) {
            client.emit('nickname', '昵称有重复!');
        } else {
            client.nickname = msg;
            ws.sockets.emit('announcement', '系统', msg + ' 加入了聊天室!');
        }
    });
    // 发送消息
    client.on('send.message', function (msg) {
        client.broadcast.emit('send.message', client.nickname, msg);
    });
    // 断开连接
    client.on('disconnect', function () {
        if (client.nickname) {
            client.broadcast.emit('send.message', '系统', client.nickname + '离开聊天室!');
        }
    })

})

// 检查重复
function checkNickname(name) {
    for (var k in ws.sockets.sockets) {
        if (ws.sockets.sockets.hasOwnProperty(k)) {
            if (ws.sockets.sockets[k] && ws.sockets.sockets[k].nickname == name) {
                return true;
            }
        }
    }
    return false;
}
