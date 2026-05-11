import { io } from 'socket.io-client'

const base = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'

let socket = null

export function connectSocket(token) {
  if (socket && socket.connected) return socket
  if (socket) socket.disconnect()

  socket = io(base, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
  })

  socket.on('connect_error', (err) => {
    console.warn('Socket connect error:', err.message)
  })

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason)
  })

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function joinWorkspace(workspaceId) {
  if (socket && socket.connected) {
    socket.emit('joinWorkspace', workspaceId)
  }
}

export function leaveWorkspace(workspaceId) {
  if (socket && socket.connected) {
    socket.emit('leaveWorkspace', workspaceId)
  }
}
