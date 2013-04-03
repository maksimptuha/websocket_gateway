var WebSocketServer = new require('ws');
var webSocketServer = new WebSocketServer.Server({port: 8888});

var fileSystem = require('fs');

var maxWriteBuffer = 0;

webSocketServer.on('connection', function(ws) {
    (function read() {
        ws.send('read');
        ws.send(50);
    })()

    function write() {
        if(maxWriteBuffer === 0) {
            console.log('There is no read request.');
            return;
        }

        var array = fileSystem.readFile('C:/Users/admin/Desktop/New Folder/1.txt', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
        });

        ws.send('start');
        for(var start = 0; start <= array.size; start += maxWriteBuffer) {
            var chunk = array.slice(start, start + maxWriteBuffer);
            ws.send(chunk);
        }
        ws.send('end');
    };

    var receivedData;
    var isRead = false;
    ws.on('message', function(message) {
        if(message === 'start') {
            receivedData = null;
        } else if(message === 'end') {
            console.log(receivedData);
        } else if(message === 'read') {
            isRead = true;
        } else {
            if(!isRead) {
                console.log('Chunk:' + message.length);
                if(receivedData) {
                    receivedData += message;
                } else {
                    receivedData = message;
                }
            } else {
                maxWriteBuffer = parseInt(message);
                isRead = false;

                write();
            }
        }
    });
});