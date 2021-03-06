//
// This example shows a simple implementation of UPnP-SSDP M-SEARCH
// discovery using a multicast UDPSocket
//

var address = '127.0.0.1',
    port = '5555',
    serviceType = 'upnp:rootdevice',
    rn = '\r\n',
    search = '';

//  Request permission to send multicast messages to the address and
//  port reserved for SSDP
navigator.udpPermission.requestPermission({remoteAddress:"127.0.0.1",
                                           remotePort:5555}).then(
  () => {
    // Permission was granted

    //  Create a new UDP client socket
    var mySocket = new UDPSocket();

    // Build an SSDP M-SEARCH multicast message
    search += 'M-SEARCH * HTTP/1.1' + rn;
    search += 'ST: ' + serviceType + rn;
    search += 'MAN: "ssdp:discover"' + rn;
    search += 'HOST: ' + address + ':' + port + rn;
    search += 'MX: 10';


    // Receive and log SSDP M-SEARCH response messages
    function receiveMSearchResponses() {
      mySocket.readable.getReader().read().then(({ value, done }) => {
        if (done) return;

        console.log('Remote address: ' + value.remoteAddress +
                    'Remote port: ' + value.remotePort +
                    'Message: ' + ab2str(value.data));
        // ArrayBuffer to string conversion could also be done by piping
        // through a transform stream. To be updated when the Streams API
        // specification has been stabilized on this point.
      });
    }

    // Join SSDP multicast group
    mySocket.joinMulticast(address);

    // Send SSDP M-SEARCH multicast message
    mySocket.writeable.write(
      {data : str2ab(search),
       remoteAddress : address,
       remotePort : port
      }).then(
        () => {
          // Data sent sucessfully, wait for response
          console.log('M-SEARCH Sent');
          receiveMSearchResponses();
        },
        e => console.error("Sending error: ", e);
    );

    // Log result of UDP socket setup.
    mySocket.opened.then(
      () => {
        console.log("UDP socket created sucessfully");
      },
      e =>console.error("UDP socket setup failed due to error: ", e);
    );

    // Handle UDP socket closed, either as a result of the application
    // calling mySocket.close() or an error causing the socket to be
    // closed.
    mySocket.closed.then(
      () => {
         console.log("Socket has been cleanly closed");
      },
      e => console.error("Socket closed due to error: ", e);
    );

  },
  e => console.error("Sending SSDP multicast messages was denied due
                      to error: ", e);
                    );
);

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
    
    