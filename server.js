var WebSocketServer = new require('ws');
var fileSystem = require('fs');

var webSocketServer = new WebSocketServer.Server({port: 8888});

var sendArray = stringToByte(fileSystem.readFileSync("1.txt", "utf8"));
var clients =[];

webSocketServer.on('connection', function(webSocket) {
    clients.push({
        ws : webSocket,
        receiveArray : [],
        readQueue : 0,
        writeQueue : 0
    });

    webSocket.on('message', function(message) {

        var client = getClient(webSocket);

        if(message.split(' ')[0] === 'read') {
            client.readQueue += parseInt(message.split(' ')[1]);
            write(client, 8);
        } else {
            if(message !== '') {
                client.receiveArray += stringToByte(message);
                console.log(message);
            }
        }
    });

    webSocket.on('close', function() {
        for(var i = 0; i < clients.length; i++) {
            if(clients[i].ws === webSocket) {
                clients.splice(i, 1);
            }
        }
    });

    read(getClient(webSocket), '33');
});

function getClient(webSocket) {
    for(var i = 0; i < clients.length; i++) {
        if(clients[i].ws === webSocket) {
            return clients[i];
        }
    }
}

function stringToByte(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}

function byteToString(bytes) {
    var str = '';
    for (var i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(parseInt(bytes[i]));
    }
    return str;
}

function read(client, readSize) {
    client.ws.send('read ' + readSize);
}

function write(client, writeSize) {
    client.writeQueue += writeSize;

    if(client.writeQueue > client.readQueue) {
        if(client.readQueue > sendArray.length) {
            client.ws.send(byteToString(sendArray));
            client.readQueue -= sendArray.length;
            client.writeQueue -= sendArray.length;
            sendArray = [];
        } else {
            client.ws.send(byteToString(sendArray.slice(0, client.readQueue)));
            sendArray = sendArray.splice(client.readQueue, sendArray.length);
            client.writeQueue -= client.readQueue;
            client.readQueue = 0;
        }
    } else {
        if(client.writeQueue > sendArray.length) {
            client.ws.send(byteToString(sendArray));
            client.writeQueue -= sendArray.length;
            client.readQueue -= sendArray.length;
            sendArray = [];
        } else {
            client.ws.send(byteToString(sendArray.slice(0, client.writeQueue)));
            sendArray = sendArray.splice(client.writeQueue, sendArray.length);
            client.readQueue -= client.writeQueue;
            client.writeQueue = 0;
        }
    }
}