import { Server } from "bun";
import { METHODS } from "http";

type handlerFunction = (req: Request, server: Server, next: () => void) => Response

export default class App {
    server: Server | null = null;
    paths: {
        [key:string]: Map<string, handlerFunction[]>
    } = {};
    [key: string]: any;

    constructor() {
        METHODS.forEach(method => {
            this[method] = (path: string, ...callbacks: handlerFunction[]) => {
                if (!this.paths[method]) this.paths[method] = new Map<string, handlerFunction[]>()
                this.paths[method].set(path, callbacks)
            }
        })
    }

    listen(port: number) {
        let appInstance = this;
        this.server = Bun.serve({
            port: 3000,
            fetch(request, server) {
                const url = new URL(request.url);
                const handlers = appInstance.paths[request.method].get(url.pathname)
                if (!handlers) return _404_response

                if (handlers.length == 0) {
                    return _404_response()
                }

                let response: Response;
                for (let i = 0; i < handlers.length; i++) {
                    const handler = handlers[i];
                    let next = false;
                    response = handler(request, server, () => {
                        // move to the next iteration

                    });
                }
                // handlers?.forEach((handler) => {
                //     response = handler(request, server, () => {})
                // })
                
                if (!response) return _404_response()
                
                return response;
                // return handler ? (() => {
                    
                // })() : new Response("404", {
                //     status: 404,
                //     statusText: "Resource not found"
                // });
            },
        })
    }
}


function _404_response () {
    return new Response("404", {
        status: 404,
        statusText: "Resource not found"
    })
}