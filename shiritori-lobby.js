// Online lobby and games for the Shiritori game (vs.izie.top/shatori). One Durable Object (the "hub")
// holds every open lobby and game. The server is authoritative: it checks each word, runs the turn
// clock, and decides the winner. Rules come from game-core.js, the same file the browser uses.
//
// Free-plan notes: WebSockets are hibernated while idle (no duration billed), and room state lives in
// storage, so a hibernated hub loses nothing. Daily free-tier limits fail operations instead of billing.
import { DurableObject } from 'cloudflare:workers'
import './website/public/__subdomains/vs/shatori/game-core.js' // sets globalThis.ShiritoriCore

const C = globalThis.ShiritoriCore
const ASSET_BASE = 'https://vs.izie.top/__subdomains/vs/shatori'
const LOBBY_TTL_MS = 10 * 60 * 1000 // an unjoined lobby closes after 10 minutes
const RECONNECT_MS = 30 * 1000 // a player who drops has this long to come back before forfeiting
const NAME = /^[^\u0000-\u001f]{1,20}$/

let dictPromise = null
function loadDict(env) {
  if (!dictPromise) {
    dictPromise = Promise.all(
      ['words.txt', 'words-extra.txt'].map((f) =>
        env.ASSETS.fetch(new Request(`${ASSET_BASE}/${f}`)).then((r) => (r.ok ? r.text() : '')),
      ),
    ).then(([base, extra]) => C.buildDictionary(base + '\n' + extra))
    dictPromise.catch(() => (dictPromise = null)) // retry on the next message if the fetch failed
  }
  return dictPromise
}

const randomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}
const randomToken = () => crypto.randomUUID()

