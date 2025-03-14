
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from 'eventemitter3';

// Create event emitter for counter updates
export const counterEvents = new EventEmitter();

// Event names
export const COUNTER_UPDATED = 'COUNTER_UPDATED';

// Make sure this is exported properly and consistently named
console.log('Counter service initialized with event emitter');

// Load counts from storage
export const loadCounts = async () => {
  try {
    const storedDailyCount = await AsyncStorage.getItem('dailyCount');
    const storedTotalCount = await AsyncStorage.getItem('totalCount');
    const storedLastReset = await AsyncStorage.getItem('lastReset');
    
    // Check if we need to reset daily count
    let dailyCount = storedDailyCount ? parseInt(storedDailyCount, 10) : 0;
    let totalCount = storedTotalCount ? parseInt(storedTotalCount, 10) : 0;
    let lastReset = storedLastReset ? new Date(storedLastReset) : new Date();
    
    // If it's a new day, reset daily count
    const now = new Date();
    if (now.toDateString() !== lastReset.toDateString()) {
      dailyCount = 0;
      lastReset = now;
      await AsyncStorage.setItem('dailyCount', '0');
      await AsyncStorage.setItem('lastReset', now.toString());
    }
    
    return { dailyCount, totalCount, lastReset };
  } catch (error) {
    console.error('Error loading counts:', error);
    return { dailyCount: 0, totalCount: 0, lastReset: new Date() };
  }
};

// Increment counter and save to storage
export const incrementCounter = async () => {
  try {
    // Get current counts
    const { dailyCount, totalCount, lastReset } = await loadCounts();
    
    // Increment
    const newDailyCount = dailyCount + 1;
    const newTotalCount = totalCount + 1;
    
    // Save to storage
    const now = new Date();
    if (now.toDateString() !== lastReset.toDateString()) {
      await AsyncStorage.multiSet([
        ['dailyCount', '1'],
        ['totalCount', newTotalCount.toString()],
        ['lastReset', now.toString()]
      ]);
    } else {
      await AsyncStorage.multiSet([
        ['dailyCount', newDailyCount.toString()],
        ['totalCount', newTotalCount.toString()],
        ['lastReset', lastReset.toString()]
      ]);
    }
    
    // Notify all listeners about the counter update
    counterEvents.emit(COUNTER_UPDATED, { 
      dailyCount: newDailyCount, 
      totalCount: newTotalCount 
    });
    
    return { dailyCount: newDailyCount, totalCount: newTotalCount };
  } catch (error) {
    console.error('Error incrementing counter:', error);
    throw error;
  }
};

// Reset counter
export const resetCounter = async (type) => {
  try {
    if (type === 'daily') {
      await AsyncStorage.setItem('dailyCount', '0');
      await AsyncStorage.setItem('lastReset', new Date().toString());
      
      // Get current total count to broadcast correct state
      const totalItem = await AsyncStorage.getItem('totalCount');
      const totalCount = totalItem ? parseInt(totalItem, 10) : 0;
      
      // Notify listeners
      counterEvents.emit(COUNTER_UPDATED, { 
        dailyCount: 0, 
        totalCount: totalCount 
      });
      
      return { dailyCount: 0, totalCount };
    } else if (type === 'total') {
      await AsyncStorage.setItem('totalCount', '0');
      
      // Get current daily count to broadcast correct state
      const dailyItem = await AsyncStorage.getItem('dailyCount');
      const dailyCount = dailyItem ? parseInt(dailyItem, 10) : 0;
      
      // Notify listeners
      counterEvents.emit(COUNTER_UPDATED, { 
        dailyCount: dailyCount, 
        totalCount: 0 
      });
      
      return { dailyCount, totalCount: 0 };
    }
  } catch (error) {
    console.error('Error resetting counter:', error);
    throw error;
  }
};
