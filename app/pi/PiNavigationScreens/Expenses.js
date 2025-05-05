import { 
  View, Text, TouchableOpacity, FlatList, Alert, 
  ActivityIndicator, SafeAreaView, TextInput, Modal
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, Filter, Trash2, ChevronDown, ChevronUp, 
  Calendar, DollarSign, X, ChevronLeft, ChevronRight, 
  RefreshCcw, Tag
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import { FadeIn, SlideUp, ScaleIn, createStaggeredAnimation } from '../../../components/AnimationUtils';
import { publishDataUpdate } from '../../../utilities/EventEmitter';

// Categories array remains the same
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

const ITEMS_PER_PAGE = 10;

const Expenses = () => {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedExpenses, setPaginatedExpenses] = useState([]);
  
  // Advanced filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  
  // Modal state for category selection
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Get auth token
  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('x-auth-token');
      if (!storedToken) {
        Alert.alert('Session Expired', 'Please login again');
        navigation.navigate('HomeScreen');
        return;
      }
      setToken(storedToken);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      Alert.alert('Error', 'Failed to authenticate. Please login again.');
      router.replace('/');
    }
  };

  // Fetch expenses from API
  const fetchExpenses = async () => {
    try {
      if (!token) return;
      
      setRefreshing(true);
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
          navigation.navigate('HomeScreen');
          return;
        }
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(data);
      setFilteredExpenses(data);
      updatePagination(data, 1);
    } catch (error) {
      console.error('Fetch expenses error:', error);
      Alert.alert('Error', 'Failed to fetch expenses. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Delete an expense
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

              const updatedExpenses = expenses.filter((expense) => expense._id !== id);
              const updatedFiltered = filteredExpenses.filter((expense) => expense._id !== id);
              
              setExpenses(updatedExpenses);
              setFilteredExpenses(updatedFiltered);
              updatePagination(updatedFiltered, currentPage);
              
              Alert.alert('Success', 'Expense deleted successfully');

              setLoading(false);
              publishDataUpdate('expense-deleted');
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

  // Update pagination data
  const updatePagination = useCallback((data, page) => {
    const totalItems = data.length;
    const calculatedTotalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const safePageNumber = Math.min(Math.max(1, page), calculatedTotalPages || 1);
    
    const startIndex = (safePageNumber - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    
    const currentPageItems = data.slice(startIndex, endIndex);
    
    setTotalPages(calculatedTotalPages || 1);
    setCurrentPage(safePageNumber);
    setPaginatedExpenses(createStaggeredAnimation(currentPageItems, 0, 70));
  }, []);

  // Navigate to a specific page
  const goToPage = (page) => {
    updatePagination(filteredExpenses, page);
  };

  // Initial setup
  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchExpenses();
    }
  }, [token]);

  // Date formatting helper
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setMinAmount('');
    setMaxAmount('');
    setStartDate(null);
    setEndDate(null);
    setSortBy('date');
    setSortOrder('desc');
    setActiveFilters([]);
    setFilteredExpenses(expenses);
    updatePagination(expenses, 1);
    setShowFilters(false);
  };

  // Apply selected filters
  const applyFilters = () => {
    let filtered = [...expenses];
    const newActiveFilters = [];
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(expense => 
        selectedCategories.includes(expense.category)
      );
      newActiveFilters.push(`${selectedCategories.length} categories`);
    }
    
    // Filter by amount range
    if (minAmount && !isNaN(parseFloat(minAmount))) {
      const min = parseFloat(minAmount);
      filtered = filtered.filter(expense => expense.amount >= min);
      newActiveFilters.push(`Min: ₹${min}`);
    }
    
    if (maxAmount && !isNaN(parseFloat(maxAmount))) {
      const max = parseFloat(maxAmount);
      filtered = filtered.filter(expense => expense.amount <= max);
      newActiveFilters.push(`Max: ₹${max}`);
    }
    
    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(expense => new Date(expense.date) >= start);
      newActiveFilters.push(`From: ${formatDate(startDate)}`);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(expense => new Date(expense.date) <= end);
      newActiveFilters.push(`To: ${formatDate(endDate)}`);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date) - new Date(b.date) 
          : new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      }
      return 0;
    });
    
    if (sortBy && sortOrder) {
      newActiveFilters.push(`Sort: ${sortBy} ${sortOrder === 'asc' ? '↑' : '↓'}`);
    }
    
    setActiveFilters(newActiveFilters);
    setFilteredExpenses(filtered);
    updatePagination(filtered, 1);
    setShowFilters(false);
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Remove a specific filter
  const removeFilter = (index) => {
    // Create a copy of current filters
    const newActiveFilters = [...activeFilters];
    const removedFilter = newActiveFilters[index];
    newActiveFilters.splice(index, 1);
    
    // Reset the corresponding filter
    if (removedFilter.includes('categories')) {
      setSelectedCategories([]);
    } else if (removedFilter.includes('Min:')) {
      setMinAmount('');
    } else if (removedFilter.includes('Max:')) {
      setMaxAmount('');
    } else if (removedFilter.includes('From:')) {
      setStartDate(null);
    } else if (removedFilter.includes('To:')) {
      setEndDate(null);
    } else if (removedFilter.includes('Sort:')) {
      setSortBy('date');
      setSortOrder('desc');
    }
    
    // Re-apply remaining filters
    setActiveFilters(newActiveFilters);
    applyFilters();
  };

  // List item renderer
  const renderItem = ({ item, index }) => (
    <SlideUp delay={item.animationDelay || (index * 70)}>
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
    </SlideUp>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <FadeIn duration={600}>
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
                onPress={() => navigation.navigate('Create')}
              >
                <Plus size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Active Filters Tags */}
          {activeFilters.length > 0 && (
            <View className="mt-3 flex-row flex-wrap">
              {activeFilters.map((filter, index) => (
                <View key={index} className="flex-row items-center bg-[#8B4513]/10 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-[#8B4513] text-sm">{filter}</Text>
                  <TouchableOpacity onPress={() => removeFilter(index)} className="ml-1">
                    <X size={14} color="#8B4513" />
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity 
                onPress={resetFilters} 
                className="flex-row items-center bg-gray-100 rounded-full px-3 py-1 mb-2"
              >
                <Text className="text-gray-600 text-sm">Clear all</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </FadeIn>

      {/* Filters Section */}
      {showFilters && (
        <SlideUp>
          <View className="p-4 bg-gray-50 border-b border-gray-200">
            {/* Categories Selection */}
            <View className="mb-4">
              <Text className="text-[#8B4513] font-medium mb-2">Categories</Text>
              <TouchableOpacity 
                onPress={() => setShowCategoryModal(true)}
                className="bg-white p-3 border border-gray-200 rounded-xl flex-row justify-between items-center"
              >
                <Text className="text-gray-600">
                  {selectedCategories.length > 0 
                    ? `${selectedCategories.length} selected` 
                    : 'Select categories'}
                </Text>
                <Tag size={18} color="#8B4513" />
              </TouchableOpacity>
            </View>
            
            {/* Amount Range */}
            <View className="mb-4">
              <Text className="text-[#8B4513] font-medium mb-2">Amount Range</Text>
              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <TextInput
                    placeholder="Min amount"
                    value={minAmount}
                    onChangeText={setMinAmount}
                    keyboardType="numeric"
                    className="bg-white border border-gray-200 rounded-xl p-3"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <TextInput
                    placeholder="Max amount"
                    value={maxAmount}
                    onChangeText={setMaxAmount}
                    keyboardType="numeric"
                    className="bg-white border border-gray-200 rounded-xl p-3"
                  />
                </View>
              </View>
            </View>
            
            {/* Date Range */}
            <View className="mb-4">
              <Text className="text-[#8B4513] font-medium mb-2">Date Range</Text>
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={() => setShowStartDatePicker(true)}
                  className="flex-1 bg-white p-3 rounded-xl border border-gray-200 mr-2 flex-row justify-between items-center"
                >
                  <Text className="text-gray-600">
                    {startDate ? formatDate(startDate) : 'Start Date'}
                  </Text>
                  <Calendar size={18} color="#8B4513" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowEndDatePicker(true)}
                  className="flex-1 bg-white p-3 rounded-xl border border-gray-200 ml-2 flex-row justify-between items-center"
                >
                  <Text className="text-gray-600">
                    {endDate ? formatDate(endDate) : 'End Date'}
                  </Text>
                  <Calendar size={18} color="#8B4513" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Sorting Options */}
            <View className="mb-4">
              <Text className="text-[#8B4513] font-medium mb-2">Sort By</Text>
              <View className="flex-row mb-2">
                <TouchableOpacity 
                  className={`mr-2 px-4 py-2 rounded-full ${sortBy === 'date' ? 'bg-[#8B4513]' : 'bg-[#8B4513]/10'}`}
                  onPress={() => setSortBy('date')}
                >
                  <Text className={`${sortBy === 'date' ? 'text-white' : 'text-[#8B4513]'} font-medium`}>
                    Date
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`mr-2 px-4 py-2 rounded-full ${sortBy === 'amount' ? 'bg-[#8B4513]' : 'bg-[#8B4513]/10'}`}
                  onPress={() => setSortBy('amount')}
                >
                  <Text className={`${sortBy === 'amount' ? 'text-white' : 'text-[#8B4513]'} font-medium`}>
                    Amount
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View className="flex-row">
                <TouchableOpacity 
                  className={`mr-2 px-4 py-2 rounded-full ${sortOrder === 'asc' ? 'bg-[#8B4513]' : 'bg-[#8B4513]/10'}`}
                  onPress={() => setSortOrder('asc')}
                >
                  <Text className={`${sortOrder === 'asc' ? 'text-white' : 'text-[#8B4513]'} font-medium`}>
                    Ascending
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`mr-2 px-4 py-2 rounded-full ${sortOrder === 'desc' ? 'bg-[#8B4513]' : 'bg-[#8B4513]/10'}`}
                  onPress={() => setSortOrder('desc')}
                >
                  <Text className={`${sortOrder === 'desc' ? 'text-white' : 'text-[#8B4513]'} font-medium`}>
                    Descending
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Action buttons */}
            <View className="flex-row justify-between">
              <Button 
                title="Apply Filters" 
                onPress={applyFilters}
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
        </SlideUp>
      )}

      {/* Expenses List with Pagination */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : filteredExpenses.length > 0 ? (
        <View className="flex-1">
          <FlatList
            data={paginatedExpenses}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 16 }}
            onRefresh={() => fetchExpenses()}
            refreshing={refreshing}
          />
          
          {/* Pagination Controls */}
          <View className="flex-row justify-between items-center px-4 py-3 border-t border-gray-200">
            <TouchableOpacity
              onPress={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 ${currentPage === 1 ? 'opacity-50' : ''}`}
            >
              <ChevronLeft size={20} color="#8B4513" />
            </TouchableOpacity>
            
            <View className="flex-row items-center">
              <Text className="text-[#8B4513] font-medium">
                Page {currentPage} of {totalPages}
              </Text>
              <TouchableOpacity onPress={() => fetchExpenses()} className="ml-3">
                <RefreshCcw size={16} color="#8B4513" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 ${currentPage === totalPages ? 'opacity-50' : ''}`}
            >
              <ChevronRight size={20} color="#8B4513" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScaleIn>
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-gray-500 text-lg mb-4">No expenses found</Text>
            <Button 
              title="Add Expense" 
              onPress={() => router.push('/pi/PiNavigationScreens/Create')}
              icon={<Plus size={18} color="white" />}
            />
          </View>
        </ScaleIn>
      )}

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          onChange={(event, date) => {
            setShowStartDatePicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          onChange={(event, date) => {
            setShowEndDatePicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}
      
      {/* Categories Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-bold text-[#8B4513]">Select Categories</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <X size={24} color="#8B4513" />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row flex-wrap mb-5">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  onPress={() => toggleCategory(category.value)}
                  className={`m-1 px-4 py-2 rounded-full border ${
                    selectedCategories.includes(category.value)
                      ? 'bg-[#8B4513] border-[#8B4513]'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`${
                      selectedCategories.includes(category.value)
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View className="flex-row">
              <Button
                title={`Apply (${selectedCategories.length})`}
                onPress={() => setShowCategoryModal(false)}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Expenses;