export class ShiritoriLobby extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env)
    this.env = env
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('expected a WebSocket', { status: 426 })
    const pair = new WebSocketPair()
    this.ctx.acceptWebSocket(pair[1])
    pair[1].serializeAttachment({ view: 'lobby' })
    await this.sendLobbies(pair[1])
    return new Response(null, { status: 101, webSocket: pair[0] })
  }

  // ---------- storage helpers ----------
  async getRoom(id) {
    return (await this.ctx.storage.get('room:' + id)) ?? null
  }
  async putRoom(room) {
    await this.ctx.storage.put('room:' + room.id, room)
  }
  async deleteRoom(id) {
    await this.ctx.storage.delete('room:' + id)
  }
  async allRooms() {
    const map = await this.ctx.storage.list({ prefix: 'room:' })
    return [...map.values()]
  }

  // ---------- messages ----------
  async webSocketMessage(ws, raw) {
    let msg
    try {
      msg = JSON.parse(raw)
    } catch {
      return this.send(ws, { t: 'error', msg: 'bad message' })
    }
    try {
      switch (msg?.t) {
        case 'list':
          return this.sendLobbies(ws)
        case 'host':
          return await this.host(ws, msg)
        case 'join':
          return await this.join(ws, msg)
        case 'resume':
          return await this.resume(ws, msg)
        case 'word':
          return await this.word(ws, msg)
        case 'pass':
          return await this.pass(ws)
        case 'leave':
          return await this.leave(ws)
        default:
          return this.send(ws, { t: 'error', msg: 'unknown message' })
      }
    } catch (err) {
      this.send(ws, { t: 'error', msg: 'server error, try again' })
      console.error('shiritori hub', err)
    }
  }

  async webSocketClose(ws) {
    const at = ws.deserializeAttachment() || {}
    if (!at.room) return
    const room = await this.getRoom(at.room)
    if (!room || !room.game || room.game.over) return
    // the other player keeps waiting for this seat; the alarm forfeits it if it doesn't return
    room.dropped = { seat: at.seat, at: Date.now() }
    await this.putRoom(room)
    this.broadcastState(room, at.seat, 'opponent disconnected, waiting')
    await this.scheduleAlarm(room)
  }

  webSocketError(ws) {
    this.webSocketClose(ws)
  }

  // ---------- actions ----------
  async host(ws, { name }) {
    if (!validName(name)) return this.send(ws, { t: 'error', msg: 'Pick a name (1 to 20 characters).' })
    let id
    do {
      id = randomCode()
    } while (await this.getRoom(id))
    const token = randomToken()
    const room = { id, created: Date.now(), host: { name, token }, guest: null, game: null, dropped: null }
    await this.putRoom(room)
    ws.serializeAttachment({ view: 'room', room: id, seat: 0, token })
    this.send(ws, { t: 'joined', room: id, seat: 0, token })
    this.send(ws, { t: 'state', room: id, seat: 0, state: null, serverNow: Date.now() })
    await this.broadcastLobbies()
  }

  async join(ws, { room: id, name }) {
    if (!validName(name)) return this.send(ws, { t: 'error', msg: 'Pick a name (1 to 20 characters).' })
    const room = await this.getRoom(String(id || '').toUpperCase())
    if (!room || room.guest || Date.now() - room.created > LOBBY_TTL_MS) {
      return this.send(ws, { t: 'error', msg: 'That lobby is gone. Pick another one.' })
    }
    const token = randomToken()
    room.guest = { name, token }
    const now = Date.now()
    room.game = C.newGame({ mode: 'online', difficulty: 'normal', names: [room.host.name, name], now })
    await this.putRoom(room)
    ws.serializeAttachment({ view: 'room', room: room.id, seat: 1, token })
    this.send(ws, { t: 'joined', room: room.id, seat: 1, token })
    this.broadcastState(room)
    await this.broadcastLobbies()
    await this.scheduleAlarm(room)
  }

  // A player whose socket dropped reconnects with the token they were given.
  async resume(ws, { room: id, token }) {
    const room = await this.getRoom(String(id || '').toUpperCase())
    if (!room) return this.send(ws, { t: 'error', msg: 'That game has ended.' })
    const seat = room.host.token === token ? 0 : room.guest?.token === token ? 1 : null
    if (seat === null) return this.send(ws, { t: 'error', msg: 'Your seat in that game has gone.' })
    ws.serializeAttachment({ view: 'room', room: room.id, seat, token })
    if (room.dropped && room.dropped.seat === seat) {
      room.dropped = null
      await this.putRoom(room)
    }
    this.send(ws, { t: 'joined', room: room.id, seat, token })
    this.broadcastState(room)
    await this.scheduleAlarm(room)
  }

  async word(ws, { word }) {
    const at = ws.deserializeAttachment() || {}
    const room = at.room ? await this.getRoom(at.room) : null
    if (!room?.game || room.game.over) return this.send(ws, { t: 'error', msg: 'No game running.' })
    if (room.game.turn !== at.seat) return this.send(ws, { t: 'error', msg: 'Not your turn.' })
    const dict = await loadDict(this.env)
    const now = Date.now()
    if (C.remainingMs(room.game, now) <= 0) return this.timeout(room)
    const verdict = C.validateWord(word, room.game, dict)
    if (!verdict.ok) return this.send(ws, { t: 'error', msg: verdict.reason })
    C.playWord(room.game, verdict.word, now - room.game.turnStart, now)
    await this.afterMove(room)
  }

  async pass(ws) {
    const at = ws.deserializeAttachment() || {}
    const room = at.room ? await this.getRoom(at.room) : null
    if (!room?.game || room.game.over || room.game.turn !== at.seat) return
    await this.timeout(room)
  }

  async leave(ws) {
    const at = ws.deserializeAttachment() || {}
    const room = at.room ? await this.getRoom(at.room) : null
    ws.serializeAttachment({ view: 'lobby' })
    if (!room) return this.sendLobbies(ws)
    if (room.game && !room.game.over) {
      room.game.over = true
      room.game.winner = 1 - at.seat
      room.game.reason = 'opponent left'
      await this.putRoom(room)
      this.broadcastState(room)
    } else if (at.seat === 0 && !room.guest) {
      await this.deleteRoom(room.id)
    }
    await this.broadcastLobbies()
    this.sendLobbies(ws)
  }

  async timeout(room) {
    C.passTurn(room.game, Date.now())
    await this.afterMove(room)
  }

  async afterMove(room) {
    await this.putRoom(room)
    this.broadcastState(room)
    await this.scheduleAlarm(room)
    if (room.game.over) await this.broadcastLobbies()
  }

  // Wakes at whichever comes first: the turn running out, or a dropped player's grace running out.
  async scheduleAlarm(room) {
    let at = null
    if (room.dropped) at = room.dropped.at + RECONNECT_MS
    else if (room.game && !room.game.over) at = room.game.turnStart + C.TURN_SECONDS * 1000
    if (at) await this.ctx.storage.setAlarm(at)
    else await this.ctx.storage.deleteAlarm()
  }

  async alarm() {
    const now = Date.now()
    const rooms = await this.allRooms()
    for (const room of rooms) {
      if (room.dropped && now >= room.dropped.at + RECONNECT_MS && room.game && !room.game.over) {
        const leaver = room.dropped.seat
        room.game.over = true
        room.game.winner = 1 - leaver
        room.game.reason = 'opponent left'
        room.dropped = null
        await this.putRoom(room)
        this.broadcastState(room)
        await this.broadcastLobbies()
      } else if (room.game && !room.game.over && !room.dropped && now >= room.game.turnStart + C.TURN_SECONDS * 1000) {
        await this.timeout(room)
      }
      await this.scheduleAlarm(room)
    }
  }

  // ---------- sending ----------
  send(ws, data) {
    try {
      ws.send(JSON.stringify(data))
    } catch (_) {
      /* socket already gone */
    }
  }

  async lobbyList() {
    const now = Date.now()
    return (await this.allRooms())
      .filter((r) => !r.guest && now - r.created <= LOBBY_TTL_MS)
      .map((r) => ({ room: r.id, host: r.host.name, created: r.created }))
      .sort((a, b) => b.created - a.created)
  }

  async sendLobbies(ws) {
    this.send(ws, { t: 'lobbies', rooms: await this.lobbyList() })
  }

  async broadcastLobbies() {
    const rooms = await this.lobbyList()
    for (const ws of this.ctx.getWebSockets()) {
      const at = ws.deserializeAttachment() || {}
      if (at.view === 'lobby' || at.view === 'room') this.send(ws, { t: 'lobbies', rooms })
    }
  }

  // Sends each seat the game state, plus the server clock so the browser can line up its timer.
  broadcastState(room, exceptSeat = null, notice = null) {
    const payload = (seat) => ({
      t: 'state',
      room: room.id,
      seat,
      serverNow: Date.now(),
      notice,
      state: room.game ? publicState(room.game) : null,
      waiting: !room.guest,
    })
    for (const ws of this.ctx.getWebSockets()) {
      const at = ws.deserializeAttachment() || {}
      if (at.room !== room.id || at.seat === exceptSeat) continue
      this.send(ws, payload(at.seat))
    }
  }
}

function publicState(g) {
  return {
    names: g.names,
    left: g.left,
    turn: g.turn,
    letter: g.letter,
    turnStart: g.turnStart,
    used: g.used,
    history: g.history,
    over: g.over,
    winner: g.winner,
    reason: g.reason,
  }
}

function validName(name) {
  return typeof name === 'string' && NAME.test(name.trim())
}
