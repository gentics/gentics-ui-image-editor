const connect = require('connect');
const path = require('path');
const slow = require('connect-slow');
const serveStatic = require('serve-static');
const morgan = require('morgan');

/**
 * A very simple static server which adds latency to the response to simulate a slow network / large image file
 * being downloaded.
 */
const LATENCY = 3000;
const logger = morgan('Slowly serving :method :url :status (response took :response-time ms)');

const app = connect()
    .use(logger)
    .use(slow({
        delay: LATENCY
    }))
    .use(serveStatic(path.resolve(__dirname,'./test-images')));
app.listen(4000);
