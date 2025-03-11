import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, ScrollView, Pressable, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
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
import Collapsible from '@/components/Collapsible';
import { MaterialIcons } from '@expo/vector-icons';
import ResponsiveText from '@/components/ResponsiveText';

const { width } = Dimensions.get('window');

const SwipeableDeclaration = ({ item, onDelete, tintColor }: { item: CustomDeclaration, onDelete: (id: string) => void, tintColor: string }) => {
  const renderRightActions = () => {
    return (
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  // Make sure item exists before rendering
  if (!item) {
    return null;
  }

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.declarationItem}>
        <View style={[styles.bullet, { backgroundColor: tintColor }]} />
        <ThemedText style={styles.declarationText} numberOfLines={0} ellipsizeMode="tail">{item.text}</ThemedText>
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
  const [dailyCount, setDailyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

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
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const dailyString = await AsyncStorage.getItem('dailyDeclarationCount');
      const totalString = await AsyncStorage.getItem('totalDeclarationCount');

      if (dailyString) {
        setDailyCount(parseInt(dailyString));
      }

      if (totalString) {
        setTotalCount(parseInt(totalString));
      }
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const deleteCustomDeclaration = async (id: string) => {
    try {
      const updatedDeclarations = customDeclarations.filter(
        (declaration) => declaration.id !== id
      );
      setCustomDeclarations(updatedDeclarations);
      await AsyncStorage.setItem('customDeclarations', JSON.stringify(updatedDeclarations));
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error deleting declaration:', error);
    }
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

      // Use a different approach for confirmation based on platform
      let confirmDelete = false;
      if (Platform.OS === 'web') {
        confirmDelete = window.confirm('Are you sure you want to delete this declaration?');
      } else {
        confirmDelete = await new Promise((resolve) =>> {
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

  const incrementCounts = async () => {
    try {
      const newDailyCount = dailyCount + 1;
      const newTotalCount = totalCount + 1;

      await AsyncStorage.setItem('dailyDeclarationCount', newDailyCount.toString());
      await AsyncStorage.setItem('totalDeclarationCount', newTotalCount.toString());

      setDailyCount(newDailyCount);
      setTotalCount(newTotalCount);
    } catch (error) {
      console.error('Error incrementing counts:', error);
    }
  };

  const resetDaily = async () => {
    try {
      await AsyncStorage.setItem('dailyDeclarationCount', '0');
      setDailyCount(0);
    } catch (error) {
      console.error('Error resetting daily count:', error);
    }
  };

  const resetTotal = async () => {
    try {
      await AsyncStorage.setItem('totalDeclarationCount', '0');
      setTotalCount(0);
    } catch (error) {
      console.error('Error resetting total count:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <ResponsiveText variant="h2" style={styles.screenTitle}>Declarations</ResponsiveText>
          <ThemedText style={styles.description}>
            Daily declarations to strengthen your faith and renew your mind.
            Tap on a category to view declarations.
          </ThemedText>
        </View>

        <View style={styles.countersContainer}>
          <View style={styles.counterBox}>
            <ResponsiveText variant="caption" style={styles.counterLabel}>Daily</ResponsiveText>
            <ResponsiveText variant="h1" style={styles.counterValue}>{dailyCount || 0}</ResponsiveText>
          </View>
          <View style={styles.counterBox}>
            <ResponsiveText variant="caption" style={styles.counterLabel}>Total</ResponsiveText>
            <ResponsiveText variant="h1" style={styles.counterValue}>{totalCount || 0}</ResponsiveText>
          </View>
        </View>

        <TouchableOpacity style={styles.incrementButton} onPress={() => {
          // Make sure we have values before incrementing
          const newDailyCount = (dailyCount || 0) + 1;
          const newTotalCount = (totalCount || 0) + 1;
          setDailyCount(newDailyCount);
          setTotalCount(newTotalCount);
          // Save to AsyncStorage if needed
          if (Platform.OS !== 'web') {
            AsyncStorage.setItem('dailyCount', newDailyCount.toString());
            AsyncStorage.setItem('totalCount', newTotalCount.toString());
          }
          // Provide haptic feedback if available
          if (Haptics && Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }}>
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <ThemedText style={styles.incrementButtonText}>Record Declaration</ThemedText>
        </TouchableOpacity>

        <View style={styles.resetButtons}>
          <TouchableOpacity style={styles.resetButton} onPress={resetDaily}>
            <Text style={styles.resetButtonText}>Reset Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={resetTotal}>
            <Text style={styles.resetButtonText}>Reset Total</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.tipContainer}>
          <View style={styles.tipIconContainer}>
            <Ionicons name="bulb-outline" size={24} color="#FFD700" />
          </View>
          <ResponsiveText variant="body" style={styles.tipText}>
            Consistency is key! Aim to speak declarations aloud daily to build new neural pathways.
          </ResponsiveText>
        </View>

        <View style={styles.categoriesContainer}>
          {/* Custom Declarations Section */}
          <View
            style={[
              styles.categoryContainer,
              expandedCategory === 'custom' && styles.activeCategory
            ]}
          >
            <Pressable onPress={() => toggleCategory('custom')} style={styles.categoryHeader}>
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
                  customDeclarations && customDeclarations.map((declaration) => (
                    declaration ? (
                      <SwipeableDeclaration 
                        key={declaration.id} 
                        item={declaration} 
                        onDelete={deleteCustomDeclaration} 
                        tintColor={tintColor} 
                      />
                    ) : null
                  ))
                )}

                {isAddingNew ? (
                  <View style={styles.addNewContainer}>
                    <TextInput
                      style={[styles.newDeclarationInput, { borderColor: tintColor }]}
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
                        style={[styles.addNewButton, { backgroundColor: tintColor }]}
                        onPress={addCustomDeclaration}
                      >
                        <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Save</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.addButton, { borderColor: tintColor }]}
                    onPress={() => setIsAddingNew(true)}
                  >
                    <Ionicons name="add" size={20} color={tintColor} />
                    <ThemedText style={[styles.addButtonText, { color: tintColor }]}>
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
            <Collapsible
              key={category.id}
              title={category.title}
              subtitle={category.source}
            >
              <View style={styles.declarationsList}>
                {category.declarations && category.declarations.map((declaration, index) => (
                  <View key={index} style={styles.declarationItem}>
                    <MaterialIcons name="format-quote" size={20} color="#777" style={styles.quoteIcon} />
                    <View style={styles.declarationTextContainer}>
                      <ResponsiveText style={styles.declarationText}>{declaration || ''}</ResponsiveText>
                    </View>
                  </View>
                ))}
              </View>
            </Collapsible>
          ))}
        </View>

        {/* End of categories */}
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
    paddingBottom: 100,
  },
  incrementButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  incrementButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  countersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  counterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  counterLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerSection: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    flexWrap: 'wrap',
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
    fontWeight: 'bold',
    marginBottom: 5,
    flexWrap: 'wrap',
    flex: 1,
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
    flexWrap: 'wrap',
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
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
  },
  countersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  counterBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    margin: 5,
    alignItems: 'center',
  },
  counterLabel: {
    marginBottom: 6,
  },
  counterValue: {
    textAlign: 'center',
  },
  incrementButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  incrementButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  resetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 120, 120, 0.1)',
  },
  resetButtonText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  tipIconContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    flexWrap: 'wrap',
  },
  quoteIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  declarationTextContainer: {
    flex: 1,
  },

});