// UPIPayment.js
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Image, ScrollView, Modal, FlatList } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { initiateUPIPayment } from './UPIPaymentHandler';

const categoriesList = [
  'Food', 'Groceries', 'Travel', 'Health', 'Leisure',
  'Education', 'Gadgets', 'Bills', 'Shopping', 'Grooming', 'Others', 'Automobile',
];

const UPIPayment = () => {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [receiverUPI, setReceiverUPI] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
  };

  const handlePayment = async () => {
    if (!amount || !receiverUPI || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    try {
      const transactionRef = await initiateUPIPayment({
        amount,
        receiverUPI,
        receiverName: 'Receiver',
        transactionNote: reason || 'Payment'
      });

      // Prepare expense data for your backend
      const expenseData = {
        amount: parseFloat(amount),
        category, // Added category
        reason: reason || `UPI payment to ${receiverUPI}`,
        date: new Date().toISOString().split('T')[0],
        upiDetails: {
          receiverUPI,
          transactionRef,
          status: 'initiated'
        }
      };

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
        throw new Error('Failed to save transaction');
      }

      Alert.alert('Success', 'Payment initiated and expense recorded!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-900 p-4">
      {/* Back Icon */}
      <TouchableOpacity 
        onPress={() => router.back()}  
        className="absolute top-4 left-4 bg-gray-900/50 p-2 rounded-full z-10"
      >
        <Icon name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg font-bold mb-6 text-white">UPI PAYMENT</Text>

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

        {/* UPI ID Input */}
        <TextInput
          placeholder="Receiver UPI ID"
          placeholderTextColor="#9ca3af"
          value={receiverUPI}
          onChangeText={setReceiverUPI}
          className="border border-gray-700 rounded-lg p-4 mb-4 w-full bg-gray-900 text-white"
          autoCapitalize="none"
        />

        {/* Reason/Note Input */}
        <TextInput
          placeholder="Reason (optional)"
          placeholderTextColor="#9ca3af"
          value={reason}
          onChangeText={setReason}
          className="border border-gray-700 rounded-lg p-4 mb-4 w-full bg-gray-900 text-white"
        />

        {/* Pay Button */}
        <TouchableOpacity
          onPress={handlePayment}
          disabled={isProcessing}
          className={`bg-gray-900 mb-5 p-4 rounded-lg w-full ${
            isProcessing ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-white text-center font-bold">
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </Text>
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

export default UPIPayment;