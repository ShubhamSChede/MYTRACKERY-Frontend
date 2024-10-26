import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import 'nativewind';

const Expenses = () => {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterType, setFilterType] = useState(''); 
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);
  
  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('x-auth-token');
      if (!storedToken) {
        Alert.alert('Session Expired', 'Please login again');
        router.replace('/login');
        return;
      }
      setToken(storedToken);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      Alert.alert('Error', 'Failed to authenticate. Please login again.');
      router.replace('/login');
    }
  };

  const fetchExpenses = async () => {
    try {
      if (!token) return;

      const response = await fetch(
        'https://expensetrackerbackend-j2tz.onrender.com/api/expenses',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await AsyncStorage.removeItem('x-auth-token');
          Alert.alert('Session Expired', 'Please login again');
          router.replace('/login');
          return;
        }
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(data);
      setFilteredExpenses(data);
    } catch (error) {
      console.error('Fetch expenses error:', error);
      Alert.alert('Error', 'Failed to fetch expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchExpenses();
    }
  }, [token]);

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedDate(null);
    setFilteredExpenses(expenses);
    setFilterType('');
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (filterType === 'category' && selectedCategory) {
      filtered = filtered.filter(
        (expense) => expense.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (filterType === 'date' && selectedDate) {
      filtered = filtered.filter(
        (expense) => formatDate(expense.date) === formatDate(selectedDate)
      );
    }

    setFilteredExpenses(filtered);
  };

  const renderItem = ({ item }) => (
    <View className="bg-emerald-100 p-2 m-2 rounded-lg shadow-md">
      <TouchableOpacity onPress={() => setExpandedExpenseId(expandedExpenseId === item._id ? null : item._id)}>
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold">{item.category}</Text>
          <Text className="text-base text-gray-800">₹{item.amount.toFixed(2)}</Text>
          <Text className="text-sm text-gray-600">
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        {expandedExpenseId === item._id && (
          <Text className="text-gray-600 mt-2">Reason: {item.reason}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-gray-100 flex-col">
      <Text className="text-2xl font-bold mb-4">Expenses</Text>

      {/* Filter Type Selection */}
      <View className="flex-row justify-evenly  mb-4  mt-4">
        <TouchableOpacity
          className={`p-2 rounded-lg ${filterType === 'category' ? 'bg-black' : 'bg-black'}`}
          onPress={() => setFilterType('category')}
        >
          <Text className="text-white">🔎 Category</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`p-2 rounded-lg ${filterType === 'date' ? 'bg-black' : 'bg-black'}`}
          onPress={() => setFilterType('date')}
        >
          <Text className="text-white">🔎 Date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-black p-2 rounded-lg"
          onPress={filterExpenses}
        >
          <Text className="text-white">✅ Apply</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-black p-2 rounded-lg"
          onPress={resetFilters}
        >
          <Text className="text-white">⏪ Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Filter Inputs */}
      {filterType === 'category' && (
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
          style={{ height: 50, width: '100%', backgroundColor:"black" , color: "white",  }}
        >
          <Picker.Item label="Select Category" value="" style={{ backgroundColor: "black" , color:"white"}}/>
          <Picker.Item label="Food" value="Food" />
          <Picker.Item label="Transport" value="Transport" />
          <Picker.Item label="Shopping" value="Shopping" />
          <Picker.Item label="Entertainment" value="Entertainment" />
        </Picker>
      )}

      {filterType === 'date' && (
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-black p-2 rounded-lg border border-gray-300 justify-center mt-2"
        >
          <Text className="text-white">
            {selectedDate ? formatDate(selectedDate) : 'Select Date'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          className=""
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      )}

      {/* Expenses List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredExpenses}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <Text className="text-center text-base text-gray-800 mt-6">
              No expenses found.
            </Text>
          }
        />
      )}

      <TouchableOpacity
        className="absolute right-4 bottom-4 bg-black w-14 h-14 rounded-full justify-center items-center shadow-lg"
        onPress={() => router.push('/pi/PiNavigationScreens/Create')}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Expenses;
