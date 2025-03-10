
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bibleBooksData } from '@/constants/BibleData';

export default function BibleScreen() {
  const { book: initialBook, chapter: initialChapter } = useLocalSearchParams();
  const [selectedBook, setSelectedBook] = useState(initialBook || 'Genesis');
  const [selectedChapter, setSelectedChapter] = useState(parseInt(initialChapter as string) || 1);
  const [verses, setVerses] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const { width } = useWindowDimensions();

  // Get available chapters for selected book
  const getChaptersCount = () => {
    const bookData = bibleBooksData.find(b => b.name === selectedBook);
    return bookData ? bookData.chapters : 1;
  };

  // Load verse content (mock implementation)
  useEffect(() => {
    const loadVerses = async () => {
      // In a real app, fetch from API or local database
      // This is a mock implementation
      const mockVerses = Array.from({ length: 25 }, (_, i) => ({
        number: i + 1,
        text: `This is verse ${i + 1} of ${selectedBook} ${selectedChapter}. In a real app, this would contain the actual Bible text.`
      }));
      setVerses(mockVerses);
      
      // Check if bookmarked
      try {
        const bookmarks = await AsyncStorage.getItem('bibleBookmarks');
        const bookmarksList = bookmarks ? JSON.parse(bookmarks) : [];
        setBookmarked(bookmarksList.some(b => 
          b.book === selectedBook && b.chapter === selectedChapter
        ));
      } catch (e) {
        console.error('Failed to load bookmark status:', e);
      }
    };

    loadVerses();
  }, [selectedBook, selectedChapter]);

  const toggleBookmark = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem('bibleBookmarks');
      const bookmarksList = bookmarks ? JSON.parse(bookmarks) : [];
      
      const bookmarkIndex = bookmarksList.findIndex(b => 
        b.book === selectedBook && b.chapter === selectedChapter
      );
      
      if (bookmarkIndex >= 0) {
        // Remove bookmark
        bookmarksList.splice(bookmarkIndex, 1);
        setBookmarked(false);
      } else {
        // Add bookmark
        bookmarksList.push({
          book: selectedBook,
          chapter: selectedChapter,
          date: new Date().toISOString()
        });
        setBookmarked(true);
      }
      
      await AsyncStorage.setItem('bibleBookmarks', JSON.stringify(bookmarksList));
    } catch (e) {
      console.error('Failed to save bookmark:', e);
    }
  };

  // Save to recent readings
  useEffect(() => {
    const saveToRecent = async () => {
      try {
        const recents = await AsyncStorage.getItem('recentReadings');
        const recentsList = recents ? JSON.parse(recents) : [];
        
        // Remove if already exists
        const filteredList = recentsList.filter(
          r => !(r.book === selectedBook && r.chapter === selectedChapter)
        );
        
        // Add to beginning
        filteredList.unshift({
          book: selectedBook,
          chapter: selectedChapter,
          date: new Date().toISOString()
        });
        
        // Keep only most recent 10
        const trimmedList = filteredList.slice(0, 10);
        
        await AsyncStorage.setItem('recentReadings', JSON.stringify(trimmedList));
      } catch (e) {
        console.error('Failed to save recent reading:', e);
      }
    };
    
    saveToRecent();
  }, [selectedBook, selectedChapter]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedBook}
            onValueChange={(value) => {
              setSelectedBook(value);
              setSelectedChapter(1);
            }}
            style={styles.picker}>
            {bibleBooksData.map((book) => (
              <Picker.Item key={book.name} label={book.name} value={book.name} />
            ))}
          </Picker>
          
          <Picker
            selectedValue={selectedChapter}
            onValueChange={(value) => setSelectedChapter(value)}
            style={styles.chapterPicker}>
            {Array.from({ length: getChaptersCount() }, (_, i) => (
              <Picker.Item key={i} label={`Chapter ${i + 1}`} value={i + 1} />
            ))}
          </Picker>
        </ThemedView>
        
        <ThemedView style={styles.bookmarkButton}>
          <Ionicons 
            name={bookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={bookmarked ? "#4A6572" : "#666"}
            onPress={toggleBookmark}
          />
        </ThemedView>
      </ThemedView>

      <ScrollView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {selectedBook} {selectedChapter}
        </ThemedText>
        
        {verses.map((verse, index) => (
          <ThemedView key={index} style={styles.verse}>
            <ThemedText style={styles.verseNumber}>{verse.number}</ThemedText>
            <ThemedText style={styles.verseText}>{verse.text}</ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  picker: {
    flex: 2,
    height: 40,
  },
  chapterPicker: {
    flex: 1,
    height: 40,
  },
  bookmarkButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  verse: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  verseNumber: {
    fontSize: 12,
    marginRight: 8,
    marginTop: 2,
    color: '#888',
    width: 20,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
});
