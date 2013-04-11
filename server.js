var WebSocketServer = new require('ws');
var fileSystem = require('fs');

var webSocketServer = new WebSocketServer.Server({port: 8888});

var maxWriteSize;
var isRead = false;

var connectedWebSocket;

webSocketServer.on('connection', function(ws) {
    connectedWebSocket = ws;

    read('50');

    ws.on('message', function(message) {
        if(message === 'read') {
            isRead = true;
        } else {
            if(!isRead) {
                console.log(String(message));
            } else {
                maxWriteSize = parseInt(message);

                write();
            }
        }
    });
});

function read(maxArraySize) {
    connectedWebSocket.send('read');
    connectedWebSocket.send(maxArraySize);
}

function write() {
    if(!isRead) {
        console.log('There is no read request.');
        return;
    }

    fileSystem.readFile('jquery.txt', 'utf8', function (err, data) {
        if (err) {
            console.log(err);
        }

        connectedWebSocket.send(data.slice(0, maxWriteSize));

        isRead = false
        maxWriteSize = 0;
    });
};