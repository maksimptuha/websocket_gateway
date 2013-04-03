var gateway = (function(gateway) {
    this.accessPoints = ['ws://localhost:8888'];
    this.currentAccessPoint = this.accessPoints[0];
    this.webSocket;
    this.maxWriteBuffer = 0;

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

    gateway.connectAccessPoint = function(address, onmessage, onerror) {
        if(typeof(WebSocket) == 'undefined') {
            alert('Your browser does not support WebSockets.');
        } else {
            webSocket = new WebSocket(address);
            webSocket.onmessage = onmessage;
            webSocket.onerror = onerror;
        }
    }

    gateway.disconnect = function() {
        webSocket.close();
    }

    gateway.isConnected = function() {
        return webSocket.readyState == 1 ? true : false;
    }

    gateway.read = function(arraySize) {
        webSocket.send('read');
        webSocket.send(arraySize);
    }

    gateway.write = function(array, buffer) {
        if(!array) {
            alert('Array is not set.');
            return;
        }

        if(!buffer) {
            alert('Buffer is not set.');
            return;
        }

        if(maxWriteBuffer === 0) {
            alert('There is no read request.');
            return;
        }

        if(buffer > maxWriteBuffer) {
            alert('Buffer is bigger than server can receive.');
            return;
        }

        if(!webSocket || webSocket.readyState == 3) {
            alert('There is no connection.');
            return;
        }

        webSocket.send('start');
        for(var start = 0; start <= array.size; start += buffer) {
            var chunk = array.slice(start, start + buffer);
            webSocket.send(chunk);
        }
        webSocket.send('end');
    }

    gateway.setMaxWriteBuffer = function(size) {
        maxWriteBuffer = size;
    }

    return gateway;
}(gateway || {}));