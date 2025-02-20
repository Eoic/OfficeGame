export default abstract class Multiplayer {
    static chatSocket: WebSocket;
    static player: string;
    static room: string;
    private static handlers: Array<Function> = [];
    private static connected: boolean = false;

    static connect () {
        Multiplayer.chatSocket = new WebSocket('ws://' + window.location.host + '/ws/game/');

        Multiplayer.chatSocket.onmessage = function(e) {
            Multiplayer.on_message(e.data);
        };

        Multiplayer.chatSocket.onclose = function(e) {
            console.error('Game socket closed unexpectedly');
            Multiplayer.connected = false;
        };

        Multiplayer.chatSocket.onopen = () => {
            Multiplayer.connected = true;
        };
    }

    private static on_message(dataMsg: string) {
        const data = JSON.parse(dataMsg);
        const message = data['data'];
        // Handle incoming message
        Multiplayer.handlers.forEach(action => {
            action(message);
        });
    }

    static sendMessage(data: object) {
        if (!Multiplayer.connected) return;
        
        Multiplayer.chatSocket.send(JSON.stringify({
            'event': 'update',
            'room': Multiplayer.room,
            'player': Multiplayer.player,
            'data': data
        }));
    }

    static addHandler(action: Function) {
        Multiplayer.handlers.push(action);
    }
}

