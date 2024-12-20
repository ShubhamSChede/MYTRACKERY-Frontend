import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WelcomePopup = ({ manualVisible, setManualVisible }) => {
  const [autoVisible, setAutoVisible] = useState(false);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasShown = await AsyncStorage.getItem('welcome-shown');
      if (!hasShown) {
        setAutoVisible(true);
        await AsyncStorage.setItem('welcome-shown', 'true');
      }
    } catch (error) {
      console.error('Error checking first time status:', error);
    }
  };

  // Combine both automatic and manual visibility
  const isVisible = autoVisible || manualVisible;

  const handleClose = () => {
    setAutoVisible(false);
    setManualVisible(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/80 justify-center items-center p-5">
        <View className="bg-gray-900 rounded-lg p-6 w-full max-h-5/6">
          <ScrollView>
            <Text className="text-white text-2xl font-bold mb-4 text-center">Welcome to TRACKNEST!</Text>
            
            <Text className="text-white text-base mb-4">
              Take charge of your finances and personal growth with these amazing features:
            </Text>

            <Text className="text-white text-lg font-semibold mb-2">Expense Tracking:</Text>
            <Text className="text-white text-base mb-2">• Add, view, and delete expenses with ease.</Text>
            <Text className="text-white text-base mb-4">• Search expenses by category or date.</Text>

            <Text className="text-white text-lg font-semibold mb-2">Spending Insights:</Text>
            <Text className="text-white text-base mb-1">• Visualize your expenses with bar graphs and pie charts.</Text>
            <Text className="text-white text-base mb-1">• Toggle between years to see detailed yearly statistics.</Text>
            <Text className="text-white text-base mb-1">• Get a breakdown of expenses by category, monthly, and yearly trends.</Text>
            <Text className="text-white text-base mb-1">• View top 5 recent expenses and overall statistics, including total expenses, average monthly spending, top category, and current month totals.</Text>
            <Text className="text-white text-base mb-4">• Export insights as a PDF for future reference.</Text>

            <Text className="text-white text-lg font-semibold mb-2">Monthly Journal:</Text>
            <Text className="text-white text-base mb-1">• Document monthly highlights, skills learned, and track your mood, productivity, and health.</Text>
            <Text className="text-white text-base mb-1">• Analyze trends using line graphs.</Text>
            <Text className="text-white text-base mb-4">• Toggle between years to view and manage journal entries seamlessly.</Text>

            <Text className="text-white text-lg font-semibold mb-2">Seamless Login Experience:</Text>
            <Text className="text-white text-base mb-1">• Automatic login for your convenience.</Text>
            <Text className="text-white text-base mb-4">• Secure logout when needed.</Text>

            <Text className="text-white text-base italic mb-6">
              Get started now and let TRACKNEST help you organize your life, one step at a time!
            </Text>
          </ScrollView>

          <TouchableOpacity
            onPress={handleClose}
            className="bg-gray-800 py-3 rounded-md mt-4"
          >
            <Text className="text-white text-center font-semibold">Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WelcomePopup;