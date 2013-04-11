var gateway = (function(gateway) {
    var accessPoints = ['ws://localhost:8888'];
    var currentAccessPoint = accessPoints[0];
    var webSocket;

    var maxWriteSize = 0;
    var isRead = false;

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

    gateway.connectAccessPoint = function(output) {
        if(typeof(WebSocket) == 'undefined') {
            alert('Your browser does not support WebSockets.');
        } else {
            webSocket = new WebSocket(currentAccessPoint);

            webSocket.onmessage = function(event) {
                if(event.data === 'read') {
                    isRead = true;
                } else {
                    if(!isRead) {
                        output.innerText += event.data + '\n';
                    } else {
                        maxWriteSize = parseInt(event.data);
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

        webSocket.send('read');
        webSocket.send(maxArraySize);
    }

    gateway.write = function(array) {
        if(!array) {
            alert('Array is not set.');
            return;
        }

        if(!this.isConnected()) {
            alert('There is no connection.');
            return;
        }

        if(!isRead) {
            alert('There is no read request.');
            return;
        }

        webSocket.send(array.slice(0, maxWriteSize));

        isRead = false;
        maxWriteSize = 0;
    }

    return gateway;
}(gateway || {}));