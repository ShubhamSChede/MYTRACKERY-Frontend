// app/pi/PiNavigationScreens/Create.js
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Modal, FlatList, Image, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, Calendar, Check, X } from 'lucide-react-native';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import { useNavigation } from '@react-navigation/native';
import { publishDataUpdate } from '../../../utilities/EventEmitter'; 

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
  const navigation = useNavigation();

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAddExpense = async () => {
    if (!amount || !category || !reason) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Fix for date handling with timezone adjustment
    const selectedDate = new Date(date);
    const adjustedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
    const formattedDate = adjustedDate.toISOString().split('T')[0];

    const expenseData = {
      amount: parseFloat(amount),
      category,
      reason,
      date: formattedDate,
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

      const responseData = await response.json();  
      console.log('Server response:', responseData);  

      if (!response.ok) {
        throw new Error('Failed to add expense');
      }

      Alert.alert('Success', 'Expense added successfully!');
      publishDataUpdate('expense-added');
      navigation.navigate('Dashboard');  // Navigate to the dashboard after adding expense    
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    }
  };

  // Function to format display date
  const formatDisplayDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
  };

  // Render category item for the modal
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleCategorySelect(item)}
      className="border border-[#8B4513]/20 rounded-xl p-4 mb-2 bg-[#8B4513]/10"
    >
      <Text className="text-[#8B4513] text-center font-medium">{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity 
          onPress={() => navigation.navigate('Dashboard')}
          className="p-2 rounded-full"
        >
          <ArrowLeft size={24} color="#8B4513" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#8B4513] ml-4">Add Expense</Text>
      </View>

      <View className="flex-1 p-4">
        <Card title="New Expense" className="mb-4">
          {/* Amount Input */}
          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Amount</Text>
            <TextInput
              placeholder="Enter amount"
              placeholderTextColor="#9ca3af"
              value={amount}
              onChangeText={setAmount}
              className="border border-gray-300 rounded-xl p-4 bg-gray-50 text-gray-800"
              keyboardType="numeric"
            />
          </View>

          {/* Category Selection */}
          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              className="border border-gray-300 rounded-xl p-4 bg-gray-50 flex-row justify-between items-center"
            >
              <Text className={category ? "text-gray-800" : "text-gray-400"}>
                {category || 'Select Category'}
              </Text>
              <Calendar size={20} color="#8B4513" />
            </TouchableOpacity>
          </View>

          {/* Reason Input */}
          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Reason</Text>
            <TextInput
              placeholder="Why did you spend?"
              placeholderTextColor="#9ca3af"
              value={reason}
              onChangeText={setReason}
              className="border border-gray-300 rounded-xl p-4 bg-gray-50 text-gray-800"
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Date Selection */}
          <View className="mb-6">
            <Text className="text-gray-600 mb-2">Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="border border-gray-300 rounded-xl p-4 bg-gray-50 flex-row justify-between items-center"
            >
              <Text className="text-gray-800">
                {formatDisplayDate(date)}
              </Text>
              <Calendar size={20} color="#8B4513" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}
        </Card>

        {/* Add Expense Button */}
        <Button 
          title="Add Expense" 
          onPress={handleAddExpense} 
          size="large"
          className="mt-4"
        />
      </View>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-[#8B4513]">Select Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                className="p-2"
              >
                <X size={24} color="#8B4513" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categoriesList}
              keyExtractor={(item) => item}
              renderItem={renderCategoryItem}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              className="mb-4"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Create;