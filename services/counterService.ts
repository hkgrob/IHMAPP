
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
    
    // Current date
    const today = new Date();
    
    // Update streak data
    await updateStreakData(today);
    
    // Save to storage
    if (today.toDateString() !== lastReset.toDateString()) {
      await AsyncStorage.multiSet([
        ['dailyCount', '1'],
        ['totalCount', newTotalCount.toString()],
        ['lastReset', today.toString()]
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

// Update streak tracking
export const updateStreakData = async (today = new Date()) => {
  try {
    // Get current streak data
    const lastActivityDate = await AsyncStorage.getItem('lastActivityDate');
    let currentStreak = parseInt(await AsyncStorage.getItem('currentStreak') || '0', 10);
    let bestStreak = parseInt(await AsyncStorage.getItem('bestStreak') || '0', 10);

    if (!lastActivityDate) {
      // First time using the app
      currentStreak = 1;
      
      // Set first date if not already set
      const firstDateSet = await AsyncStorage.getItem('firstDate');
      if (!firstDateSet) {
        await AsyncStorage.setItem('firstDate', today.toString());
      }
    } else {
      const lastDate = new Date(lastActivityDate);
      const isYesterday = (
        today.getDate() - lastDate.getDate() === 1 ||
        (today.getDate() === 1 && 
          lastDate.getDate() === new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0).getDate() &&
          (today.getMonth() === (lastDate.getMonth() + 1) % 12))
      );
      const isToday = today.toDateString() === lastDate.toDateString();

      if (isToday) {
        // Already counted for today, no change to streak
      } else if (isYesterday) {
        // Consecutive day, increment streak
        currentStreak += 1;
      } else {
        // Streak broken, reset to 1
        currentStreak = 1;
      }
    }

    // Update best streak if needed
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
      await AsyncStorage.setItem('bestStreak', bestStreak.toString());
    }

    // Save current streak and activity date
    await AsyncStorage.setItem('currentStreak', currentStreak.toString());
    await AsyncStorage.setItem('lastActivityDate', today.toString());
    
    console.log(`Streak updated: Current streak: ${currentStreak}, Best streak: ${bestStreak}`);
    
    return { currentStreak, bestStreak };
  } catch (error) {
    console.error('Error updating streak data:', error);
    return { currentStreak: 0, bestStreak: 0 };
  }
};

// Reset counter
export const resetCounter = async (type) => {
  try {
    console.log(`Resetting counter: ${type}`);
    
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
      
      console.log(`Daily counter reset successful. Total remains: ${totalCount}`);
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
      
      console.log(`Total counter reset successful. Daily remains: ${dailyCount}`);
      return { dailyCount, totalCount: 0 };
    } else if (type === 'all') {
      // Reset all counter-related data
      const keysToReset = [
        'dailyCount', 'totalCount', 'lastReset',
        'currentStreak', 'bestStreak', 'lastActivityDate', 'firstDate'
      ];
      
      console.log('Resetting all counter data:', keysToReset.join(', '));
      
      // Create a multiset array with all zeros
      const resetValues = keysToReset.map(key => {
        if (key === 'lastReset') return [key, new Date().toString()];
        if (key === 'lastActivityDate' || key === 'firstDate') return [key, ''];
        return [key, '0'];
      });
      
      await AsyncStorage.multiSet(resetValues);
      
      // Notify listeners with full reset
      counterEvents.emit(COUNTER_UPDATED, { 
        dailyCount: 0, 
        totalCount: 0,
        currentStreak: 0,
        bestStreak: 0
      });
      
      console.log('All counter data reset successful');
      return { dailyCount: 0, totalCount: 0, currentStreak: 0, bestStreak: 0 };
    }
  } catch (error) {
    console.error('Error resetting counter:', error);
    throw error;
  }
};
