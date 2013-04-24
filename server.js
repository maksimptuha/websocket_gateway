var WebSocketServer = new require('ws');
var fileSystem = require('fs');

var webSocketServer = new WebSocketServer.Server({port: 8888});

var sendArray = fileSystem.readFileSync("1.txt", "utf8");
var receiveArray;
var clients =[];

webSocketServer.on('connection', function(webSocket) {
    clients.push({
        ws : webSocket,
        isRead : false,
        maxWriteSize : 0
    });

    webSocket.on('message', function(message) {

        var client = getClient(webSocket);

        if(message.split(' ')[0] === 'read') {
            client.isRead = true;
            client.maxWriteSize = parseInt(message.split(' ')[1]);
            write(client);
        } else {
            receiveArray += message;
            console.log(message);
        }
    });

    webSocket.on('close', function() {
        for(var i = 0; i < clients.length; i++) {
            if(clients[i].ws === webSocket) {
                clients.splice(i, 1);
            }
        }
    });

    read(getClient(webSocket), '13');
});

function getClient(webSocket) {
    for(var i = 0; i < clients.length; i++) {
        if(clients[i].ws === webSocket) {
            return clients[i];
        }
    }
}

function read(client, maxArraySize) {
    client.ws.send('read ' + maxArraySize);
}

function write(client) {
    if(!client.isRead) {
        console.log('There is no read request.');
        return;
    }

    client.ws.send(sendArray.slice(0, client.maxWriteSize));
    sendArray = sendArray.substring(client.maxWriteSize, sendArray.length);
    client.isRead = false;
    client.maxWriteSize = 0;
};