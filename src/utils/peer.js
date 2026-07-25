import { Peer } from 'peerjs';

class PeerManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.peerId = null;
    this.role = null; // 'HOST' (Player 1) or 'GUEST' (Player 2)
    this.onDataCallbacks = [];
    this.onConnectCallbacks = [];
    this.onDisconnectCallbacks = [];
  }

  // Generate 4-digit numeric room code (e.g., 7392) -> Peer ID: "sd-deduct-7392"
  generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Create room as Host (Player 1)
  createRoom(roomCode, onOpen, onError) {
    this.role = 'HOST';
    const fullId = `sd-deduct-${roomCode}`;

    if (this.peer) this.peer.destroy();

    this.peer = new Peer(fullId, {
      debug: 1
    });

    this.peer.on('open', (id) => {
      this.peerId = id;
      if (onOpen) onOpen(roomCode);
    });

    this.peer.on('connection', (connection) => {
      this.conn = connection;
      this.setupConnectionListeners();
      this.onConnectCallbacks.forEach((cb) => cb());
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS Host Error:', err);
      if (onError) onError(err.message || 'Xona yaratishda xatolik yuz berdi.');
    });
  }

  // Join room as Guest (Player 2)
  joinRoom(roomCode, onConnected, onError) {
    this.role = 'GUEST';
    const hostFullId = `sd-deduct-${roomCode}`;

    if (this.peer) this.peer.destroy();

    // Guest random peer ID
    this.peer = new Peer({ debug: 1 });

    this.peer.on('open', (id) => {
      this.peerId = id;
      const connection = this.peer.connect(hostFullId);
      this.conn = connection;

      connection.on('open', () => {
        this.setupConnectionListeners();
        this.onConnectCallbacks.forEach((cb) => cb());
        if (onConnected) onConnected();
      });

      connection.on('error', (err) => {
        console.error('PeerJS Connection Error:', err);
        if (onError) onError('Xonaga ulanib bo\'lmadi. Xona kodi to\'g\'riligini tekshiring.');
      });
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS Guest Error:', err);
      if (onError) onError('Ulanishda xatolik. Tarmoqni tekshiring.');
    });
  }

  setupConnectionListeners() {
    if (!this.conn) return;

    this.conn.on('data', (data) => {
      this.onDataCallbacks.forEach((cb) => cb(data));
    });

    this.conn.on('close', () => {
      this.onDisconnectCallbacks.forEach((cb) => cb());
    });
  }

  send(data) {
    if (this.conn && this.conn.open) {
      this.conn.send(data);
    }
  }

  onData(callback) {
    this.onDataCallbacks.push(callback);
    return () => {
      this.onDataCallbacks = this.onDataCallbacks.filter((cb) => cb !== callback);
    };
  }

  onConnect(callback) {
    this.onConnectCallbacks.push(callback);
    return () => {
      this.onConnectCallbacks = this.onConnectCallbacks.filter((cb) => cb !== callback);
    };
  }

  onDisconnect(callback) {
    this.onDisconnectCallbacks.push(callback);
    return () => {
      this.onDisconnectCallbacks = this.onDisconnectCallbacks.filter((cb) => cb !== callback);
    };
  }

  disconnect() {
    if (this.conn) this.conn.close();
    if (this.peer) this.peer.destroy();
    this.conn = null;
    this.peer = null;
    this.role = null;
    this.onDataCallbacks = [];
    this.onConnectCallbacks = [];
    this.onDisconnectCallbacks = [];
  }
}

export const peerManager = new PeerManager();
