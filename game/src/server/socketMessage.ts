import { Command, Tick } from '../game/types';

export type SocketMessage = SocketRegisterNameMessage | SocketRegisterTokenMessage | SocketCommandMessage | SocketViewerMessage;

export type SocketRegisterNameMessage = {
    type: 'REGISTER';
    teamName: string;
};

export type SocketRegisterTokenMessage = {
    type: 'REGISTER';
    token: string;
};

export type SocketViewerMessage = {
    type: 'VIEWER';
};

export type SocketCommandMessage = Command & {
    type: 'COMMAND';
    tick: number;
};

export type SocketRegisterAckMessage = {
    type: 'REGISTER_ACK';
    teamName: string;
    teamId: string;
};

export type SocketTickMessage = Tick & {
    type: 'TICK';
};

export const socketRegisterMessage = (teamName: string): string =>
    JSON.stringify({
        type: 'REGISTER',
        teamName,
    });

export const socketRegisterAckMessage = (teamName: string, teamId: string): string =>
    JSON.stringify({
        type: 'REGISTER_ACK',
        teamId,
        teamName,
    });
