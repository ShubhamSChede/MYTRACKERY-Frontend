import { View, Text } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Text  className="text-lg font-bold">Home Screen babbbbbbbbbbyyy </Text>
      <TouchableOpacity onPress={() => navigation.navigate('PiNavigation')}>
        <Text>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;