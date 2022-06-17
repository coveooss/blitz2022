import { Team } from '../game/teams/team';

import WebSocket from 'ws';
import { SocketCommandMessage, SocketMessage } from './socketMessage';
import { Game } from '../game/game';
import { SocketClosedError, TeamError } from '../game/error';
import { logger } from '../logger';
import { Command, PlayerTick } from '../game/types';

interface SocketTickCallback {
    tick: number;
    resolve: (value: SocketCommandMessage) => void;
    reject: (err: Error | string) => void;
}

export class SocketedTeam extends Team {
    private socketCallback: SocketTickCallback;

    constructor(private socket: WebSocket, game: Game, name: string) {
        super(game, name);

        this.initializeWebhookCallbacks();
    }

    public async getNextCommand(playerTick: PlayerTick): Promise<Command> {
        if (this.socket.readyState === this.socket.CLOSED) {
            throw new SocketClosedError(this, `Socket connection lost`);
        }

        if (this.socketCallback) {
            this.socketCallback = null;
        }

        const command = await new Promise<Command>((resolve, reject) => {
            this.socket.send(JSON.stringify({ type: 'TICK', ...playerTick }));
            this.socketCallback = { tick: playerTick.tick, resolve, reject };
        });

        return command;
    }

    private initializeWebhookCallbacks() {
        this.socket.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString()) as SocketMessage;

                switch (message.type) {
                    case 'COMMAND': {
                        if (message.tick !== this.socketCallback.tick) {
                            throw new TeamError(this, `Invalid tick number received: ${message.tick}`);
                        }

                        this.socketCallback.resolve(message);
                        break;
                    }
                    default: {
                        throw new TeamError(this, `Unexpected message type received: ${message}`);
                    }
                }
            } catch (ex) {
                // TO DO, do something different based on the error. YES BUT WHATTTT
                if (ex instanceof SyntaxError) {
                    logger.warn(`Invalid message from ${this}. ${ex.message}`, data);
                    return;
                }

                if (ex instanceof TeamError) {
                    logger.warn(`${this}. ${ex.message}`);
                    return;
                }

                throw ex;
            }
        });

        this.socket.on('close', () => {
            logger.info('Handling close event on socket.');
            if (!this.game.isCompleted) {
                if (this.socketCallback) {
                    this.socketCallback.reject('Socket disconnected');
                }

                this.kill();
                logger.warn(`${this} disconnected`);
                this.events.push({ action: 'DISCONNECT' });
            }
        });

        this.socket.on('error', () => {
            logger.info('Handling error event on socket.');
            if (!this.game.isCompleted) {
                if (this.socketCallback) {
                    this.socketCallback.reject('Socket disconnected');
                }

                this.kill();
                logger.warn(`${this} disconnected`);
                this.events.push({ action: 'DISCONNECT' });
            }
        });
    }
}
