import { View, Text, Image, Linking, StatusBar, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Svg, Path } from 'react-native-svg';
import { Dimensions } from 'react-native';
import { ArrowRight, ListChecks } from 'lucide-react-native';
import { FadeIn, SlideUp } from '../components/AnimationUtils';
import WelcomePopup from './WelcomePopup';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const HomeScreen = ({ navigation }) => {
  const [manualPopupVisible, setManualPopupVisible] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (token) {
        navigation.replace('PiNavigation');
      }
    };
    checkLoginStatus();
  }, []);

  const openLinkedInProfile = () => {
    Linking.openURL('https://www.linkedin.com/in/shubham-chede-2957bb278');
  };

  // Calculate dynamic heights based on screen size
  const imageHeight = screenHeight * 0.35; // Reduced from 45% to 35%
  const logoTop = screenHeight * 0.08; // Positioned proportionally

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#8B4513" />
      <WelcomePopup 
        manualVisible={manualPopupVisible} 
        setManualVisible={setManualPopupVisible} 
      />
      
      {/* Top Image Section - REDUCED HEIGHT */}
      <View style={{ height: imageHeight }}>
        <Image
          source={require('../assets/images/apphome.jpeg')}
          style={{ 
            width: '100%', 
            height: '100%', 
            resizeMode: 'cover',
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}
        />
        
        {/* Overlay */}
        <View 
          className="absolute inset-0 bg-black/40"
          style={{ 
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }} 
        />
        
        {/* Wave Design at Bottom of Image */}
        <View className="absolute bottom-0 left-0 right-0">
          <Svg height="40" width={screenWidth} viewBox={`0 0 ${screenWidth} 40`}>
            <Path
              d={`
                M0,40
                L0,15
                Q${screenWidth * 0.25},30 ${screenWidth * 0.5},20
                Q${screenWidth * 0.75},10 ${screenWidth},25
                L${screenWidth},40
                Z
              `}
              fill="white"
            />
          </Svg>
        </View>
      
      </View>
      
      {/* Content Section - IMPROVED SPACING */}
      <View className="flex-1 px-6 pt-2">
        <SlideUp delay={100}>
        <FadeIn>
            <View className="items-center">
              <Image 
                source={require('../assets/images/finallogo.png')} 
                style={{ width: 150, height: 150, resizeMode: 'contain' }}
              />
              <Text className="text-yellow-950 text-2xl font-bold mt-1">MYTRACKERY</Text>
            </View>
          </FadeIn>
          <View className="mb-5">
            <Text className="text-gray-600 text-center text-sm">
              Finance and personal growth all in one place. Take control of your spending and habits.
            </Text>
          </View>
          
          
          {/* Action Buttons - ADJUSTED SIZE */}
          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="bg-[#8B4513] px-5 py-3.5 rounded-xl mb-3 flex-row justify-center items-center"
            >
              <Text className="text-white text-base font-bold mr-2">GET STARTED</Text>
              <ArrowRight size={18} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setManualPopupVisible(true)}
              className="flex-row justify-center items-center bg-[#8B4513]/10 px-5 py-2.5 rounded-xl"
            >
              <ListChecks size={16} color="#8B4513" />
              <Text className="text-[#8B4513] font-semibold ml-2 text-sm">View All Features</Text>
            </TouchableOpacity>
          </View>
        </SlideUp>
      </View>
      
      {/* Footer - COMPACT SPACING */}
      <View className="pb-4 px-6">
        <TouchableOpacity onPress={openLinkedInProfile}>
          <Text className="text-gray-600 text-xs text-center">
            Developed by Shubham Chede
          </Text>
        </TouchableOpacity>
        <Text className="text-gray-500 text-xs text-center mt-1">© 2023 MYTRACKERY. All rights reserved.</Text>
        <Text className="text-gray-400 text-xs text-center">Version 3.0.3</Text>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;