import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, TextInput, Modal, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const STORAGE_KEY = 'user_categories_v2';

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    saveCategories();
  }, [categories]);

  const loadCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setCategories(JSON.parse(stored));
      } else {
        setCategories([
          { name: 'Home', messages: ['Lock the doors'] },
          { name: 'Love', messages: ['I love you'] },
          { name: 'Family', messages: ['Call Mom'] },
          { name: 'Friends', messages: ['Let’s catch up'] },
          { name: 'School', messages: ['Submit homework'] },
        ]);
      }
    } catch (e) {
      console.log('Error loading categories', e);
    }
  };

  const saveCategories = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.log('Error saving categories', e);
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && newMessage.trim()) {
      const alreadyExists = categories.some(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase());
      if (alreadyExists) {
        Alert.alert("Category exists", "Please choose a different name.");
        return;
      }

      const newEntry = {
        name: newCategory.trim(),
        messages: [newMessage.trim()]
      };
      setCategories([...categories, newEntry]);
      setNewCategory('');
      setNewMessage('');
      setModalVisible(false);
    }
  };

  const deleteCategory = (name) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCategories(categories.filter(cat => cat.name !== name));
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Messages', { category: item.name, messages: item.messages })}
            onLongPress={() => deleteCategory(item.name)}
          >
            <Text style={styles.label}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add New Directory & Message</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category name"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter first message"
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity style={styles.modalButton} onPress={addCategory}>
              <Text style={styles.modalButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#f0f8ff', paddingTop: 50,
  },
  grid: {
    justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 100,
  },
  button: {
    backgroundColor: '#87ceeb', padding: 30, margin: 10, borderRadius: 20,
    alignItems: 'center', flex: 1,
  },
  label: {
    fontSize: 18, fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute', bottom: 30, right: 30,
    backgroundColor: '#1e90ff', width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
  addText: {
    fontSize: 30, color: 'white',
  },
  modalContainer: {
    flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    margin: 40, backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 10,
  },
  modalTitle: {
    fontSize: 20, fontWeight: 'bold', marginBottom: 15,
  },
  input: {
    borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 8, marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1e90ff', padding: 12, borderRadius: 8,
    marginBottom: 10, alignItems: 'center',
  },
  modalButtonText: {
    color: 'white', fontWeight: 'bold',
  },
  cancelText: {
    color: '#888', textAlign: 'center',
  },
});
