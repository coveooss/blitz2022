import { Game } from './game';
import { ViewerTick } from './types';

export abstract class Viewer {
    constructor(protected game: Game) {}
    public abstract onCommand(tick: ViewerTick, playingTeamId: string): void;
    public abstract onTick(tick: ViewerTick): void;
}
