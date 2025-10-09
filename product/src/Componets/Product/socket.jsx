// src/socket.js
import { io } from 'socket.io-client';

const URL =
  process.env.NODE_ENV === 'production'
    ? 'https://backend-d6mx.vercel.app'
    : 'http://localhost:5000';

export const socket = io(URL, {
  autoConnect: true,
  withCredentials: true,
});
