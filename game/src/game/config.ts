export class UNIT {
    public static INITIAL_UNIT_COUNT = 3;
}

export class TEAM {}

export class SCORE {
    public static POINTS_PER_DIAMOND = 1;
    public static NUMBER_OF_TICKS_OF_WARM_UP_PERIOD = 0;

    public static isTickWithinWarmUpPeriod(tick: number): boolean {
        return tick < this.NUMBER_OF_TICKS_OF_WARM_UP_PERIOD;
    }
}

export class MAP {
    public static MAX_UNITS_ON_A_POSITION = 1;
}

export class DIAMOND {
    public static INITIAL_SUMMON_LEVEL = 1;
    public static MAXIMUM_SUMMON_LEVEL = 5;
}

export class GAME {
    public static TEAM_PLAY_ORDERINGS_HORIZON = 5;
    public static NUMBER_OF_TICKS_WITH_ADDITIONAL_RESPONSE_DELAY = 10;
    public static ADDITIONAL_DELAY_MS = 1000;
}
