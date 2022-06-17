import yargs from 'yargs';
import fs from 'fs';

import { Server } from './server/server';
import { Game } from './game/game';
import { Recorder, RecorderMode } from './recorder/recorder';
import { logger } from './logger';
import { GameMap, MAP_FILE_FOLDER } from './game/map';
import { UNIT } from './game/config';
import { ArgumentError } from './game/error';

const splash = `                                                                                                                                                                                                                                                                                      
BBBBBBBBBBBBBBBBB   lllllll   iiii          tttt                                      222222222222222         000000000      222222222222222     222222222222222    
B::::::::::::::::B  l:::::l  i::::i      ttt:::t                                     2:::::::::::::::22     00:::::::::00   2:::::::::::::::22  2:::::::::::::::22  
B::::::BBBBBB:::::B l:::::l   iiii       t:::::t                                     2::::::222222:::::2  00:::::::::::::00 2::::::222222:::::2 2::::::222222:::::2 
BB:::::B     B:::::Bl:::::l              t:::::t                                     2222222     2:::::2 0:::::::000:::::::02222222     2:::::2 2222222     2:::::2 
  B::::B     B:::::B l::::l iiiiiiittttttt:::::ttttttt    zzzzzzzzzzzzzzzzz                      2:::::2 0::::::0   0::::::0            2:::::2             2:::::2 
  B::::B     B:::::B l::::l i:::::it:::::::::::::::::t    z:::::::::::::::z                      2:::::2 0:::::0     0:::::0            2:::::2             2:::::2 
  B::::BBBBBB:::::B  l::::l  i::::it:::::::::::::::::t    z::::::::::::::z                    2222::::2  0:::::0     0:::::0         2222::::2           2222::::2  
  B:::::::::::::BB   l::::l  i::::itttttt:::::::tttttt    zzzzzzzz::::::z                22222::::::22   0:::::0 000 0:::::0    22222::::::22       22222::::::22   
  B::::BBBBBB:::::B  l::::l  i::::i      t:::::t                z::::::z               22::::::::222     0:::::0 000 0:::::0  22::::::::222       22::::::::222     
  B::::B     B:::::B l::::l  i::::i      t:::::t               z::::::z               2:::::22222        0:::::0     0:::::0 2:::::22222         2:::::22222        
  B::::B     B:::::B l::::l  i::::i      t:::::t              z::::::z               2:::::2             0:::::0     0:::::02:::::2             2:::::2             
  B::::B     B:::::B l::::l  i::::i      t:::::t    tttttt   z::::::z                2:::::2             0::::::0   0::::::02:::::2             2:::::2             
BB:::::BBBBBB::::::Bl::::::li::::::i     t::::::tttt:::::t  z::::::zzzzzzzz          2:::::2       2222220:::::::000:::::::02:::::2       2222222:::::2       222222
B:::::::::::::::::B l::::::li::::::i     tt::::::::::::::t z::::::::::::::z          2::::::2222222:::::2 00:::::::::::::00 2::::::2222222:::::22::::::2222222:::::2
B::::::::::::::::B  l::::::li::::::i       tt:::::::::::ttz:::::::::::::::z          2::::::::::::::::::2   00:::::::::00   2::::::::::::::::::22::::::::::::::::::2
BBBBBBBBBBBBBBBBB   lllllllliiiiiiii         ttttttttttt  zzzzzzzzzzzzzzzzz          22222222222222222222     000000000     2222222222222222222222222222222222222222
`;

