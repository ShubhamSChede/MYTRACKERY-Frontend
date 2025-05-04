// app/pi/PiNavigationScreens/Expenses.js (partial update)
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Plus, Filter, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../../../components/Button';
import Card from '../../../components/Card';

// Categories array remains the same
const categories = [
  { label: 'Food', value: 'Food' },
  { label: 'Groceries', value: 'Groceries' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Health', value: 'Health' },
  { label: 'Leisure', value: 'Leisure' },
  { label: 'Education', value: 'Education' },
  { label: 'Gadgets', value: 'Gadgets' },
  // app/pi/PiNavigationScreens/Expenses.js (continuation)
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
  const [showFilters, setShowFilters] = useState(false);
  
  // Existing token retrieval and expense fetching functions remain the same
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
      Alert.alert(
        "Delete Expense",
        "Are you sure you want to delete this expense?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: async () => {
              setLoading(true);
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
              setLoading(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Delete expense error:', error);
      Alert.alert('Error', 'Failed to delete the expense. Please try again.');
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
    setShowFilters(false);
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
    setShowFilters(false);
  };

  const renderItem = ({ item }) => (
    <Card className="mb-3">
      <TouchableOpacity onPress={() => setExpandedExpenseId(expandedExpenseId === item._id ? null : item._id)}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            {/* Category badge */}
            <View className="bg-[#8B4513]/10 px-3 py-1 rounded-full mr-2">
              <Text className="text-[#8B4513] font-medium">{item.category}</Text>
            </View>
            
            {/* Amount */}
            <Text className="text-lg font-bold text-[#8B4513]">₹{item.amount.toFixed(2)}</Text>
          </View>
          
          <View className="flex-row items-center">
            {/* Date */}
            <Text className="text-gray-500 mr-3">
              {new Date(item.date).toLocaleDateString()}
            </Text>
            
            {/* Expand/collapse indicator */}
            {expandedExpenseId === item._id ? 
              <ChevronUp size={18} color="#8B4513" /> : 
              <ChevronDown size={18} color="#8B4513" />
            }
            
            {/* Delete button */}
            <TouchableOpacity 
              onPress={() => deleteExpense(item._id)}
              className="ml-3"
            >
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Expanded content */}
        {expandedExpenseId === item._id && (
          <View className="mt-3 p-3 bg-gray-50 rounded-xl">
            <Text className="text-gray-700">Reason: {item.reason}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-[#8B4513]">Expenses</Text>
          <View className="flex-row">
            <TouchableOpacity
              className="p-2 mr-2 bg-[#8B4513]/10 rounded-full"
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={22} color="#8B4513" />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2 bg-[#8B4513] rounded-full"
              onPress={() => router.push('/pi/PiNavigationScreens/Create')}
            >
              <Plus size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filters Section */}
      {showFilters && (
        <View className="p-4 bg-gray-50 border-b border-gray-200">
          <View className="mb-4">
            <Text className="text-[#8B4513] font-medium mb-2">Filter By:</Text>
            <View className="flex-row mb-4">
              <TouchableOpacity 
                className={`mr-2 px-4 py-2 rounded-full ${filterType === 'category' ? 'bg-[#8B4513] ' : 'bg-[#8B4513]/10'}`}
                onPress={() => setFilterType('category')}
              >
                <Text className={`${filterType === 'category' ? 'text-white' : 'text-[#8B4513]'} font-medium`}>
                  Category
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`mr-2 px-4 py-2 rounded-full ${filterType === 'date' ? 'bg-[#8B4513]' : 'bg-[#8B4513]/10'}`}
                onPress={() => setFilterType('date')}
              >
                <Text className={`${filterType === 'date' ? 'text-white' : 'text-[#8B4513]'} font-medium`}>
                  Date
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category filter */}
          {filterType === 'category' && (
            <View className="bg-white rounded-xl mb-4 border border-gray-200">
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
                dropdownIconColor="#8B4513"
              >
                <Picker.Item label="Select Category" value="" color="#8B4513" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.value}
                    label={category.label}
                    value={category.value}
                    color="#8B4513"
                  />
                ))}
              </Picker>
            </View>
          )}

          {/* Date filter */}
          {filterType === 'date' && (
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white p-4 rounded-xl border border-gray-200 mb-4"
            >
              <Text className="text-center text-[#8B4513]">
                {selectedDate ? formatDate(selectedDate) : 'Select Date'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Action buttons */}
          <View className="flex-row justify-between">
            <Button 
              title="Apply Filter" 
              onPress={filterExpenses}
              className="flex-1 mr-2"
            />
            <Button 
              title="Reset" 
              variant="outlined"
              onPress={resetFilters}
              className="flex-1 ml-2"
            />
          </View>
        </View>
      )}

      {/* Expenses List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : filteredExpenses.length > 0 ? (
        <FlatList
          data={filteredExpenses}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-500 text-lg mb-4">No expenses found</Text>
          <Button 
            title="Add Expense" 
            onPress={() => router.push('/pi/PiNavigationScreens/Create')}
            icon={<Plus size={18} color="white" />}
          />
        </View>
      )}

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
    </SafeAreaView>
  );
};

export default Expenses;
