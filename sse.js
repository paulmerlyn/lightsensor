// Courtesy: https://www.terlici.com/2015/12/04/realtime-node-expressjs-with-sse.html
module.exports = function (request, response, next) {
    const range = 1000;
    let id = 0;

    // Attach SSE set up function to response object. Function sends preliminary HTTP headers for SSE
    response.sseSetup = function() {
        response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
        })
    }

    // Attach SSE send function to response object. Function sends data to registered listener clients.
    response.sseSend = function(data) {
        response.write("data: " + JSON.stringify(data) + "\nid: " + _generateID(range) + "\n\n");
    }

    // Attach ID generator function to response object
    _generateID = function(range) {
        id = (id < 1000 ? id : 1);
        return ++id
    }

    next()
}