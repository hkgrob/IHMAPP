
import React, { useState } from 'react';
import { StyleSheet, View, Platform, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { DECLARATION_CATEGORIES } from '@/constants/DeclarationsData';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function DeclarationsScreen() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme].tint;

  const toggleCategory = (categoryId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <ThemedText type="title" style={styles.screenTitle}>Declarations</ThemedText>
          <ThemedText style={styles.description}>
            Daily declarations to strengthen your faith and renew your mind.
            Tap on a category to view declarations.
          </ThemedText>
        </View>

        <View style={styles.categoriesContainer}>
          {DECLARATION_CATEGORIES.map((category) => (
            <View key={category.id} style={styles.categoryContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.categoryHeader,
                  expandedCategory === category.id && styles.activeCategory
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <BlurView 
                  intensity={expandedCategory === category.id ? 90 : 70} 
                  tint={colorScheme === 'dark' ? 'dark' : 'light'}
                  style={styles.blurContainer}
                >
                  <View style={styles.headerContent}>
                    <ThemedText type="subtitle" style={styles.categoryTitle}>
                      {category.title}
                    </ThemedText>
                    <View style={styles.headerActions}>
                      <View style={[styles.iconBackground, {backgroundColor: tintColor + '20'}]}>
                        <Ionicons
                          name={expandedCategory === category.id ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={tintColor}
                        />
                      </View>
                    </View>
                  </View>
                </BlurView>
              </TouchableOpacity>

              {expandedCategory === category.id && (
                <View style={styles.declarationsList}>
                  {category.declarations.map((declaration, index) => (
                    <View key={index} style={styles.declarationItem}>
                      <View style={[styles.bullet, {backgroundColor: tintColor}]} />
                      <ThemedText style={styles.declarationText}>{declaration}</ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
    opacity: 0.8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryHeader: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurContainer: {
    width: '100%',
    padding: 16,
  },
  activeCategory: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declarationsList: {
    padding: 20,
    paddingTop: 8,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: -8,
  },
  declarationItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 8,
  },
  declarationText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
});
