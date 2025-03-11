import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, ScrollView, Pressable, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { DECLARATION_CATEGORIES } from '@/constants/DeclarationsData';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomDeclaration } from '@/types/declarations';
import { Swipeable } from 'react-native-gesture-handler';
const SwipeableDeclaration = ({ item, onDelete, tintColor }) => {
  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: '#FF3B30' }]}
        onPress={() => onDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.customDeclarationItem}>
        <View style={[styles.bullet, { backgroundColor: tintColor }]} />
        <ThemedText style={styles.declarationText}>{item.text}</ThemedText>
      </View>
    </Swipeable>
  );
};

export default function DeclarationsScreen() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [customDeclarations, setCustomDeclarations] = useState<CustomDeclaration[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDeclaration, setNewDeclaration] = useState('');
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme].tint;
  
  // Load custom declarations from AsyncStorage
  useEffect(() => {
    const loadCustomDeclarations = async () => {
      try {
        const savedDeclarations = await AsyncStorage.getItem('customDeclarations');
        if (savedDeclarations) {
          setCustomDeclarations(JSON.parse(savedDeclarations));
        }
      } catch (error) {
        console.error('Error loading custom declarations:', error);
      }
    };
    
    loadCustomDeclarations();
  }, []);

  const toggleCategory = (categoryId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const addCustomDeclaration = async () => {
    if (newDeclaration.trim() !== '') {
      const newDeclarations = [...customDeclarations, { id: Date.now().toString(), text: newDeclaration }];
      
      try {
        await AsyncStorage.setItem('customDeclarations', JSON.stringify(newDeclarations));
        setCustomDeclarations(newDeclarations);
        setNewDeclaration('');
        setIsAddingNew(false);
        
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        console.error('Error saving custom declaration:', error);
        Alert.alert('Error', 'Could not save your declaration. Please try again.');
      }
    }
  };
  
  const deleteCustomDeclaration = async (id: string) => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      const confirmDelete = Platform.OS === 'web' 
        ? window.confirm('Are you sure you want to delete this declaration?')
        : await new Promise((resolve) => {
            Alert.alert(
              'Delete Declaration',
              'Are you sure you want to delete this declaration?',
              [
                { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                { text: 'Delete', onPress: () => resolve(true), style: 'destructive' }
              ]
            );
          });
      
      if (confirmDelete) {
        const updatedDeclarations = customDeclarations.filter(
          declaration => declaration.id !== id
        );
        
        await AsyncStorage.setItem('customDeclarations', JSON.stringify(updatedDeclarations));
        setCustomDeclarations(updatedDeclarations);
      }
    } catch (error) {
      console.error('Error deleting custom declaration:', error);
      Alert.alert('Error', 'Could not delete the declaration. Please try again.');
    }
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
          {/* Custom Declarations Section */}
          <View 
            style={[
              styles.categoryContainer,
              expandedCategory === 'custom' && styles.activeCategory
            ]}
          >
            <Pressable
              onPress={() => toggleCategory('custom')}
              style={styles.categoryHeader}
            >
              <BlurView
                intensity={80}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={styles.blurContainer}
              >
                <View style={styles.headerContent}>
                  <ThemedText style={styles.categoryTitle}>Custom Declarations</ThemedText>
                  <View style={styles.headerActions}>
                    <View 
                      style={[
                        styles.iconBackground,
                        { backgroundColor: tintColor }
                      ]}
                    >
                      <Ionicons
                        name={expandedCategory === 'custom' ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="white"
                      />
                    </View>
                  </View>
                </View>
              </BlurView>
            </Pressable>

            {expandedCategory === 'custom' && (
              <View style={styles.declarationsList}>
                {customDeclarations.length === 0 && !isAddingNew ? (
                  <ThemedText style={styles.emptyText}>
                    Add your personal declarations here to speak them regularly.
                  </ThemedText>
                ) : (
                  customDeclarations.map((declaration) => (
                    <SwipeableDeclaration key={declaration.id} item={declaration} />
                  ))
                )}

                {isAddingNew ? (
                  <View style={styles.addNewContainer}>
                    <TextInput
                      style={[styles.newDeclarationInput, {borderColor: tintColor}]}
                      value={newDeclaration}
                      onChangeText={setNewDeclaration}
                      placeholder="Type your declaration..."
                      placeholderTextColor="gray"
                      multiline
                      autoFocus
                    />
                    <View style={styles.addNewActions}>
                      <TouchableOpacity 
                        style={[styles.addNewButton, styles.cancelButton]} 
                        onPress={() => setIsAddingNew(false)}
                      >
                        <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.addNewButton, {backgroundColor: tintColor}]} 
                        onPress={addCustomDeclaration}
                      >
                        <ThemedText style={[styles.buttonText, {color: '#FFFFFF'}]}>Save</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.addButton, {borderColor: tintColor}]} 
                    onPress={() => setIsAddingNew(true)}
                  >
                    <Ionicons name="add" size={20} color={tintColor} />
                    <ThemedText style={[styles.addButtonText, {color: tintColor}]}>
                      Add New Declaration
                    </ThemedText>
                  </TouchableOpacity>
                )}

                {customDeclarations.length > 0 && (
                  <ThemedText style={styles.swipeHint}>
                    <Ionicons name="swap-horizontal" size={14} /> Swipe left to delete
                  </ThemedText>
                )}
              </View>
            )}
          </View>

          {/* Original Declaration Categories */}
          {DECLARATION_CATEGORIES.map((category) => (
            <View 
              key={category.id} 
              style={[
                styles.categoryContainer,
                expandedCategory === category.id && styles.activeCategory
              ]}
            >
              <Pressable
                onPress={() => toggleCategory(category.id)}
                style={styles.categoryHeader}
              >
                <BlurView
                  intensity={80}
                  tint={colorScheme === 'dark' ? 'dark' : 'light'}
                  style={styles.blurContainer}
                >
                  <View style={styles.headerContent}>
                    <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
                    <View style={styles.headerActions}>
                      <View 
                        style={[
                          styles.iconBackground,
                          { backgroundColor: tintColor }
                        ]}
                      >
                        <Ionicons
                          name={expandedCategory === category.id ? "chevron-up" : "chevron-down"}
                          size={20}
                          color="white"
                        />
                      </View>
                    </View>
                  </View>
                </BlurView>
              </Pressable>

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
        
        
          ) : (
            <ThemedText style={styles.emptyText}>
              No custom declarations yet. Add your own below.
            </ThemedText>
          )}
          
          {isAddingNew ? (
            <View style={styles.addNewContainer}>
              <TextInput
                style={[
                  styles.newDeclarationInput,
                  {
                    borderColor: tintColor,
                    color: colorScheme === 'dark' ? '#fff' : '#000'
                  }
                ]}
                placeholder="Type your declaration here..."
                placeholderTextColor={colorScheme === 'dark' ? '#999' : '#999'}
                value={newDeclaration}
                onChangeText={setNewDeclaration}
                multiline
              />
              <View style={styles.addNewActions}>
                <TouchableOpacity
                  style={[styles.addNewButton, styles.cancelButton]}
                  onPress={() => {
                    setIsAddingNew(false);
                    setNewDeclaration('');
                  }}
                >
                  <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addNewButton, { backgroundColor: tintColor }]}
                  onPress={addCustomDeclaration}
                >
                  <ThemedText style={[styles.buttonText, { color: '#fff' }]}>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: tintColor }]}
              onPress={() => setIsAddingNew(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color={tintColor} />
              <ThemedText style={[styles.addButtonText, { color: tintColor }]}>
                Add New Declaration
              </ThemedText>
            </TouchableOpacity>
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
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
  addNewContainer: {
    marginTop: 20,
  },
  newDeclarationInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  addNewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  addNewButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  swipeHint: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 16,
  },
});