declare module 'a-star' {
    interface Options<N> {
        start: N;
        isEnd: (node: N) => boolean;
        neighbor: (node: N) => N[];
        distance: (from: N, to: N) => number;
        heuristic: (node: N) => number;
        hash: (node: N) => string;
        timeout?: number;
    }

    interface Path<N> {
        status: 'success' | 'noPath' | 'timeout';
        path: N[];
        cost: number;
    }

    function aStar<N>(options: Options<N>): Path<N>;

    export = aStar;
}
