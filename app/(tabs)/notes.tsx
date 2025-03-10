
import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const notesData = await AsyncStorage.getItem('bibleNotes');
      if (notesData) {
        const parsedNotes = JSON.parse(notesData);
        setNotes(parsedNotes);
      }
    } catch (e) {
      console.error('Failed to load notes:', e);
    }
  };

  const saveNotes = async (updatedNotes) => {
    try {
      await AsyncStorage.setItem('bibleNotes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  };

  const handleAddNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      Alert.alert('Error', 'Please enter both title and content for your note');
      return;
    }

    const newNote = {
      title: noteTitle,
      content: noteContent,
      date: new Date().toISOString()
    };

    if (editingNoteIndex !== null) {
      // Edit existing note
      const updatedNotes = [...notes];
      updatedNotes[editingNoteIndex] = newNote;
      saveNotes(updatedNotes);
    } else {
      // Add new note
      saveNotes([newNote, ...notes]);
    }

    // Reset form
    setNoteTitle('');
    setNoteContent('');
    setShowAddNote(false);
    setEditingNoteIndex(null);
  };

  const handleEditNote = (index) => {
    setNoteTitle(notes[index].title);
    setNoteContent(notes[index].content);
    setEditingNoteIndex(index);
    setShowAddNote(true);
  };

  const handleDeleteNote = (index) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { 
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedNotes = [...notes];
            updatedNotes.splice(index, 1);
            saveNotes(updatedNotes);
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderNoteItem = ({ item, index }) => (
    <ThemedView style={styles.noteItem}>
      <TouchableOpacity onPress={() => handleEditNote(index)}>
        <ThemedText style={styles.noteTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.noteDate}>{formatDate(item.date)}</ThemedText>
        <ThemedText numberOfLines={3} style={styles.noteContent}>
          {item.content}
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteNote(index)}>
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {showAddNote ? (
        <ThemedView style={styles.addNoteContainer}>
          <ThemedView style={styles.addNoteHeader}>
            <ThemedText type="title">
              {editingNoteIndex !== null ? 'Edit Note' : 'Add Note'}
            </ThemedText>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowAddNote(false);
                setNoteTitle('');
                setNoteContent('');
                setEditingNoteIndex(null);
              }}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </ThemedView>
          
          <TextInput
            style={styles.titleInput}
            placeholder="Note Title"
            value={noteTitle}
            onChangeText={setNoteTitle}
          />
          
          <TextInput
            style={styles.contentInput}
            placeholder="Write your note here..."
            value={noteContent}
            onChangeText={setNoteContent}
            multiline
            textAlignVertical="top"
          />
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleAddNote}>
            <ThemedText style={styles.saveButtonText}>Save Note</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <>
          <ThemedView style={styles.header}>
            <ThemedText type="title">My Notes</ThemedText>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddNote(true)}>
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </ThemedView>

          {notes.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <Ionicons name="journal-outline" size={64} color="#CCC" />
              <ThemedText style={styles.emptyStateText}>
                No notes yet. Tap the + button to create your first note.
              </ThemedText>
            </ThemedView>
          ) : (
            <FlatList
              data={notes}
              renderItem={renderNoteItem}
              keyExtractor={(item, index) => `note-${index}`}
              style={styles.notesList}
            />
          )}
        </>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A6572',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesList: {
    flex: 1,
  },
  noteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    position: 'relative',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    paddingRight: 30, // Make room for delete button
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 5,
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
  addNoteContainer: {
    flex: 1,
  },
  addNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  titleInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  contentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#4A6572',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
