import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  X, DollarSign, BarChart2, BookOpen, 
  ShieldCheck, TrendingUp, Heart, PersonStanding 
} from 'lucide-react-native';

const WelcomePopup = ({ manualVisible, setManualVisible }) => {
  const [autoVisible, setAutoVisible] = useState(false);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasShown = await AsyncStorage.getItem('welcome-shown');
      console.log("Welcome shown status:", hasShown); // Debug log
      if (!hasShown) {
        setAutoVisible(true);
        // Only set storage after they've seen the popup and closed it
        // We'll do this in the handleClose function
      }
    } catch (error) {
      console.error('Error checking first time status:', error);
    }
  };

  // Combine both automatic and manual visibility
  const isVisible = autoVisible || manualVisible;

  const handleClose = async () => {
    // Only store the flag when it's their first time (autoVisible is true)
    if (autoVisible) {
      try {
        await AsyncStorage.setItem('welcome-shown', 'true');
        console.log("Set welcome-shown to true"); // Debug log
      } catch (error) {
        console.error('Error saving welcome popup status:', error);
      }
    }
    
    setAutoVisible(false);
    setManualVisible(false);
  };

  // Feature component for better organization
  const FeatureSection = ({ icon, title, children }) => (
    <View className="mb-6">
      <View className="flex-row items-center mb-2">
        {icon}
        <Text className="text-[#8B4513] text-lg font-bold ml-2">{title}</Text>
      </View>
      {children}
    </View>
  );

  // Feature bullet point
  const FeaturePoint = ({ text }) => (
    <View className="flex-row mb-1.5">
      <View className="w-2 h-2 rounded-full bg-[#8B4513]/70 mt-2 mr-2" />
      <Text className="text-gray-700 flex-1">{text}</Text>
    </View>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/70 justify-center items-center p-5">
        <View className="bg-white rounded-3xl p-5 w-full max-h-[85%]">
          <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mb-4">
            <View className="flex-row items-center">
              <Image 
                source={require('../assets/images/finallogo.png')}
                style={{ width: 30, height: 30, resizeMode: 'contain' }}
              />
              <Text className="text-[#8B4513] text-xl font-bold ml-2">
                Welcome to MyTrackery!
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleClose}
              className="rounded-full p-1 bg-gray-100"
            >
              <X size={20} color="#8B4513" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={true} 
            className="mb-4"
            contentContainerStyle={{ paddingRight: 10 }}
          >
            <Text className="text-gray-700 text-base mb-6">
              Take charge of your finances and personal growth with these amazing features:
            </Text>

            <FeatureSection 
              icon={<DollarSign size={22} color="#8B4513" />}
              title="Expense Tracking"
            >
              <FeaturePoint text="Add, view, and delete expenses with ease." />
              <FeaturePoint text="Search expenses by category or date." />
              <FeaturePoint text="Filter and sort expenses by multiple criteria." />
            </FeatureSection>

            <FeatureSection 
              icon={<BarChart2 size={22} color="#8B4513" />}
              title="Spending Insights"
            >
              <FeaturePoint text="Visualize your expenses with bar graphs and pie charts." />
              <FeaturePoint text="Toggle between years to see detailed yearly statistics." />
              <FeaturePoint text="Get a breakdown of expenses by category, monthly, and yearly trends." />
              <FeaturePoint text="View top 5 recent expenses and overall statistics, including total expenses, average monthly spending, top category, and current month totals." />
              <FeaturePoint text="Export insights as a PDF for future reference." />
            </FeatureSection>

            <FeatureSection 
              icon={<BookOpen size={22} color="#8B4513" />}
              title="Monthly Journal"
            >
              <FeaturePoint text="Document monthly highlights and skills learned." />
              <FeaturePoint text="Track your mood, productivity, and health." />
              <FeaturePoint text="Analyze trends using line graphs." />
              <FeaturePoint text="Toggle between years to view and manage journal entries seamlessly." />
            </FeatureSection>

            <FeatureSection 
              icon={<ShieldCheck size={22} color="#8B4513" />}
              title="Seamless Experience"
            >
              <FeaturePoint text="Automatic login for your convenience." />
              <FeaturePoint text="Secure logout when needed." />
              <FeaturePoint text="Intuitive dashboard for monitoring all your data." />
            </FeatureSection>

            <Text className="text-[#8B4513] italic text-center mt-2 mb-4">
              Get started now and let MyTrackery help you organize your life, one step at a time!
            </Text>
          </ScrollView>

          <TouchableOpacity
            onPress={handleClose}
            className="bg-[#8B4513] py-3 rounded-xl"
          >
            <Text className="text-white text-center font-bold">Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WelcomePopup;