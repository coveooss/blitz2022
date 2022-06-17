import WebSocket from 'ws';
import { Viewer } from './../game/viewer';
import { Game } from './../game/game';
import { ViewerTick } from './../game/types';
import { RecorderMode } from '../recorder/recorder';

export class SocketedViewer extends Viewer {
    constructor(private socket: WebSocket, game: Game, private recordingMode: RecorderMode) {
        super(game);

        this.socket.send(
            JSON.stringify({
                type: 'message',
                message: 'Succesfully registered as viewer!',
            }),
        );

        this.socket.on('close', () => {
            this.game.deregisterViewer(this);
        });

        this.game.onGameCompleted(() => {
            this.socket.close();
        });

        this.game.registerViewer(this);
    }

    onTick(tick: ViewerTick): void {
        this.socket.send(JSON.stringify({ type: 'tick', tick: tick }));
    }

    onCommand(tick: ViewerTick, playingTeamId: string): void {
        tick.teams.forEach((team) => (team.events = team.id === playingTeamId ? team.events : []));
        if (this.recordingMode === RecorderMode.Command) {
            this.socket.send(
                JSON.stringify({
                    type: 'tick',
                    tick: {
                        ...tick,
                        playingTeamId: playingTeamId,
                    },
                }),
            );
        }
    }
}
