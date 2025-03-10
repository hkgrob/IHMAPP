
import React from 'react';
import { StyleSheet, Image, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const dailyVerse = {
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    reference: "John 3:16"
  };

  const recentReadings = [
    { book: "Psalms", chapter: 23 },
    { book: "Matthew", chapter: 5 },
    { book: "Romans", chapter: 8 }
  ];

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Bible Study App</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Daily Verse</ThemedText>
        <ThemedText style={styles.verseText}>"{dailyVerse.text}"</ThemedText>
        <ThemedText style={styles.reference}>{dailyVerse.reference}</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Recent Readings</ThemedText>
        {recentReadings.map((item, index) => (
          <Link key={index} href={`/bible?book=${item.book}&chapter=${item.chapter}`} asChild>
            <ThemedView style={styles.recentItem}>
              <ThemedText>{item.book} {item.chapter}</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </ThemedView>
          </Link>
        ))}
      </ThemedView>
      
      <ThemedView style={styles.quickLinks}>
        <Link href="/bible" asChild>
          <ThemedView style={styles.quickLink}>
            <Ionicons name="book-outline" size={28} color="#4A6572" />
            <ThemedText>Read Bible</ThemedText>
          </ThemedView>
        </Link>
        <Link href="/search" asChild>
          <ThemedView style={styles.quickLink}>
            <Ionicons name="search-outline" size={28} color="#4A6572" />
            <ThemedText>Search</ThemedText>
          </ThemedView>
        </Link>
        <Link href="/notes" asChild>
          <ThemedView style={styles.quickLink}>
            <Ionicons name="journal-outline" size={28} color="#4A6572" />
            <ThemedText>My Notes</ThemedText>
          </ThemedView>
        </Link>
        <Link href="/bookmarks" asChild>
          <ThemedView style={styles.quickLink}>
            <Ionicons name="bookmark-outline" size={28} color="#4A6572" />
            <ThemedText>Bookmarks</ThemedText>
          </ThemedView>
        </Link>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  reference: {
    fontSize: 14,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  quickLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickLink: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
