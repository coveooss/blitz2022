import { createSocket } from '../sockets/socket';
import { writable, get } from 'svelte/store';
import type { ViewerTick } from '../../../../game/dist/game/types';
import { createHistory } from './history';
import type { EnhancedTick } from '../../gametypings';
import { enhanceTick } from '../ticks/ticksenhancer';

export const isConnected = writable(false);


let ticks = createHistory<EnhancedTick>();
export type TicksStore = typeof ticks;
export const games = createHistory<typeof ticks>();
let ticksBuffer = [];

const socket = createSocket({
	onOpen: () => {
		ticksBuffer = [];
		isConnected.set(true);
		ticks = createHistory<EnhancedTick>();
		games.push(ticks);
		socket.send(JSON.stringify({ type: 'VIEWER' }));
	},
	onClose: () => {
		isConnected.set(false);
	},
	supportedMessages: {
		message: (data: { message: string }) => {
			console.log('Message from server:', data.message);
		},
		tick: (data: { tick: ViewerTick }) => {
			const enhancedTick = enhanceTick(data.tick, get(ticks).list.length + ticksBuffer.length);
			ticksBuffer.push(enhancedTick);
			if (!('playingTeamId' in enhancedTick)) {
				ticks.push(...ticksBuffer);
				ticksBuffer = [];
			}
		}
	}
});
