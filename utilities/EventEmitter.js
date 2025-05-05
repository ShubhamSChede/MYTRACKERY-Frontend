// Create a new file: utilities/EventEmitter.js
import { EventEmitter } from 'events';

// Create a singleton event emitter for the entire app
const eventEmitter = new EventEmitter();

// Export functions for publishing and subscribing to events
export const publishDataUpdate = (type) => {
  eventEmitter.emit('data-updated', type);
};

export const subscribeToDataUpdates = (callback) => {
  eventEmitter.on('data-updated', callback);
  return () => eventEmitter.off('data-updated', callback);
};