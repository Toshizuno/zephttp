import http from 'node:http';
import https from 'node:https';

// Creates an HTTP/1.1 server.
export function createServer(options = new https.Agent().options) {
        const stack = {};

        // Initializes the secure HTTP/1.1 server object.
        const server = (
                options?.cert &&
                options?.key
        ) ?
                https.createServer(options) :
                http.createServer();

        // Request handling.
        server.on('request', function (request, response) {
                const method = request.method.toLowerCase();
                const subdomain = request.headers.host.split('.').slice(0, -2).join('.').toLowerCase();
                const { pathname } = new URL(request.url, `http${(
                        options?.cert &&
                        options?.key
                ) ? 's' : ''}://${request.headers.host}`);
                stack[subdomain]?.[method]?.[pathname]?.(request, response);
        });

        // Returns the object generated by the function.
        return {
                on: function (
                        path = '/',
                        {
                                allowedMethods = ['get'],
                                allowedSubdomains = ['', 'www']
                        },
                        callback = function (
                                request = new http.IncomingMessage(),
                                response = new http.ServerResponse()
                        ) {}
                ) {
                        // Ensures that all subdomains are a part of the stack.
                        for (const subdomain of allowedSubdomains) {
                                if (typeof stack[subdomain.toLowerCase()] !== 'object') {
                                        stack[subdomain.toLowerCase()] = {};
                                };

                                // Ensures that all methods are a part of the subdomain's stack.
                                for (const method of allowedMethods) {
                                        if (typeof stack[subdomain.toLowerCase()][method.toLowerCase()] !== 'object') {
                                                stack[subdomain.toLowerCase()][method.toLowerCase()] = {};
                                        };

                                        // Registers the route to the selected subdomain under the specified method.
                                        stack[subdomain.toLowerCase()][method.toLowerCase()][path.toLowerCase()] = callback;
                                        console.log(`${method.toLowerCase()}\t${subdomain.toLowerCase()}\t${path.toLowerCase()}`);
                                };
                        };
                },
                listen: function (
                        port = (
                                options?.cert &&
                                options?.key
                        ) ? 443 : 80,
                        address = '0.0.0.0',
                        callback = function () {}
                ) {
                        server.listen(port, address, callback);
                },
                server
        };
};

// Exports everything under a default variable.
export default {
        createServer
};
