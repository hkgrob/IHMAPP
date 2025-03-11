import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import declarationCategories from '../../constants/DeclarationsData';
import { CustomDeclaration } from '../../types/declarations';

export default function DeclarationsScreen() {
  const [selectedCategory, setSelectedCategory] = useState(declarationCategories[0]);
  const [customDeclarations, setCustomDeclarations] = useState<CustomDeclaration[]>([]);
  const [newDeclaration, setNewDeclaration] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load custom declarations from storage
  useEffect(() => {
    loadCustomDeclarations();
  }, []);

  const loadCustomDeclarations = async () => {
    try {
      const storedDeclarations = await AsyncStorage.getItem('customDeclarations');
      if (storedDeclarations) {
        setCustomDeclarations(JSON.parse(storedDeclarations));
      }
    } catch (error) {
      console.error('Error loading custom declarations:', error);
    }
  };

  const saveCustomDeclarations = async (declarations: CustomDeclaration[]) => {
    try {
      await AsyncStorage.setItem('customDeclarations', JSON.stringify(declarations));
    } catch (error) {
      console.error('Error saving custom declarations:', error);
    }
  };

  const addCustomDeclaration = async () => {
    if (newDeclaration.trim() === '') {
      Alert.alert('Error', 'Please enter a declaration.');
      return;
    }

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const newDeclarationObj: CustomDeclaration = {
      id: Date.now().toString(),
      text: newDeclaration.trim()
    };

    const updatedDeclarations = [...customDeclarations, newDeclarationObj];
    setCustomDeclarations(updatedDeclarations);
    await saveCustomDeclarations(updatedDeclarations);
    setNewDeclaration('');
    setShowAddForm(false);
  };

  const deleteCustomDeclaration = async (id: string) => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Show confirmation dialog
      const confirmDelete = await new Promise((resolve) => {
        Alert.alert(
          'Delete Declaration',
          'Are you sure you want to delete this declaration?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) }
          ]
        );
      });

      if (confirmDelete) {
        const updatedDeclarations = customDeclarations.filter(
          (declaration) => declaration.id !== id
        );
        setCustomDeclarations(updatedDeclarations);
        await saveCustomDeclarations(updatedDeclarations);
      }
    } catch (error) {
      console.error('Error deleting custom declaration:', error);
      Alert.alert('Error', 'Could not delete the declaration. Please try again.');
    }
  };

  const handleCategorySelect = (category: any) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(category);
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
      >
        <ThemedText style={styles.title}>Daily Declarations</ThemedText>
        <ThemedText style={styles.subtitle}>Speak life over yourself</ThemedText>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {DECLARATION_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory.id === category.id && styles.selectedCategory
              ]}
              onPress={() => handleCategorySelect(category)}
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

          {/* Custom category button */}
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory.id === 'custom' && styles.selectedCategory
            ]}
            onPress={() => handleCategorySelect({ id: 'custom', title: 'My Declarations', source: '', declarations: [] })}
          >
            <ThemedText 
              style={[
                styles.categoryText,
                selectedCategory.id === 'custom' && styles.selectedCategoryText
              ]}
            >
              My Declarations
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* Declarations */}
        <View style={styles.declarationsContainer}>
          {selectedCategory.id === 'custom' ? (
            // Custom declarations section
            <>
              {customDeclarations.length === 0 ? (
                <ThemedText style={styles.emptyMessage}>
                  You haven't added any custom declarations yet.
                </ThemedText>
              ) : (
                customDeclarations.map((declaration, index) => (
                  <View key={declaration.id} style={styles.declarationItem}>
                    <ThemedText style={styles.declarationText}>
                      {declaration.text}
                    </ThemedText>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteCustomDeclaration(declaration.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Add new declaration button */}
              {!showAddForm ? (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddForm(true)}
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
                      style={[styles.formButton, styles.saveButton]}
                      onPress={addCustomDeclaration}
                    >
                      <ThemedText style={styles.formButtonText}>Save</ThemedText>
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

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.7,
  },
  categoryContainer: {
    paddingVertical: 15,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
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
  },
  declarationItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  declarationText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
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
  },
});