import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { DECLARATION_CATEGORIES } from '../../constants/DeclarationsData';
import { CustomDeclaration, DeclarationCategory } from '../../types/declarations';

// Storage key constant
const STORAGE_KEY = 'customDeclarations';

export default function DeclarationsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<DeclarationCategory>(DECLARATION_CATEGORIES[0]);
  const [customDeclarations, setCustomDeclarations] = useState<CustomDeclaration[]>([]);
  const [newDeclaration, setNewDeclaration] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load custom declarations from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          setCustomDeclarations(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading custom declarations:', error);
        Alert.alert('Error', 'Failed to load your declarations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save declarations with memoized callback
  const saveCustomDeclarations = useCallback(async (declarations: CustomDeclaration[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(declarations));
    } catch (error) {
      console.error('Error saving custom declarations:', error);
      Alert.alert('Error', 'Failed to save your declaration. Please try again.');
    }
  }, []);

  // Haptic feedback helper
  const triggerHapticFeedback = useCallback((style = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(style);
    }
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category: DeclarationCategory) => {
    triggerHapticFeedback();
    setSelectedCategory(category);
  }, [triggerHapticFeedback]);

  // Add new declaration
  const addCustomDeclaration = useCallback(() => {
    if (!newDeclaration.trim()) {
      Alert.alert('Error', 'Please enter a declaration.');
      return;
    }

    triggerHapticFeedback(Haptics.ImpactFeedbackStyle.Medium);

    const newDeclarationObj: CustomDeclaration = {
      id: Date.now().toString(),
      text: newDeclaration.trim()
    };

    const updatedDeclarations = [...customDeclarations, newDeclarationObj];
    setCustomDeclarations(updatedDeclarations);
    saveCustomDeclarations(updatedDeclarations);
    setNewDeclaration('');
    setShowAddForm(false);
  }, [customDeclarations, newDeclaration, saveCustomDeclarations, triggerHapticFeedback]);

  // Delete declaration - Fixed implementation
  const deleteCustomDeclaration = useCallback((id: string) => {
    triggerHapticFeedback(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Delete Declaration',
      'Are you sure you want to delete this declaration?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            console.log("Deleting declaration with ID:", id); // Debug logging
            const updatedDeclarations = customDeclarations.filter(
              declaration => declaration.id !== id
            );
            setCustomDeclarations(updatedDeclarations);
            saveCustomDeclarations(updatedDeclarations);
          } 
        }
      ]
    );
  }, [customDeclarations, saveCustomDeclarations, triggerHapticFeedback]);

  // Custom category for user's own declarations
  const customCategory: DeclarationCategory = {
    id: 'custom',
    title: 'My Declarations',
    source: '',
    declarations: []
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Daily Declarations',
          headerShown: false,
        }}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={Platform.OS === 'ios'}
        keyboardShouldPersistTaps="handled"
        scrollIndicatorInsets={{ right: 1 }}
        style={styles.scrollView}
      >
        <View style={styles.headerContainer}>
          <ThemedText style={styles.title}>Daily Declarations</ThemedText>
          <ThemedText style={styles.subtitle}>Speak life over yourself</ThemedText>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContentContainer}
        >
          {DECLARATION_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory.id === category.id && styles.selectedCategory
              ]}
              onPress={() => handleCategorySelect(category)}
              accessibilityLabel={`${category.title} category`}
              accessibilityState={{ selected: selectedCategory.id === category.id }}
            >
              <ThemedText 
                style={[
                  styles.categoryText,
                  selectedCategory.id === category.id && styles.selectedCategoryText
                ]}
              >
                {category.title}
              </ThemedText>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory.id === 'custom' && styles.selectedCategory
            ]}
            onPress={() => handleCategorySelect(customCategory)}
            accessibilityLabel="My Declarations category"
            accessibilityState={{ selected: selectedCategory.id === 'custom' }}
          >
            <ThemedText 
              style={[
                styles.categoryText,
                selectedCategory.id === 'custom' && styles.selectedCategoryText
              ]}
            >
              {customCategory.title}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* Declarations */}
        <View style={styles.declarationsContainer}>
          {isLoading ? (
            <ThemedText style={styles.emptyMessage}>Loading declarations...</ThemedText>
          ) : selectedCategory.id === 'custom' ? (
            // Custom declarations section
            <>
              {customDeclarations.length === 0 ? (
                <ThemedText style={styles.emptyMessage}>
                  You haven't added any custom declarations yet.
                </ThemedText>
              ) : (
                customDeclarations.map((declaration) => (
                  <View key={declaration.id} style={styles.declarationItem}>
                    <ThemedText style={styles.declarationText}>
                      {declaration.text}
                    </ThemedText>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteCustomDeclaration(declaration.id)}
                      accessibilityLabel="Delete declaration"
                    >
                      <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Add new declaration */}
              {!showAddForm ? (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddForm(true)}
                  accessibilityLabel="Add new declaration"
                >
                  <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
                  <ThemedText style={styles.addButtonText}>Add New Declaration</ThemedText>
                </TouchableOpacity>
              ) : (
                <View style={styles.addForm}>
                  <TextInput
                    style={styles.input}
                    value={newDeclaration}
                    onChangeText={setNewDeclaration}
                    placeholder="Enter your declaration..."
                    multiline
                    autoFocus
                  />
                  <View style={styles.formButtons}>
                    <TouchableOpacity
                      style={[styles.formButton, styles.cancelButton]}
                      onPress={() => {
                        setShowAddForm(false);
                        setNewDeclaration('');
                      }}
                    >
                      <ThemedText style={styles.formButtonText}>Cancel</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.formButton, 
                        styles.saveButton,
                        !newDeclaration.trim() && styles.disabledButton
                      ]}
                      onPress={addCustomDeclaration}
                      disabled={!newDeclaration.trim()}
                    >
                      <ThemedText style={[
                        styles.formButtonText, 
                        !newDeclaration.trim() && styles.disabledButtonText
                      ]}>
                        Save
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            // Regular declarations
            selectedCategory.declarations.map((declaration, index) => (
              <View key={index} style={styles.declarationItem}>
                <ThemedText style={styles.declarationText}>
                  {declaration}
                </ThemedText>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    padding: Platform.OS === 'web' ? 20 : 16,
    paddingTop: Platform.OS === 'ios' ? 30 : Platform.OS === 'web' ? 30 : 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  headerContainer: {
    alignItems: Platform.OS === 'ios' ? 'center' : 'flex-start',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    marginBottom: 20,
    opacity: 0.7,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryContentContainer: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  selectedCategory: {
    backgroundColor: '#0a7ea4',
    backgroundImage: 'linear-gradient(to right, #0a7ea4, #2c9fc9, #50c2e8)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  declarationsContainer: {
    marginTop: 20,
    width: '100%',
    flexGrow: 1,
  },
  declarationItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 16 : 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 1 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: Platform.OS === 'ios' ? 3 : 0,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  declarationText: {
    fontSize: Platform.OS === 'web' ? 16 : 15,
    lineHeight: Platform.OS === 'web' ? 24 : 22,
    flex: 1,
    paddingRight: 10,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 8,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 30,
    fontSize: 16,
    opacity: 0.6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    marginTop: 10,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  addForm: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  formButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  formButtonText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#000',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
    opacity: 0.7,
  },
  disabledButtonText: {
    opacity: 0.7,
  }
});