const args = yargs(process.argv.slice(2))
    .options({
        timePerTickMs: {
            type: 'number',
            default: 1000,
            description: 'Max time the game will wait for a tick',
        },
        delayBetweenTicksMs: {
            type: 'number',
            default: 10,
            description: 'Time to wait between ticks',
        },
        nbOfTicks: {
            type: 'number',
            default: 300,
            description: 'Number of tick to play',
        },
        gameStartTimeoutMs: {
            type: 'number',
            default: 500000,
            description: 'Delay before starting the game',
        },
        nbOfTeams: {
            type: 'number',
            description: 'Number of teams to expect before starting the game',
        },
        nbOfUnitsPerTeam: {
            type: 'number',
            description: 'Number of units per team when starting the game',
            default: UNIT.INITIAL_UNIT_COUNT,
        },
        recordPath: {
            type: 'string',
            description: 'File path to record replay to',
        },
        s3Bucket: { type: 'string' },
        s3Path: { type: 'string' },
        keepAlive: {
            type: 'boolean',
            default: true,
            description: 'Indicates if the game should close or restart on completion',
        },
        teamNamesByToken: { type: 'string' },
        serveUi: { type: 'boolean', default: true },
        mapName: {
            alias: 'gameConfig',
            type: 'string',
            description: "Map name, ex. 'easy-1_14x20_4D.bmp'",
        },
        port: {
            type: 'number',
            description: 'The port of the server backend',
            default: 8765,
        },
    })
    .version(process.env.VERSION || 'DEV')
    .command('list-maps', 'List all the available maps', () => {
        const files = fs.readdirSync(MAP_FILE_FOLDER);
        console.log("Here's the maps you can use, add the --gameConfig=[MAP] option to change the default.");
        files.forEach((f) => {
            console.log(`\t - ${f}`);
        });

        process.exit();
    })
    .command('validate-maps', false, () => {
        const files = fs.readdirSync(MAP_FILE_FOLDER);
        files.forEach((f) => {
            try {
                GameMap.fromFile(MAP_FILE_FOLDER + f);
            } catch (error) {
                console.log(`\t - ${f} - Invalid - `, error);
                return;
            }
            console.log(`\t - ${f} - Valid`);
        });

        process.exit();
    })
    .hide('gameStartTimeoutMs')
    .hide('recordPath')
    .hide('s3Bucket')
    .hide('s3Path')
    .hide('keepAlive')
    .hide('teamNamesByToken')
    .hide('serveUi')
    .hide('port')
    .hide('version')
    .env(true)
    .example([
        ['docker run [...]', 'Run server with all the maps in random'],
        ['docker run [...] --nbOfTeams=1 --gameConfig=easy-1_14x204D.bmp', 'Run server with custom map and custom number of teams'],
        ['docker run [...] list-maps', 'List the names of all available maps'],
    ])
    .scriptName('docker run [...]').argv;

console.log(splash);

(async () => {
    do {
        const game = new Game({
            timeMsAllowedPerTicks: args.timePerTickMs,
            numberOfTicks: args.nbOfTicks,
            maxWaitTimeMsBeforeStartingGame: args.gameStartTimeoutMs,
            expectedNumberOfTeams: args.nbOfTeams,
            gameMapFile: args.gameConfig ? MAP_FILE_FOLDER + args.gameConfig : null,
            delayMsBetweenTicks: args.delayBetweenTicksMs,
            numberOfUnitsPerTeam: args.nbOfUnitsPerTeam,
        });

        const teamNamesByToken = args.teamNamesByToken ? JSON.parse(args.teamNamesByToken) : null;
        const recorder = new Recorder(game, RecorderMode.Command);
        const server = new Server(args.port, game, args.serveUi, teamNamesByToken);

        await server.listen();

        logger.info('Game finished, saving state');

        if (args.recordPath) {
            logger.info(`Saving state file to ${args.recordPath}`);
            recorder.saveToFile(args.recordPath);
        }

        if (args.s3Bucket && args.s3Path) {
            logger.info(`Saving state file to S3 ${args.s3Bucket}/${args.s3Path}`);
            recorder.saveToS3(args.s3Bucket, args.s3Path);
        }
    } while (args.keepAlive);
})().catch((err) => {
    if (err instanceof ArgumentError) {
        console.log(err.message);
    } else {
        console.log(`Something went terribly wrong! ${err}`);
    }
    process.exit(1);
});
