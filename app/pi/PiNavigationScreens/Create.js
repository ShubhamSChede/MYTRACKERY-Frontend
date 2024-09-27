import { View, Text } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const Create = () => {
  const router = useRouter();

  return (
    <View>
      <TouchableOpacity onPress={() => router.push('/pi/PiNavigationScreens/CreateDep')}>
        <Text>Create Deployments</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/pi/PiNavigationScreens/CreateMeeting')}>
        <Text>Create Meetings</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/pi/PiNavigationScreens/CreatePat')}>
        <Text>Create Patrolling</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Create;