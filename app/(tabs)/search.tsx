
import React, { useState } from 'react';
import { StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { bibleBooksData } from '@/constants/BibleData';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'love', 'faith', 'hope', 'grace'
  ]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // In a real app, perform actual search against Bible text
    // This is a mock implementation
    const mockResults = [
      { book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world...' },
      { book: '1 Corinthians', chapter: 13, verse: 13, text: 'And now these three remain: faith, hope and love...' },
      { book: 'Romans', chapter: 5, verse: 8, text: 'But God demonstrates his own love for us...' },
    ];
    
    setSearchResults(mockResults);
    
    // Add to recent searches
    if (!recentSearches.includes(searchQuery.trim())) {
      setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
    }
  };

  const renderResultItem = ({ item }) => (
    <Link href={`/bible?book=${item.book}&chapter=${item.chapter}`} asChild>
      <TouchableOpacity style={styles.resultItem}>
        <ThemedText style={styles.resultReference}>
          {item.book} {item.chapter}:{item.verse}
        </ThemedText>
        <ThemedText style={styles.resultText}>{item.text}</ThemedText>
      </TouchableOpacity>
    </Link>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search the Bible..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#FFF" />
        </TouchableOpacity>
      </ThemedView>

      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderResultItem}
          keyExtractor={(item, index) => `result-${index}`}
          style={styles.resultsList}
        />
      ) : (
        <ThemedView style={styles.recentSearches}>
          <ThemedText type="defaultSemiBold" style={styles.recentSearchesTitle}>
            Recent Searches
          </ThemedText>
          <ThemedView style={styles.recentSearchesList}>
            {recentSearches.map((term, index) => (
              <TouchableOpacity
                key={`recent-${index}`}
                style={styles.recentSearchItem}
                onPress={() => {
                  setSearchQuery(term);
                  handleSearch();
                }}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <ThemedText style={styles.recentSearchText}>{term}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
          
          <ThemedText type="defaultSemiBold" style={styles.browseTitle}>
            Browse by Book
          </ThemedText>
          <ThemedView style={styles.booksList}>
            {bibleBooksData.slice(0, 10).map((book, index) => (
              <Link key={`book-${index}`} href={`/bible?book=${book.name}&chapter=1`} asChild>
                <TouchableOpacity style={styles.bookItem}>
                  <ThemedText>{book.name}</ThemedText>
                </TouchableOpacity>
              </Link>
            ))}
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  searchButton: {
    width: 46,
    height: 46,
    backgroundColor: '#4A6572',
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  resultReference: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
  },
  recentSearches: {
    flex: 1,
  },
  recentSearchesTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  recentSearchesList: {
    marginBottom: 24,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  recentSearchText: {
    marginLeft: 10,
  },
  browseTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  booksList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookItem: {
    width: '48%',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
  },
});
