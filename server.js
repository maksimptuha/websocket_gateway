var WebSocketServer = new require('ws');
var webSocketServer = new WebSocketServer.Server({port: 8888});

var sendArray = [18, 15, 65, 22, 33, 48, 56, 47, 66, 67, 51, 37, 94, 85, 13, 6, 81, 48, 17, 107];
var receiveArray = [];
var readQueue = 0;
var writeQueue = 0;
var webSocket = null;

webSocketServer.on('connection', function(ws) {
    webSocket = ws;

    webSocket.on('message', function(message) {
        var data = message.split(':'),
            messageType = data[0],
            messageData = data[1];

        if(messageType === 'read') {
            readQueue += parseInt(messageData);
            write(readQueue);
        } else if(messageType === 'write') {
            if(messageData !== '') {
                receiveArray = receiveArray.concat(stringToByte(messageData));
            }
        }

        logState();
    });

    webSocket.on('error', function(event) {
        console.log('Error ' + event.data);
    });

    read('10');

    logState();
});

function logState() {
    console.log('sendArray : ' + sendArray +
                '\nreceiveArray : ' + receiveArray +
                '\nreadQueue : ' + readQueue +
                '\nwriteQueue : ' + writeQueue +
                '\n----------------------------------------------');
}

function stringToByte(str) {
    var bytes = [];
    var _str = str.split(',');
    for(var i = 0; i < _str.length; i++) {
        bytes.push(parseInt(_str[i]));
    }
    return bytes;
}

function read(readSize) {
    webSocket.send('read:' + readSize);
}

function write(writeSize) {
    webSocket.send('write:' + sendArray.slice(0, writeSize));

    logState();
}