export const UNIT_INDEX_TO_NAME = ["Crocodile", "Eagle", "Jaguar", "Snake"];
export const POINTS_THRESHOLDS = [5, 10, 50, 100];
export const POINTS_PER_SUMMON_LEVEL = [1, 2, 3, 4, 5];

export const getDiamondLevelForPoints = (points: number) => {
    if (points < POINTS_THRESHOLDS[0]) {
        return 1;
    } else if (points < POINTS_THRESHOLDS[1]) {
        return 2;
    } else if (points < POINTS_THRESHOLDS[2]) {
        return 3;
    } else if (points < POINTS_THRESHOLDS[3]) {
        return 4;
    } else {
        return 5;
    }
}