import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import 'nativewind';

const categories = [
  { label: 'Food', value: 'Food' },
  { label: 'Groceries', value: 'Groceries' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Health', value: 'Health' },
  { label: 'Leisure', value: 'Leisure' },
  { label: 'Education', value: 'Education' },
  { label: 'Gadgets', value: 'Gadgets' },
  { label: 'Bills', value: 'Bills' },
  { label: 'Shopping', value: 'Shopping' },
  { label: 'Grooming', value: 'Grooming' },
  { label: 'Automobile', value: 'Automobile' },
  { label: 'Others', value: 'Others' },
];

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

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(
        `https://expensetrackerbackend-j2tz.onrender.com/api/expenses/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      Alert.alert('Success', 'Expense deleted successfully');
      setExpenses(expenses.filter((expense) => expense._id !== id));
      setFilteredExpenses(filteredExpenses.filter((expense) => expense._id !== id));
    } catch (error) {
      console.error('Delete expense error:', error);
      Alert.alert('Error', 'Failed to delete the expense. Please try again.');
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
    <View className="bg-gray-900 p-3 m-2 rounded-lg shadow-lg border border-gray-800">
      <TouchableOpacity onPress={() => setExpandedExpenseId(expandedExpenseId === item._id ? null : item._id)}>
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-white">{item.category}</Text>
          <Text className="text-base text-green-400">₹{item.amount.toFixed(2)}</Text>
          <Text className="text-sm text-gray-400">
            {new Date(item.date).toLocaleDateString()}
          </Text>
          <TouchableOpacity 
            onPress={() => deleteExpense(item._id)}
            className="bg-red-500/20 p-2 rounded-full"
          >
            <Text className="text-red-500">🗑️</Text>
          </TouchableOpacity>
        </View>
        {expandedExpenseId === item._id && (
          <Text className="text-gray-400 mt-2 p-2 bg-gray-800/50 rounded-lg">Reason: {item.reason}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-black flex-col">
      <Text className="text-2xl font-bold mb-4 text-white">Expenses</Text>

      {/* Filter Type Selection */}
      <View className="flex-row justify-between mb-4 mt-4">
        <TouchableOpacity
          className={`p-3 rounded-lg ${
            filterType === 'category' ? 'bg-gray-800' : 'bg-gray-900'
          } border border-gray-700`}
          onPress={() => setFilterType('category')}
        >
          <Text className="text-white">🔎 Category</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`p-3 rounded-lg ${
            filterType === 'date' ? 'bg-gray-800' : 'bg-gray-900'
          } border border-gray-700`}
          onPress={() => setFilterType('date')}
        >
          <Text className="text-white">🔎 Date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-800 p-3 rounded-lg border border-gray-700"
          onPress={filterExpenses}
        >
          <Text className="text-white">✅ Apply</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-800 p-3 rounded-lg border border-gray-700"
          onPress={resetFilters}
        >
          <Text className="text-white">⏪ Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Category and Date filters */}
      {filterType === 'category' && (
        <View className="bg-gray-900 rounded-lg mb-4 border border-gray-800">
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
            style={{ height: 50, width: '100%' }}
            dropdownIconColor="white"
            className="text-white"
          >
            <Picker.Item label="Select Category" value="" style={{ backgroundColor: "#1f2937", color: "white" }} />
            {categories.map((category) => (
              <Picker.Item
                key={category.value}
                label={category.label}
                value={category.value}
                style={{ backgroundColor: "#1f2937", color: "white" }}
              />
            ))}
          </Picker>
        </View>
      )}

      {filterType === 'date' && (
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-gray-900 p-4 rounded-lg border border-gray-800 justify-center mt-2 mb-4"
        >
          <Text className="text-white text-center">
            {selectedDate ? formatDate(selectedDate) : 'Select Date'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Add FlatList for expense cards */}
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <FlatList
          data={filteredExpenses}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 80 }} // Add padding at bottom for FAB
        />
      )}

      {/* Add button */}
      <TouchableOpacity
        className="bg-slate-700 border border-gray-900 p-4 rounded-full absolute bottom-6 right-6 shadow-lg z-10"
        onPress={() => router.push('/pi/PiNavigationScreens/Create')}
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
    </View>
  );
};

export default Expenses;
