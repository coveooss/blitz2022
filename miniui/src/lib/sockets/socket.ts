import WebSocket from 'isomorphic-ws';

interface SocketFunctions {
	onOpen?: () => void;
	onClose?: () => void;
	onError?: (error: string) => void;
	supportedMessages?: { [type: string]: (data: unknown) => void };
}

export const createSocket = ({ onOpen, onClose, onError, supportedMessages }: SocketFunctions) => {
	let currentClient: WebSocket;

	function attemptToReconnect() {
		const TIME_TO_RECONNECT = 5000;
		setTimeout(() => {
			console.log('Attempting to reconnect');
			recreateSocket();
		}, TIME_TO_RECONNECT);
	}

	function recreateSocket() {
		const client = new WebSocket('ws://localhost:8765');

		client.onerror = (error) => {
			onError?.(error.message);
			console.error(error);
		};

		client.onopen = () => {
			onOpen?.();
		};

		client.onclose = () => {
			onClose?.();
			client.close();
			attemptToReconnect();
		};

		client.onmessage = ({ data: rawData }) => {
			const data = JSON.parse(rawData.toString());
			if (data.type.toLowerCase() in supportedMessages) {
				supportedMessages[data.type.toLowerCase()](data);
			} else {
				console.warn(`Type ${data.type} is not supported in ${Object.keys(supportedMessages)}.`);
			}
		};

		currentClient = client;
	}

	recreateSocket();

	return {
		getSocket: () => currentClient,
		send: (data: unknown) => currentClient.send(data)
	};
};
