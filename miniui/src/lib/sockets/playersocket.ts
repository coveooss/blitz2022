import { createSocket } from './socket';
import { writable } from 'svelte/store';
import type { PlayerTick } from '../../gametypings';
import type { PlayerAI } from '../ai/playertypes';

export interface Player {
	name: string;
	isConnected: boolean;
}

export const createPlayerSocket = (name: string, ai: PlayerAI) => {
	let player: Player = {
		name,
		isConnected: false
	};
	const playerStore = writable<Player>(player);
	const partialPlayerUpdate = (update: Partial<Player>) => {
		player = {
			...player,
			...update
		};
		playerStore.set(player);
	};
	const socket = createSocket({
		onOpen: () => {
			partialPlayerUpdate({
				isConnected: true
			});
			console.log('Registering');
			socket.send(JSON.stringify({ type: 'REGISTER', teamName: name }));
		},
		onClose: () => {
			partialPlayerUpdate({
				isConnected: false
			});
		},
		supportedMessages: {
			message: (data: any) => {
				console.log('Message from server:', data.message);
			},
			tick: (data: PlayerTick) => {
				const command = ai.processTick(data);
				if (command) {
					socket.send(JSON.stringify({ type: 'COMMAND', tick: data.tick, ...command }));
				}
			}
		}
	});

	return playerStore;
};
