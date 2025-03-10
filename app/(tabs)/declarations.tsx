
import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

export default function DeclarationsScreen() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const declarationCategories = [
    {
      id: 'identity',
      title: 'Identity Declarations',
      declarations: [
        "I am loved unconditionally by God.",
        "I am created with purpose and destiny.",
        "I am empowered to fulfill my calling.",
        "I have the mind of Christ.",
        "I am renewed daily in my thinking."
      ]
    },
    {
      id: 'faith',
      title: 'Faith Declarations',
      declarations: [
        "My faith is growing stronger every day.",
        "I believe God's promises for my life.",
        "I walk by faith, not by sight.",
        "My faith activates God's power in my life.",
        "I trust God's timing in all things."
      ]
    },
    {
      id: 'mindset',
      title: 'Mindset Declarations',
      declarations: [
        "I choose thoughts that empower me.",
        "My mind is being renewed daily.",
        "I focus on what is true, noble, and good.",
        "I have clarity of thought and purpose.",
        "My beliefs align with God's Word."
      ]
    },
    {
      id: 'health',
      title: 'Health Declarations',
      declarations: [
        "I am whole in body, mind, and spirit.",
        "My body is the temple of the Holy Spirit.",
        "I am getting stronger and healthier every day.",
        "I make choices that promote health and wellness.",
        "I sleep well and wake refreshed."
      ]
    }
  ];
  
  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.header}>Daily Declarations</ThemedText>
        <ThemedText style={styles.subheader}>
          Speak these declarations daily to renew your mind and transform your beliefs.
        </ThemedText>
        
        {declarationCategories.map((category) => (
          <ThemedView key={category.id} style={styles.categoryContainer}>
            <TouchableOpacity 
              style={styles.categoryHeader} 
              onPress={() => toggleCategory(category.id)}
            >
              <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
              <Ionicons 
                name={expandedCategory === category.id ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#4A90E2" 
              />
            </TouchableOpacity>
            
            {expandedCategory === category.id && (
              <ThemedView style={styles.declarationsContainer}>
                {category.declarations.map((declaration, index) => (
                  <ThemedView key={index} style={styles.declarationItem}>
                    <ThemedText style={styles.declarationNumber}>{index + 1}.</ThemedText>
                    <ThemedText style={styles.declarationText}>{declaration}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            )}
          </ThemedView>
        ))}
        
        <ThemedText style={styles.tip}>
          Tip: Speak these declarations out loud. For best results, repeat them at least 3 times daily.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  categoryContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  declarationsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  declarationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  declarationNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    width: 24,
  },
  declarationText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  tip: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
});
