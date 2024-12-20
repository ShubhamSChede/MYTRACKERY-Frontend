import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Modal, FlatList, Image } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

const categoriesList = [
  'Food', 'Groceries', 'Travel', 'Health', 'Leisure',
  'Education', 'Gadgets', 'Bills', 'Shopping', 'Grooming', 'Others', 'Automobile',
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

    console.log('Sending expense data:', expenseData);  // Debug log

      const response = await fetch('https://expensetrackerbackend-j2tz.onrender.com/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(expenseData),
      });

      const responseData = await response.json();  // Get response data
      console.log('Server response:', responseData);  // Debug log
  

      if (!response.ok) {
        throw new Error('Failed to add expense');
      }

      Alert.alert('Success', 'Expense added successfully!');
      router.back();    
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add expense. Please try again. error : ');
    }
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Image at the Top */}
      <Image
        source={require('../../../assets/images/adaptive-icon.png')}
        className="mt-5 w-full h-1/3"
        resizeMode="contain"
      />

      {/* Back Icon */}
      <TouchableOpacity 
        onPress={() => router.push('/pi/PiNavigation')}  
        className="absolute top-4 left-4 bg-gray-900/50 p-2 rounded-full"
      >
        <Icon name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg font-bold mb-6 text-white">ADD EXPENSE</Text>

        {/* Amount Input */}
        <TextInput
          placeholder="Amount"
          placeholderTextColor="#9ca3af"
          value={amount}
          onChangeText={setAmount}
          className="border border-gray-700 rounded-lg p-4 mb-4 w-full bg-gray-900 text-white"
          keyboardType="numeric"
        />

        {/* Category Selection */}
        <TouchableOpacity
          onPress={() => setShowCategoryModal(true)}
          className="border border-gray-700 rounded-lg p-4 mb-4 w-full bg-gray-900"
        >
          <Text className="text-gray-400">
            {category || 'Select Category'}
          </Text>
        </TouchableOpacity>

        {/* Reason Input */}
        <TextInput
          placeholder="Reason"
          placeholderTextColor="#9ca3af"
          value={reason}
          onChangeText={setReason}
          className="border border-gray-700 rounded-lg p-4 mb-4 w-full bg-gray-900 text-white"
        />

        {/* Date Selection */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="border border-gray-700 rounded-lg p-4 mb-6 w-full bg-gray-900"
        >
          <Text className="text-gray-400">
            {date.toISOString().split('T')[0]}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            // Note: DateTimePicker styling is platform-specific
          />
        )}

        {/* Add Expense Button */}
        <TouchableOpacity
           //onPress={() => router.back()}
           onPress={handleAddExpense}
          className="bg-gray-900 mb-5 p-4 rounded-lg w-full"
        >
          <Text className="text-white text-center font-bold">Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-900 rounded-t-3xl p-6 h-2/3">
            <Text className="text-xl font-bold mb-4 text-white">Select Category</Text>
            <FlatList
              data={categoriesList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCategorySelect(item)}
                  className="border border-gray-700 rounded-lg p-4 mb-2 bg-gray-800/50"
                >
                  <Text className="text-white">{item}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              className="mb-4"
            />
            <TouchableOpacity
              onPress={() => setShowCategoryModal(false)}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700"
            >
              <Text className="text-white text-center font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Create;
