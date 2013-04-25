var gateway = (function(gateway) {
    var accessPoints = ['ws://localhost:8888'];
    var currentAccessPoint = accessPoints[0];

    var receiveArray = [];
    var sendArray = [];

    var readQueue = 0;
    var writeQueue = 0;

    var webSocket;

    function stringToByte(str) {
        var bytes = [];
        for (var i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    }

    function byteToString(bytes) {
        var str = "";
        for (var i = 0; i < bytes.length; i++) {
            str += String.fromCharCode(parseInt(bytes[i]));
        }
        return str;
    }

    gateway.setSendArray = function(array) {
        sendArray = array;
    }

    gateway.getCurrentAccessPoint = function() {
        return currentAccessPoint;
    }

    gateway.addAccessPoint = function(accessPoint) {
        if(accessPoint && accessPoints.indexOf(accessPoint) == -1) {
            accessPoints.push(accessPoint);
        }
    }

    gateway.changeAccessPoint = function(direction) {
        var currentAccessPointIndex = accessPoints.indexOf(currentAccessPoint);
        if(direction == 'back') {
            if(currentAccessPointIndex == 0) {
                currentAccessPoint = accessPoints[accessPoints.length - 1];
            } else {
                currentAccessPoint = accessPoints[currentAccessPointIndex - 1];
            }
        } else if(direction == 'forward') {
            if(currentAccessPointIndex == accessPoints.length - 1) {
                currentAccessPoint = accessPoints[0];
            } else {
                currentAccessPoint = accessPoints[currentAccessPointIndex + 1];
            }
        }
    }

    gateway.disconnect = function() {
        webSocket.close();
    }

    gateway.isConnected = function() {
        return webSocket.readyState == 1 ? true : false;
    }

    gateway.connectAccessPoint = function(output, sendFile) {
        if(sendFile == undefined) {
            alert('Send file is not set.')
            return;
        } else {
            sendArray = stringToByte(sendFile);
        }

        if(typeof(WebSocket) == 'undefined') {
            alert('Your browser does not support WebSockets.');
        } else {
            webSocket = new WebSocket(currentAccessPoint);

            webSocket.onmessage = function(event) {
                if(event.data.split(' ')[0] === 'read') {
                    readQueue += parseInt(event.data.split(' ')[1]);
                } else {
                    if(event.data !== '') {
                        output.innerText += event.data + '\n';
                        receiveArray += byteToString(event.data);
                    }
                }
            };

            webSocket.onerror = function(event) {
                alert('Error ' + event.data);
            };
        }
    }

    gateway.read = function(maxArraySize) {
        if(!this.isConnected()) {
            alert('There is no connection.');
            return;
        }

        if(isNaN(maxArraySize)) {
            alert('Read max size is not a number.');
            return;
        }

        webSocket.send('read ' + maxArraySize);
    }

    gateway.write = function(writeSize) {
        if(!this.isConnected()) {
            alert('There is no connection.');
            return;
        }

        writeQueue += writeSize;

        if(sendArray.length === 0) {
            return;
        }

        if(writeQueue > readQueue) {
            if(readQueue > sendArray.length) {
                webSocket.send(byteToString(sendArray));
                readQueue -= sendArray.length;
                writeQueue -= sendArray.length;
                sendArray = [];
            } else {
                webSocket.send(byteToString(sendArray.slice(0, readQueue)));
                sendArray = sendArray.splice(readQueue, sendArray.length);
                writeQueue -= readQueue;
                readQueue = 0;
            }
        } else {
            if(writeQueue > sendArray.length) {
                webSocket.send(byteToString(sendArray));
                writeQueue -= sendArray.length;
                readQueue -= sendArray.length;
                sendArray = [];
            } else {
                webSocket.send(byteToString(sendArray.slice(0, writeQueue)));
                sendArray = sendArray.splice(writeQueue, sendArray.length);
                readQueue -= writeQueue;
                writeQueue = 0;
            }
        }
    }

    gateway.addSendArray = function(addArray) {
        sendArray += addArray;

        if(writeQueue > readQueue) {
            if(readQueue > sendArray.length) {
                webSocket.send(byteToString(sendArray));
                readQueue -= sendArray.length;
                writeQueue -= sendArray.length;
                sendArray = [];
            } else {
                webSocket.send(byteToString(sendArray.slice(0, readQueue)));
                sendArray = sendArray.splice(readQueue, sendArray.length);
                writeQueue -= readQueue;
                readQueue = 0;
            }
        } else {
            if(writeQueue > sendArray.length) {
                webSocket.send(byteToString(sendArray));
                writeQueue -= sendArray.length;
                readQueue -= sendArray.length;
                sendArray = [];
            } else {
                webSocket.send(byteToString(sendArray.slice(0, writeQueue)));
                sendArray = sendArray.splice(writeQueue, sendArray.length);
                readQueue -= writeQueue;
                writeQueue = 0;
            }
        }
    }

    return gateway;
}(gateway || {}));