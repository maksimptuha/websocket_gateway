var gateway = (function(gateway) {
    var accessPoints = ['ws://localhost:8888'];
    var currentAccessPoint = accessPoints[0];

    var webSocket;
    var readQueue = [];
    var readUnprocessedQueue = 0;
    var writeQueue = [];

    function stringToByte(str) {
        var bytes = [];
        var _str = str.split(',');
        for(var i = 0; i < _str.length; i++) {
            bytes.push(parseInt(_str[i]));
        }
        return bytes;
    }

    function logState() {
        console.log('\nreadQueue : ');
        console.log(readQueue);
        console.log('\nreadUnprocessedQueue : ' + readUnprocessedQueue +
            '\nwriteQueue : ' + writeQueue +
            '\n----------------------------------------------');
    }

    gateway.getCurrentAccessPoint = function() {
        return currentAccessPoint;
    };

    gateway.addAccessPoint = function(accessPoint) {
        if(accessPoint && accessPoints.indexOf(accessPoint) == -1) {
            accessPoints.push(accessPoint);
        }
    };

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
    };

    gateway.disconnect = function() {
        if(webSocket !== null && gateway.isConnected()) {
            webSocket.close();
        }
    };

    gateway.isConnected = function() {
        return !!(webSocket.readyState == 1);
    };

    gateway.connectAccessPoint = function() {
        if(typeof(WebSocket) === 'undefined') {
            alert('Your browser does not support WebSockets.');
        } else {
            webSocket = new WebSocket(currentAccessPoint);

            webSocket.onmessage = function(event) {
                var data = event.data.split(':'),
                    messageType = data[0],
                    messageData = data[1];
                if(messageType === 'read') {
                    _read(parseInt(messageData));
                } else if(messageType === 'write') {
                    _write(stringToByte(messageData));
                }
            };

            webSocket.onerror = function(event) {
                alert('Error ' + event.data);
            };
        }
    };

    gateway.read = function(array, size, callback) {
        if(!this.isConnected()) {
            alert('There is no connection.');
            return;
        }

        if(isNaN(size)) {
            alert('Read size is not a number.');
            return;
        }

        readQueue.push({
            array : array,
            size : size,
            callback : callback
        });

        webSocket.send('read:' + size);

        logState();
    };

    function _read(size) {
        var message = writeQueue.slice(0, size);

        if(writeQueue.length > size) {
            writeQueue = writeQueue.splice(size, writeQueue.length);
        } else {
            readUnprocessedQueue += size - writeQueue.length;
            writeQueue = [];
        }

        webSocket.send('write:' + message);

        writeQueue.callback(writeQueue.length);

        logState();
    }

    gateway.write = function(array, size, callback) {
        if(!this.isConnected()) {
            alert('There is no connection.');
            return;
        }

        if(isNaN(size)) {
            alert('Write size is not a number.');
            return;
        }

        writeQueue['callback'] = callback;

        var message;

        if(readUnprocessedQueue >= size) {
            message = array.slice(0, size);
            readUnprocessedQueue -= size;
        } else {
            message = array.slice(0, readUnprocessedQueue);
            writeQueue = writeQueue.concat(array.slice(readUnprocessedQueue, size));
            readUnprocessedQueue = 0;
        }

        webSocket.send('write:' + message);

        logState();
    };

    function _write(data) {
        while(true) {
            if(!readQueue[0]) {
                break;
            }

            var container = readQueue[0];
            var i;
            if(container.size > data.length) {
                for(i = 0; i < data.length; i++) {
                    container.array.push(data[i]);
                }
                container.size -= data.length;
                container.callback(container.size);
                break;
            } else {
                for(i = 0; i < container.size; i++) {
                    container.array.push(data[i]);
                }
                data = data.splice(container.size, data.length);
                container.callback(0);
                readQueue.shift();
            }
        }

        logState();
    }

    return gateway;
}(gateway || {}));