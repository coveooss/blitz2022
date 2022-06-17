import winston from 'winston';

const getPrettyFormat: (options: { prettyColors: boolean }) => winston.Logform.Format = ({ prettyColors }) => {
    return winston.format.combine(
        winston.format((info) => {
            info.level = info.level.toUpperCase();
            return info;
        })(),
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        prettyColors ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.printf((info) => {
            let formatString = `[${info.level}] ${info.timestamp}: ${info.message}`;
            if (info.stack) {
                formatString = `${formatString} ${info.stack}`;
            }
            return formatString;
        }),
    );
};

const getTransports = () => {
    const env = process.env.NODE_ENV || 'development';
    const errorToFileTransport = new winston.transports.File({
        filename: 'error.log',
        level: 'error',
        options: { flags: 'w' },
    });

    switch (env) {
        case 'test': {
            return [errorToFileTransport];
        }
        case 'development': {
            return [
                errorToFileTransport,
                new winston.transports.Console({
                    format: winston.format.combine(getPrettyFormat({ prettyColors: true })),
                    level: 'info',
                }),
            ];
        }
        case 'production': {
            return [
                new winston.transports.File({
                    filename: 'game_logs.txt',
                    level: 'info',
                    options: { flags: 'w' },
                }),
                new winston.transports.Console({
                    format: winston.format.combine(getPrettyFormat({ prettyColors: true })),
                    level: 'info',
                }),
            ];
        }
    }
};

export const logger = winston.createLogger({
    level: 'info',
    format: getPrettyFormat({ prettyColors: false }),
    transports: getTransports(),
});
