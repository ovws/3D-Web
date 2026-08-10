import { Events } from './Events.js'

// Local no-op adapter kept for world features that previously listened to the
// upstream multiplayer service. This personalized build never opens a socket.
export class Server
{
    constructor()
    {
        this.connected = false
        this.initData = null
        this.events = new Events()
    }

    send()
    {
        return false
    }
}
