import WebSocket from 'ws';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';
import { createServer, Server as HttpServer } from 'http';
import { Game } from '../game/game';
import { SocketedTeam } from './socketedTeam';
import { logger } from '../logger';
import { SocketMessage } from './socketMessage';
import { SocketedViewer } from './socketedViewer';
import { TeamError, SocketRegisteringError } from '../game/error';
import { RecorderMode } from '../recorder/recorder';

export class Server {
    private server: HttpServer;
    private webSocketServer: WebSocket.Server;

    constructor(
        private port: number = 8765,
        private game: Game,
        private serveUi: boolean = false,
        private teamNamesByToken: { [token: string]: string } = null,
    ) {
        if (this.serveUi) {
            logger.info(`Web viewer available on http://localhost:${port}`);

            const serve = serveStatic('./ui/');
            this.server = createServer(function (req, res) {
                const done = finalhandler(req, res);
                serve(req, res, () => done(null));
            });
        } else {
            this.server = createServer();
        }
        this.webSocketServer = new WebSocket.Server({ server: this.server });

        this.game.onGameCompleted((gameResults, err) => {
            gameResults.forEach((r) => logger.info(`Team ${r.teamName} finished #${r.rank} with ${r.score} points!`));

            if (err) {
                logger.error(`An error occured while playing the game.`, err);
            }

            this.webSocketServer.clients.forEach((c) => c.close());

            this.webSocketServer.close((err) => {
                if (err) {
                    logger.error(`An error occured while closing the websocket. ${err}`, err);
                }
            });

            this.server.close((err) => {
                if (err) {
                    logger.error(`An error occured while closing the server. ${err}`, err);
                }
            });
        });
    }

    public async listen(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.webSocketServer.on('connection', (socket) => {
                    const registerTimeout = setTimeout(() => {
                        logger.warn(`Client didn't registered in time, closing the connection.`);
                        socket.close();
                    }, 5000);

                    socket.on('close', () => {
                        clearTimeout(registerTimeout);
                    });

                    socket.on('message', (data) => {
                        try {
                            const message: SocketMessage = JSON.parse(data.toString());

                            if (message.type === 'VIEWER') {
                                const viewer = new SocketedViewer(socket, this.game, RecorderMode.Command);
                                logger.debug(`New Viewer connection for ${viewer}`, socket);

                                clearTimeout(registerTimeout);
                            }

                            if (message.type === 'REGISTER') {
                                let teamName;

                                if ('token' in message) {
                                    if (!this.teamNamesByToken && message.token !== '') {
                                        throw new SocketRegisteringError('You need to register using a teamName');
                                    }

                                    teamName = this.teamNamesByToken[message.token];
                                }

                                if ('teamName' in message) {
                                    if (this.teamNamesByToken && teamName !== '') {
                                        throw new SocketRegisteringError('You need to register using your secret token');
                                    }

                                    teamName = message.teamName;
                                }

                                if (!teamName || teamName === '') {
                                    throw new SocketRegisteringError(`You need to specify a team name`);
                                }

                                const team = new SocketedTeam(socket, this.game, teamName);
                                logger.debug(`New socket connection for ${team}`, socket);

                                clearTimeout(registerTimeout);
                            }
                        } catch (ex) {
                            if (ex instanceof SocketRegisteringError || ex instanceof SyntaxError || ex instanceof TeamError) {
                                logger.warn(ex.message);
                            } else {
                                throw ex;
                            }

                            socket.close();
                        }
                    });
                });

                this.server.listen({ port: this.port });

                logger.info(`Game server listening on port ${this.port}`);

                this.webSocketServer.on('close', () => {
                    resolve();
                });
            } catch (ex) {
                logger.error(`Error starting the server : ${ex.stack}`);
                reject(ex);
            }
        });
    }

    public async close(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.webSocketServer.close((err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}
