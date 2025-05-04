// components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, BookOpen, BarChart2, Clipboard, LogOut, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { FadeIn, SlideUp } from './AnimationUtils';
import { useNavigation } from '@react-navigation/native';


const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [expenses, setExpenses] = useState([]); // Add this line
  const [monthlyExpensesData, setMonthlyExpensesData] = useState({ labels: [], data: [] });
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [journalHighlight, setJournalHighlight] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      processExpensesData(expenses);
    }
  }, [selectedMonthYear, expenses]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        router.replace('/login');
        return;
      }

      // Fetch dashboard data - this will give us the user info
      const dashboardResponse = await fetch(
        'https://expensetrackerbackend-j2tz.onrender.com/api/dashboard',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        }
      );

      if (!dashboardResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await dashboardResponse.json();
      setUserData(dashboardData.user);
      
      // Fetch all expenses to calculate today's expenses and monthly chart
      const expensesResponse = await fetch(
        'https://expensetrackerbackend-j2tz.onrender.com/api/expenses',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        }
      );

      if (!expensesResponse.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const expensesData = await expensesResponse.json();
      setExpenses(expensesData); // Store expenses in state
      processExpensesData(expensesData);
      
      // Fetch journal entries to get the latest
      const journalResponse = await fetch(
        'https://expensetrackerbackend-j2tz.onrender.com/api/journal',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        }
      );

      if (journalResponse.ok) {
        const journalData = await journalResponse.json();
        findLatestJournal(journalData);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processExpensesData = (expenses) => {
    if (!expenses || expenses.length === 0) {
      return;
    }

    // Get today's date for filtering
    const today = new Date();
    const todayString = formatDate(today);
    
    // Use selected month & year instead of current
    const { month: currentMonth, year: currentYear } = selectedMonthYear;
    
    // Calculate today's total expenses
    let todayTotal = 0;
    let recentExpList = [];
    
    // Create an array for each day of the selected month (1-indexed days)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyExpenses = Array(daysInMonth).fill(0);
    
    // For category breakdown
    const categories = {};
    
    // Group expenses by day for selected month and calculate today's expenses
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const expenseDateString = formatDate(expenseDate);
      
      // Check if expense is from today
      if (expenseDateString === todayString) {
        todayTotal += expense.amount;
      }
      
      // Check if expense is from selected month for the chart
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        const day = expenseDate.getDate();
        dailyExpenses[day - 1] += expense.amount;
        
        // Add to category breakdown
        const category = expense.category;
        if (categories[category]) {
          categories[category] += expense.amount;
        } else {
          categories[category] = expense.amount;
        }
      }
    });
    
    // Get 3 most recent expenses for display
    recentExpList = [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    
    // Create labels for the chart - only label every 5 days for readability
    const labels = [];
    for (let i = 1; i <= daysInMonth; i++) {
      if (i === 1 || i % 5 === 0 || i === daysInMonth || i === today.getDate()) {
        labels.push(i.toString());
      } else {
        labels.push('');
      }
    }
    
    // Process category data for pie chart
    const categoryData = processCategoryData(categories);
    
    setTodayExpenses(todayTotal);
    setMonthlyExpensesData({ labels, data: dailyExpenses });
    setRecentExpenses(recentExpList);
    setCategoryBreakdown(categoryData);
  };

  const processCategoryData = (categories) => {
    const colors = [
      '#A8DADC', // Powder Blue
      '#457B9D', // Desaturated Blue
      '#F4A261', // Soft Orange
      '#E76F51', // Soft Red
      '#2A9D8F', // Teal
      '#E9C46A', // Pale Yellow
      '#B5838D', // Dusty Pink
      '#81B29A', // Soft Green
      '#A3A1F7', // Light Lavender
      '#FFB4A2', // Light Coral
      '#6D6875', // Muted Purple
      '#CF9F7D', // Light Brown
    ];

    const totalAmount = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(categories)
      .map(([category, amount], index) => ({
        name: category,
        amount,
        percentage: ((amount / totalAmount) * 100).toFixed(1),
        color: colors[index % colors.length],
        legendFontColor: '#666666',
        legendFontSize: 12
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const changeMonth = (direction) => {
    const { month, year } = selectedMonthYear;
    let newMonth = month;
    let newYear = year;
    
    if (direction === 'prev') {
      newMonth = month - 1;
      if (newMonth < 0) {
        newMonth = 11;
        newYear = year - 1;
      }
    } else {
      newMonth = month + 1;
      if (newMonth > 11) {
        newMonth = 0;
        newYear = year + 1;
      }
    }
    
    // Don't allow future months
    const currentDate = new Date();
    if (newYear > currentDate.getFullYear() || 
        (newYear === currentDate.getFullYear() && newMonth > currentDate.getMonth())) {
      return;
    }
    
    setSelectedMonthYear({ month: newMonth, year: newYear });
  };

  const findLatestJournal = (journals) => {
    if (!journals || journals.length === 0) {
      return;
    }
    
    // Find the most recent journal entry
    const sortedJournals = [...journals].sort((a, b) => {
      // Sort by year and month descending
      const [yearA, monthA] = a.monthYear.split('-');
      const [yearB, monthB] = b.monthYear.split('-');
      
      if (yearB !== yearA) {
        return parseInt(yearB) - parseInt(yearA);
      }
      return parseInt(monthB) - parseInt(monthA);
    });
    
    if (sortedJournals.length > 0) {
      setJournalHighlight(sortedJournals[0]);
    }
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('x-auth-token');
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getMonthName = (monthIndex) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
  };

  const formatMonthYear = (monthYearString) => {
    if (!monthYearString) return '';
    
    const [year, month] = monthYearString.split('-');
    return `${getMonthName(parseInt(month) - 1)} ${year}`;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header with User Info and Logout */}
      <FadeIn>
        <View className="px-4 pt-12 pb-4 bg-[#8B4513]">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold text-white">
                Hello, {userData?.username || 'User'} 👋
              </Text>
              <Text className="text-white/80 mt-1">
                {userData?.email || ''}
              </Text>
            </View>
            <TouchableOpacity 
              className="bg-white/20 p-2 rounded-full" 
              onPress={handleLogout}
            >
              <LogOut size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </FadeIn>
      
      {/* Today's Summary Card */}
      <SlideUp delay={100}>
        <View className="m-4 p-4 bg-white rounded-3xl shadow-md elevation-3 border border-[#8B4513]/10">
          <Text className="text-[#8B4513] text-lg font-bold mb-3">Today's Summary</Text>
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-500">Spent Today</Text>
              <Text className="text-3xl font-bold text-[#8B4513]">
                ₹{todayExpenses.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              className="bg-[#8B4513] p-3 rounded-full"
              onPress={() => navigation.navigate('Create')}
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SlideUp>
      
      {/* Quick Actions */}
      <SlideUp delay={200}>
        <View className="mx-4 mb-6">
          <Text className="text-[#8B4513] text-lg font-bold mb-3">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity 
              className="w-[48%] p-4 bg-[#8B4513]/10 rounded-2xl mb-3 flex-row justify-between items-center"
              onPress={() =>  navigation.navigate('Create')}
            >
              <View>
                <Text className="text-[#8B4513] font-bold">Add Expense</Text>
                <Text className="text-gray-500 text-xs">Log new spending</Text>
              </View>
              <Plus size={20} color="#8B4513" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-[48%] p-4 bg-[#8B4513]/10 rounded-2xl mb-3 flex-row justify-between items-center"
              onPress={() => navigation.navigate('Journal')}        >
              <View>
                <Text className="text-[#8B4513] font-bold">Journal</Text>
                <Text className="text-gray-500 text-xs">Monthly reflection</Text>
              </View>
              <BookOpen size={20} color="#8B4513" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-[48%] p-4 bg-[#8B4513]/10 rounded-2xl mb-3 flex-row justify-between items-center"
              onPress={() => navigation.navigate('Expenses')}
            >
              <View>
                <Text className="text-[#8B4513] font-bold">Expenses</Text>
                <Text className="text-gray-500 text-xs">View all expenses</Text>
              </View>
              <Clipboard size={20} color="#8B4513" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-[48%] p-4 bg-[#8B4513]/10 rounded-2xl mb-3 flex-row justify-between items-center"
              onPress={() => navigation.navigate('Insights')}
            >
              <View>
                <Text className="text-[#8B4513] font-bold">Insights</Text>
                <Text className="text-gray-500 text-xs">Spending analysis</Text>
              </View>
              <BarChart2 size={20} color="#8B4513" />
            </TouchableOpacity>
          </View>
        </View>
      </SlideUp>
      
      {/* Monthly Expenses Chart */}
      <SlideUp delay={300}>
        <View className="mx-4 mb-6 p-4 bg-white rounded-3xl shadow-md elevation-3 border border-[#8B4513]/10">
          {/* Month Navigation */}
          <View className="flex-row justify-between items-center mb-3">
            <TouchableOpacity 
              onPress={() => changeMonth('prev')}
              className="p-1 bg-[#8B4513]/10 rounded"
            >
              <Text className="text-[#8B4513] px-2">◀</Text>
            </TouchableOpacity>
            
            <Text className="text-[#8B4513] text-lg font-bold">
              {getMonthName(selectedMonthYear.month)} {selectedMonthYear.year}
            </Text>
            
            <TouchableOpacity 
              onPress={() => changeMonth('next')}
              className="p-1 bg-[#8B4513]/10 rounded"
            >
              <Text className="text-[#8B4513] px-2">▶</Text>
            </TouchableOpacity>
          </View>
          
          {/* Daily Expenses Line Chart */}
          {monthlyExpensesData.data.some(amount => amount > 0) ? (
            <LineChart
              data={{
                labels: monthlyExpensesData.labels,
                datasets: [
                  {
                    data: monthlyExpensesData.data,
                    color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
                    strokeWidth: 2
                  }
                ]
              }}
              width={screenWidth - 48}
              height={180}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '1',
                  strokeWidth: '1',
                  stroke: '#8B4513'
                }
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              bezier
            />
          ) : (
            <View className="h-[180px] justify-center items-center">
              <Text className="text-gray-400">No expenses recorded this month</Text>
            </View>
          )}
          
          {/* Category Breakdown Section */}
          {categoryBreakdown.length > 0 && (
            <View className="mt-4 pt-4 border-t border-gray-200">
              <Text className="text-[#8B4513] font-bold mb-3">Category Breakdown</Text>
              
              {/* Pie Chart */}
              <View className="flex-row justify-center mb-2">
                <PieChart
                  data={categoryBreakdown}
                  width={screenWidth * 0.7}
                  height={140}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  hasLegend={false}
                  center={[screenWidth * 0.15, 0]}
                  absolute={false}
                />
              </View>
              
              {/* Custom Legend */}
              <View className="mt-2">
                {categoryBreakdown.map((category, index) => (
                  <View key={index} className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                      <View 
                        style={{ backgroundColor: category.color }} 
                        className="w-3 h-3 rounded-full mr-2"
                      />
                      <Text className="text-gray-700 flex-1" numberOfLines={1} ellipsizeMode="tail">
                        {category.name}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-700 mr-2">
                        ₹{category.amount.toFixed(0)}
                      </Text>
                      <Text className="text-[#8B4513] font-bold w-12 text-right">
                        {category.percentage}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </SlideUp>

      {/* Recent Expenses */}
      <SlideUp delay={400}>
        <View className="mx-4 mb-6 p-4 bg-white rounded-3xl shadow-md elevation-3 border border-[#8B4513]/10">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-[#8B4513] text-lg font-bold">Recent Expenses</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Expenses')}
              className="flex-row items-center"
            >
              <Text className="text-[#8B4513] mr-1">View all</Text>
              <ArrowRight size={16} color="#8B4513" />
            </TouchableOpacity>
          </View>
          
          {recentExpenses.length > 0 ? (
            <View>
              {recentExpenses.map((expense, index) => (
                <View key={expense._id} className={`py-3 ${index !== recentExpenses.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="bg-[#8B4513]/10 px-3 py-1 rounded-full mr-2">
                        <Text className="text-[#8B4513] font-medium">{expense.category}</Text>
                      </View>
                      <Text className="text-gray-600">{expense.reason.substring(0, 15)}{expense.reason.length > 15 ? '...' : ''}</Text>
                    </View>
                    <Text className="font-bold text-[#8B4513]">₹{expense.amount.toFixed(2)}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs mt-1">
                    {new Date(expense.date).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-6 justify-center items-center">
              <Text className="text-gray-400">No recent expenses</Text>
            </View>
          )}
        </View>
      </SlideUp>
      
      {/* Journal Highlight */}
      <SlideUp delay={450}>
        <View className="mx-4 mb-8 p-4 bg-white rounded-3xl shadow-md elevation-3 border border-[#8B4513]/10">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-[#8B4513] text-lg font-bold">Monthly Journal</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Journal')}
              className="flex-row items-center"
            >
              <Text className="text-[#8B4513] mr-1">View all</Text>
              <ArrowRight size={16} color="#8B4513" />
            </TouchableOpacity>
          </View>
          
          {journalHighlight ? (
            <View className="mt-2">
              <Text className="text-gray-500 text-sm mb-2">
                {formatMonthYear(journalHighlight.monthYear)}
              </Text>
              <Text className="text-gray-800 font-medium mb-3">
                {journalHighlight.monthHighlight}
              </Text>
              <View className="flex-row space-x-2">
                <View className="bg-[#8B4513]/10 px-3 py-1 rounded-full">
                  <Text className="text-[#8B4513]">
                    Mood: {journalHighlight.mood.rating}/10
                  </Text>
                </View>
                <View className="bg-[#8B4513]/10 px-3 py-1 rounded-full">
                  <Text className="text-[#8B4513]">
                    Productivity: {journalHighlight.productivity.rating}/10
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="py-6 justify-center items-center">
              <Text className="text-gray-400 mb-2">No journal entries yet</Text>
              <TouchableOpacity
                className="bg-[#8B4513]/10 px-4 py-2 rounded-full"
                onPress={() => router.push('/pi/PiNavigationScreens/Journal')}
              >
                <Text className="text-[#8B4513] font-bold">Create Journal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SlideUp>
    </ScrollView>
  );
};

export default Dashboard;