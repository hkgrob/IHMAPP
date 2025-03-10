
import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const bookmarksData = await AsyncStorage.getItem('bibleBookmarks');
      if (bookmarksData) {
        const parsedBookmarks = JSON.parse(bookmarksData);
        setBookmarks(parsedBookmarks);
      }
    } catch (e) {
      console.error('Failed to load bookmarks:', e);
    }
  };

  const removeBookmark = async (index) => {
    try {
      const updatedBookmarks = [...bookmarks];
      updatedBookmarks.splice(index, 1);
      setBookmarks(updatedBookmarks);
      await AsyncStorage.setItem('bibleBookmarks', JSON.stringify(updatedBookmarks));
    } catch (e) {
      console.error('Failed to remove bookmark:', e);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderBookmarkItem = ({ item, index }) => (
    <ThemedView style={styles.bookmarkItem}>
      <Link href={`/bible?book=${item.book}&chapter=${item.chapter}`} asChild>
        <TouchableOpacity style={styles.bookmarkContent}>
          <ThemedText style={styles.bookmarkTitle}>
            {item.book} {item.chapter}
          </ThemedText>
          <ThemedText style={styles.bookmarkDate}>
            Bookmarked on {formatDate(item.date)}
          </ThemedText>
        </TouchableOpacity>
      </Link>
      
      {isEditing && (
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeBookmark(index)}>
          <Ionicons name="close-circle" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Bookmarks</ThemedText>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}>
          <ThemedText style={styles.editButtonText}>
            {isEditing ? 'Done' : 'Edit'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {bookmarks.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color="#CCC" />
          <ThemedText style={styles.emptyStateText}>
            No bookmarks yet. Add bookmarks while reading to see them here.
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={renderBookmarkItem}
          keyExtractor={(item, index) => `bookmark-${index}`}
          style={styles.bookmarkList}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#4A6572',
    fontWeight: 'bold',
  },
  bookmarkList: {
    flex: 1,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  bookmarkContent: {
    flex: 1,
    padding: 16,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookmarkDate: {
    fontSize: 12,
    color: '#888',
  },
  removeButton: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
});
