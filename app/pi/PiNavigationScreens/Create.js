import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Modal, FlatList } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

const categoriesList = [
  'Food', 'Groceries', 'Travel', 'Health', 'Leisure',
  'Education', 'Gadgets', 'Bills', 'Shopping', 'Grooming'
];

const Create = () => {
  const router = useRouter();

  // State variables for form input
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAddExpense = async () => {
    if (!amount || !category || !reason) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const expenseData = {
      amount: parseFloat(amount),
      category,
      reason,
      date: date.toISOString().split('T')[0],
    };

    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        Alert.alert('Session Expired', 'Please login again');
        router.replace('/login');
        return;
      }

      const response = await fetch('https://expensetrackerbackend-j2tz.onrender.com/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        throw new Error('Failed to add expense');
      }

      Alert.alert('Success', 'Expense added successfully!');
      router.push('/pi/PiNavigation');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    }
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Back Icon */}
      <TouchableOpacity onPress={() => router.push('/pi/PiNavigation')} className="absolute top-4 left-4">
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-bold mb-4">ADD EXPENSE</Text>

        <TextInput
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          className="border border-gray-400 rounded p-2 mb-4 w-full"
          keyboardType="numeric"
        />

        <TouchableOpacity
          onPress={() => setShowCategoryModal(true)}
          className="border border-gray-400 rounded p-2 mb-4 w-full"
        >
          <Text className="text-gray-700">
            {category || 'Select Category'}
          </Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Reason"
          value={reason}
          onChangeText={setReason}
          className="border border-gray-400 rounded p-2 mb-4 w-full"
        />

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="border border-gray-400 rounded p-2 mb-4 w-full"
        >
          <Text className="text-gray-700">
            {date.toISOString().split('T')[0]}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        <TouchableOpacity
          onPress={handleAddExpense}
          className="bg-black p-4 rounded-md w-full"
        >
          <Text className="text-white text-center">Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg p-4 w-3/4">
            <Text className="text-lg font-bold mb-4">Select Category</Text>
            <FlatList
              data={categoriesList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCategorySelect(item)}
                  className="border border-gray-300 rounded p-2 mb-2"
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setShowCategoryModal(false)}
              className="bg-black p-2 rounded mt-4"
            >
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Create;
