import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import {makeExecutableSchema} from '@graphql-tools/schema';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import {WebSocketServer} from 'ws';
import {useServer} from 'graphql-ws/lib/use/ws';
import typeDefs from './schema';
import resolvers from './resolvers';
import getDataSources from './datasources';
import config from "./config";
import {createHandler} from 'graphql-sse/lib/use/express';
import path from 'path';

export interface DataSourceContext {
    req?: express.Request,
    res?: express.Response
}

// Permet de typer fortement le contexte des resolvers
export interface Context extends DataSourceContext {
    dataSources: Awaited<ReturnType<typeof getDataSources>>
}

// Required logic for integrating with Express
const app = express();
// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(app);

// Conversion des schema Apollo pour graphql-sse
const schema = makeExecutableSchema({typeDefs, resolvers});

async function defineContext({ req, res }: { req: express.Request, res: express.Response }): Promise<Context> {
    return {
        dataSources: await getDataSources(),
    }
}

let serverCleanup: any = () => {
};
if (config.enableWS) {
    console.log('► Websocket enabled ✅');
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });
    serverCleanup = useServer({
        schema,
        context: defineContext
    }, wsServer);
} else {
    console.log('► Websocket disabled ❌');
}

const server = new ApolloServer<Context>({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({httpServer}),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        if (config.enableWS && typeof serverCleanup?.dispose === "function") {
                            await serverCleanup.dispose();
                        }
                    },
                };
            },
        },
    ],
});

async function start() {

// Ensure we wait for our server to start
    await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
    app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        bodyParser.json({ limit: '5mb' }),
        // expressMiddleware accepts the same arguments:
        // an Apollo Server instance and optional configuration options
        expressMiddleware(server, {
            context: await defineContext,
        }),
    );

    if (config.enableSSE) {
        console.log('► SSE enabled ✅');
        // Le handler pour permettre express de communiquer en SSE
        const sseHandler = createHandler({schema});

        // Utilisation du handler SSE
        app.use('/graphql/stream', sseHandler);
    } else {
        console.log('► SSE disabled ❌');
    }

    app.use('/static', express.static(path.join(__dirname, '../static')));

    // Server startup
    await new Promise<void>((resolve) => httpServer.listen({port: 4000, host: '0.0.0.0'}, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/`);
}

start()
