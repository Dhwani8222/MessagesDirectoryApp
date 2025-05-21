import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TextInput, TouchableOpacity, Modal, Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MessageScreen({ route }) {
  const { category } = route.params;
  const [messages, setMessages] = useState(route.params.messages);
  const [newMsg, setNewMsg] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState('');

  const STORAGE_KEY = 'user_categories_v2';

  useEffect(() => {
    if (editIndex !== null) {
      setEditText(messages[editIndex]);
    }
  }, [editIndex]);

  const saveToStorage = async (updatedMessages) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const allCategories = JSON.parse(stored);
        const updatedCategories = allCategories.map(cat =>
          cat.name === category ? { ...cat, messages: updatedMessages } : cat
        );
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCategories));
      }
    } catch (err) {
      console.log('Storage error:', err);
    }
  };

  const addMessage = () => {
    if (newMsg.trim()) {
      const updated = [...messages, newMsg.trim()];
      setMessages(updated);
      setNewMsg('');
      saveToStorage(updated);
    }
  };

  const deleteMessage = (index) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => {
            const updated = [...messages];
            updated.splice(index, 1);
            setMessages(updated);
            saveToStorage(updated);
          }
        }
      ]
    );
  };

  const confirmEdit = () => {
    if (editText.trim()) {
      const updated = [...messages];
      updated[editIndex] = editText.trim();
      setMessages(updated);
      saveToStorage(updated);
      setEditIndex(null);
      setEditText('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.header}>{category} Messages</Text>

        <FlatList
          data={messages}
          keyExtractor={(item, index) => `${item}-${index}`}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item, index }) => (
            <View style={styles.messageBox}>
              <Text style={styles.message}>• {item}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => setEditIndex(index)}>
                  <Text style={styles.edit}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteMessage(index)}>
                  <Text style={styles.delete}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.addBox}>
              <TextInput
                placeholder="New message"
                placeholderTextColor="#888"
                style={[styles.input, styles.textArea]}
                value={newMsg}
                onChangeText={setNewMsg}
                multiline
                numberOfLines={2}
              />
              <TouchableOpacity style={styles.addBtn} onPress={addMessage}>
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Edit Modal */}
      <Modal visible={editIndex !== null} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Edit your message"
              placeholderTextColor="#888"
              value={editText}
              onChangeText={setEditText}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={styles.modalButton} onPress={confirmEdit}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditIndex(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', padding: 20,
  },
  header: {
    fontSize: 22, fontWeight: 'bold', marginBottom: 20,
  },
  messageBox: {
    padding: 12, borderBottomWidth: 1, borderColor: '#ddd',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  message: {
    fontSize: 16, flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  edit: {
    color: '#1e90ff', marginRight: 15,
  },
  delete: {
    color: 'red',
  },
  addBox: {
    flexDirection: 'row', marginTop: 20, alignItems: 'flex-start',
  },
  input: {
    borderBottomWidth: 1, borderColor: '#ccc', flex: 1, marginRight: 10,
    fontSize: 16,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
    padding: 10,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  addBtn: {
    backgroundColor: '#1e90ff', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 6,
    marginTop: 5,
  },
  addText: {
    color: '#fff', fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    margin: 30,
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    minHeight: 220,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#1e90ff', padding: 10, marginTop: 10, alignItems: 'center', borderRadius: 6,
  },
  modalButtonText: {
    color: 'white', fontWeight: 'bold',
  },
  cancelText: {
    textAlign: 'center', marginTop: 10, color: '#888',
  },
});
