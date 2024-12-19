import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Journal = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  
  const [formData, setFormData] = useState({
    monthYear: '',
    monthHighlight: '',
    skillsLearnt: '',
    productivity: { rating: 5, note: '' },
    health: { rating: 5, note: '' },
    mood: { rating: 5, note: '' },
  });

  // Fetch all journals
  const fetchJournals = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('x-auth-token');
      const response = await fetch('https://expensetrackerbackend-j2tz.onrender.com/api/journal', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setJournals(data);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch journals');
    } finally {
      setLoading(false);
    }
  };

  // Create new journal
  const createJournal = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('x-auth-token');
      const response = await fetch('https://expensetrackerbackend-j2tz.onrender.com/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Journal created successfully');
        fetchJournals();
        resetForm();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create journal');
    } finally {
      setLoading(false);
    }
  };

  // Update journal
  const updateJournal = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('x-auth-token');
      const response = await fetch(`https://expensetrackerbackend-j2tz.onrender.com/api/journal/${currentMonthYear}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Journal updated successfully');
        fetchJournals();
        resetForm();
        setEditing(false);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update journal');
    } finally {
      setLoading(false);
    }
  };

  // Delete journal
  const deleteJournal = async (monthYear) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this journal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('x-auth-token');
              const response = await fetch(`https://expensetrackerbackend-j2tz.onrender.com/api/journal/${monthYear}`, {
                method: 'DELETE',
                headers: {
                  'x-auth-token': token,
                },
              });
              if (response.ok) {
                Alert.alert('Success', 'Journal deleted successfully');
                fetchJournals();
              } else {
                const data = await response.json();
                Alert.alert('Error', data.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete journal');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      monthYear: '',
      monthHighlight: '',
      skillsLearnt: '',
      productivity: { rating: 5, note: '' },
      health: { rating: 5, note: '' },
      mood: { rating: 5, note: '' },
    });
  };

  const editJournal = (journal) => {
    setFormData(journal);
    setCurrentMonthYear(journal.monthYear);
    setEditing(true);
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-5 bg-white m-3 rounded-lg shadow">
        <Text className="text-2xl font-bold mb-5 text-gray-800">
          {editing ? 'Edit Journal' : 'New Journal Entry'}
        </Text>
        
        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-4 text-base"
          placeholder="Month Year (YYYY-MM)"
          value={formData.monthYear}
          onChangeText={(text) => setFormData({ ...formData, monthYear: text })}
          editable={!editing}
          placeholderTextColor="#9ca3af"
        />

        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-4 text-base"
          placeholder="Month Highlight"
          value={formData.monthHighlight}
          onChangeText={(text) => setFormData({ ...formData, monthHighlight: text })}
          placeholderTextColor="#9ca3af"
        />

        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-4 text-base"
          placeholder="Skills Learnt"
          value={formData.skillsLearnt}
          onChangeText={(text) => setFormData({ ...formData, skillsLearnt: text })}
          placeholderTextColor="#9ca3af"
        />

        {/* Productivity Section */}
        <Text className="text-lg font-semibold mt-2 mb-1 text-gray-700">Productivity</Text>
        <Slider
          style={{ height: 40 }}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={formData.productivity.rating}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              productivity: { ...formData.productivity, rating: value },
            })
          }
        />
        <Text className="text-center mb-2 text-gray-600">
          Rating: {formData.productivity.rating}
        </Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-4 text-base"
          placeholder="Productivity Note"
          value={formData.productivity.note}
          onChangeText={(text) =>
            setFormData({
              ...formData,
              productivity: { ...formData.productivity, note: text },
            })
          }
          placeholderTextColor="#9ca3af"
        />

        {/* Health Section */}
        <Text className="text-lg font-semibold mt-2 mb-1 text-gray-700">Health</Text>
        <Slider
          style={{ height: 40 }}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={formData.health.rating}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              health: { ...formData.health, rating: value },
            })
          }
        />
        <Text className="text-center mb-2 text-gray-600">
          Rating: {formData.health.rating}
        </Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-4 text-base"
          placeholder="Health Note"
          value={formData.health.note}
          onChangeText={(text) =>
            setFormData({
              ...formData,
              health: { ...formData.health, note: text },
            })
          }
          placeholderTextColor="#9ca3af"
        />

        {/* Mood Section */}
        <Text className="text-lg font-semibold mt-2 mb-1 text-gray-700">Mood</Text>
        <Slider
          style={{ height: 40 }}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={formData.mood.rating}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              mood: { ...formData.mood, rating: value },
            })
          }
        />
        <Text className="text-center mb-2 text-gray-600">
          Rating: {formData.mood.rating}
        </Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-4 text-base"
          placeholder="Mood Note"
          value={formData.mood.note}
          onChangeText={(text) =>
            setFormData({
              ...formData,
              mood: { ...formData.mood, note: text },
            })
          }
          placeholderTextColor="#9ca3af"
        />

        <TouchableOpacity
          className={`p-4 rounded-md mb-2 ${editing ? 'bg-green-500' : 'bg-blue-500'}`}
          onPress={editing ? updateJournal : createJournal}
        >
          <Text className="text-white text-center font-semibold text-base">
            {editing ? 'Update Journal' : 'Create Journal'}
          </Text>
        </TouchableOpacity>

        {editing && (
          <TouchableOpacity
            className="p-4 rounded-md mb-2 bg-gray-500"
            onPress={() => {
              setEditing(false);
              resetForm();
            }}
          >
            <Text className="text-white text-center font-semibold text-base">Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="p-5">
        <Text className="text-2xl font-bold mb-5 text-gray-800">Journal Entries</Text>
        {journals.map((journal) => (
          <View key={journal.monthYear} className="bg-white p-4 rounded-lg shadow mb-4">
            <Text className="text-xl font-bold mb-1 text-gray-800">{journal.monthYear}</Text>
            <Text className="text-base mb-1 text-gray-700">{journal.monthHighlight}</Text>
            <Text className="text-sm mb-3 text-gray-600">Skills: {journal.skillsLearnt}</Text>
            
            <View className="mb-3">
              <Text className="text-gray-700">Productivity: {journal.productivity.rating}/10</Text>
              <Text className="text-gray-700">Health: {journal.health.rating}/10</Text>
              <Text className="text-gray-700">Mood: {journal.mood.rating}/10</Text>
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-green-500 px-4 py-2 rounded-md flex-1 mr-2"
                onPress={() => editJournal(journal)}
              >
                <Text className="text-white text-center font-semibold">Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-red-500 px-4 py-2 rounded-md flex-1 ml-2"
                onPress={() => deleteJournal(journal.monthYear)}
              >
                <Text className="text-white text-center font-semibold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Journal;