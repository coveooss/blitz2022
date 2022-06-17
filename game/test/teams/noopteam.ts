import { Team } from '../../src/game/teams/team';
import { Game } from '../../src/game/game';
import { PlayerTick } from '../../src/game/types';

export class NoopTeam extends Team {
    constructor(game: Game) {
        super(game, 'Noop');
    }

    public async getNextCommand(tick: PlayerTick): Promise<any> {
        return { type: 'COMMAND', tick: tick.tick };
    }
}
