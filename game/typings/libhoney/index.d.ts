declare module 'libhoney' {
    export interface LibhoneyEvent {
        addField: (field: string, value: any) => void;
        send: () => void;
        metadata: { [key: string]: any };
    }

    export interface LibhoneyOptions {
        writeKey: string;
        dataset: string;
        proxy: string;
        disabled: boolean;
        responseCallback: any;
    }

    export default class Libhoney {
        constructor(options: Partial<LibhoneyOptions>);
        public newEvent(): LibhoneyEvent;
    }
}
