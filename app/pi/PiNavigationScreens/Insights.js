// app/pi/PiNavigationScreens/Profile.js
import React, { Component } from 'react';
import { Text, View, ActivityIndicator, ScrollView, Dimensions, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { styled } from 'nativewind';
import { Download, BarChart2 } from 'lucide-react-native';
import { generatePDF } from '../../../components/pdfGenerator'; 
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { FadeIn, SlideUp, ScaleIn } from '../../../components/AnimationUtils';

const screenWidth = Dimensions.get('window').width;

export class Insights extends Component {
  state = {
    data: null,
    yearData: null,
    loading: true,
    error: null,
    selectedYear: '',
    expandedExpenseIds: [],
  };

  async componentDidMount() {
    await this.fetchDashboardData();
  }

  fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        this.setState({ error: 'No token found', loading: false });
        return;
      }

      const response = await fetch(
        'https://expensetrackerbackend-j2tz.onrender.com/api/dashboard',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        const defaultYear = data.monthlyExpensesByYear[0]?._id || '';
        this.setState({ data, selectedYear: defaultYear }, () => {
          this.fetchYearData(defaultYear);
        });
      } else {
        this.setState({ error: data.message || 'Failed to load data', loading: false });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      this.setState({ error: 'An error occurred. Please try again.', loading: false });
    }
  };

  fetchYearData = async (year) => {
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      const response = await fetch(
        `https://expensetrackerbackend-j2tz.onrender.com/api/dashboard/year/${year}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        }
      );

      const yearData = await response.json();
      if (response.ok) {
        this.setState({ yearData, loading: false });
      } else {
        this.setState({ error: yearData.message || 'Failed to load year data', loading: false });
      }
    } catch (error) {
      console.error('Error fetching year data:', error);
      this.setState({ error: 'An error occurred while fetching year data.', loading: false });
    }
  };

  toggleExpand = (expenseId) => {
    const { expandedExpenseIds } = this.state;
    if (expandedExpenseIds.includes(expenseId)) {
      this.setState({
        expandedExpenseIds: expandedExpenseIds.filter((id) => id !== expenseId),
      });
    } else {
      this.setState({ expandedExpenseIds: [...expandedExpenseIds, expenseId] });
    }
  };

  handleYearChange = (year) => {
    this.setState({ selectedYear: year, loading: true }, () => {
      this.fetchYearData(year);
    });
  };

  getMonthlyExpensesForYear = () => {
    const { yearData } = this.state;
    if (!yearData?.monthlyExpenses) return { labels: [], data: [] };
  
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create arrays for all months, filling with 0 for months without data
    const filledData = Array(12).fill(0);
    const monthlyExpenses = yearData.monthlyExpenses;
    
    monthlyExpenses.forEach(expense => {
      filledData[expense.month - 1] = expense.total;
    });

    return {
      labels: monthNames,
      data: filledData
    };
  };

  getYearlyExpenses = () => {
    const { data } = this.state;
    if (!data?.yearlyExpenses) return { labels: [], data: [] };

    return {
      labels: data.yearlyExpenses.map((yearExpense) => yearExpense._id),
      data: data.yearlyExpenses.map((yearExpense) => yearExpense.total),
    };
  };

  getPieChartData = () => {
    const { yearData } = this.state;
    if (!yearData?.categoryBreakdown) return [];

    // Enhanced color palette with more variety
    const colors = [
      '#A8DADC', // Powder Blue
      '#457B9D', // Desaturated Blue
      '#F4A261', // Soft Orange
      '#E76F51', // Soft Red
      '#2A9D8F', // Teal
      '#E9C46A', // Pale Yellow
      '#F1FAEE', // Off White
      '#B5838D', // Dusty Pink
      '#81B29A', // Soft Green
      '#A3A1F7', // Light Lavender
      '#FFB4A2', // Light Coral
      '#6D6875', // Muted Purple
    ];    

    const total = yearData.categoryBreakdown.reduce((sum, category) => sum + category.total, 0);

    return yearData.categoryBreakdown.map((category, index) => ({
      // Shorten the name to prevent overflow and use percentage on next line
      name: category._id,
      // Add percentage as a separate value to be used in custom rendering
      percentage: ((category.total / total) * 100).toFixed(1),
      total: category.total,
      color: colors[index % colors.length],
      legendFontColor: '#666666',
      legendFontSize: 12
    }));
  };

  createPDF = async () => {
    try {
      const { data, yearData, selectedYear } = this.state;
      
      // Prepare all necessary data for PDF generation
      const pdfData = {
        selectedYear,
        yearData,
        yearlyExpenses: data.yearlyExpenses || [],
        recentExpenses: data.recentExpenses || [],
        overallStats: data.stats || {}
      };
      
      const result = await generatePDF(pdfData);
      if (result) {
        Alert.alert('Success', 'PDF generated successfully!');
      }
    } catch (error) {
      console.error('Error creating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  render() {
    const { data, yearData, loading, error, selectedYear, expandedExpenseIds } = this.state;

    if (loading) {
      return (
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      );
    }

    // Show simplified view if there's an error or no data
    if (error || !data) {
      return (
        <SafeAreaView className="flex-1 bg-white">
          <FadeIn>
            <View className="px-4 py-4 border-b border-gray-200">
              <Text className="text-2xl font-bold text-[#8B4513]">Insights</Text>
            </View>
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-gray-500 text-lg mb-4">No data available</Text>
              <TouchableOpacity
                className="bg-white border border-[#8B4513] rounded-xl py-3 px-4 flex-row justify-center items-center"
                onPress={this.fetchDashboardData}
              >
                <Text className="text-[#8B4513] font-bold">Refresh</Text>
              </TouchableOpacity>
            </View>
          </FadeIn>
        </SafeAreaView>
      );
    }

    const monthlyExpenses = this.getMonthlyExpensesForYear();
    const yearlyExpenses = this.getYearlyExpenses();
    const pieChartData = this.getPieChartData();

    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <FadeIn duration={600}>
          <View className="px-4 py-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-[#8B4513]">Spending Insights</Text>
          </View>
        </FadeIn>

        <ScrollView className="flex-1 p-4">
          {/* Export PDF Button */}
          <FadeIn delay={100} duration={600}>
            <TouchableOpacity
              className="bg-white border border-[#8B4513] rounded-xl py-3 px-4 mb-4 flex-row justify-center items-center"
              onPress={this.createPDF}
            >
              <Download size={18} color="#8B4513" />
              <Text className="text-[#8B4513] font-bold ml-2">Export as PDF</Text>
            </TouchableOpacity>
          </FadeIn>

          {/* Year Picker */}
          <SlideUp delay={200} distance={30}>
            <Card title="Select Year" className="mb-4">
              <View className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={this.handleYearChange}
                  dropdownIconColor="#8B4513"
                >
                  {data.monthlyExpensesByYear.map((yearData) => (
                    <Picker.Item 
                      key={yearData._id} 
                      label={`${yearData._id}`} 
                      value={yearData._id}
                      color="#8B4513"
                    />
                  ))}
                </Picker>
              </View>
            </Card>
          </SlideUp>

          {/* Year Statistics */}
          {yearData && (
            <SlideUp delay={300} distance={30}>
              <Card title={`Year ${selectedYear} Statistics`} className="mb-6">
                <View className="space-y-3">
                  <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                    <Text className="text-gray-700">Total Expenses</Text>
                    <Text className="text-xl font-bold text-[#8B4513]">₹{yearData.stats.yearTotal}</Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                    <Text className="text-gray-700">Average Monthly</Text>
                    <Text className="text-lg font-bold text-[#8B4513]">₹{yearData.stats.avgMonthlyExpense}</Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                    <Text className="text-gray-700">Top Category</Text>
                    <View className="bg-[#8B4513]/10 px-3 py-1 rounded-full">
                      <Text className="text-[#8B4513] font-bold">{yearData.stats.topCategory}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center py-2">
                    <Text className="text-gray-700">Active Months</Text>
                    <Text className="text-lg font-bold text-[#8B4513]">{yearData.stats.monthsWithExpenses}</Text>
                  </View>
                </View>
              </Card>
            </SlideUp>
          )}

          {/* Category Breakdown Pie Chart */}
          <ScaleIn delay={400}>
            <Card title="Category Breakdown" className="mb-6">
              <PieChart
                data={pieChartData}
                width={screenWidth * 0.9}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
                  labelColor: () => '#666666',
                }}
                accessor="total"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend={false} // Hide the built-in legend
                center={[screenWidth * 0.22, 0]} // Adjust center position for better layout
              />
              
              {/* Custom Legend to prevent text overflow */}
              <View className="mt-3 px-2">
                {pieChartData.map((item, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <View 
                      style={{ backgroundColor: item.color }} 
                      className="w-3 h-3 rounded-full mr-2"
                    />
                    <View className="flex-1 flex-row justify-between">
                      <Text className="text-gray-700 text-sm" numberOfLines={1} ellipsizeMode="tail">
                        {item.name}
                      </Text>
                      <Text className="text-gray-700 text-sm font-bold">
                        {item.percentage}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </ScaleIn>

          {/* Yearly Expenses Bar Chart */}
          <SlideUp delay={500} distance={30}>
            <Card title="Yearly Expenses" className="mb-6">
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: yearlyExpenses.labels,
                    datasets: [{ data: yearlyExpenses.data }],
                  }}
                  width={Math.max(screenWidth * 0.85, yearlyExpenses.labels.length * 70)}
                  height={200}
                  fromZero={true}
                  chartConfig={{
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
                    labelColor: () => '#666666',
                    style: {
                      borderRadius: 16
                    },
                    propsForLabels: {
                      fontSize: 12,
                    },
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  showBarTops={false}
                  barPercentage={0.5}
                  yAxisLabel="₹"
                />
              </ScrollView>
            </Card>
          </SlideUp>

          {/* Monthly Expenses Circles */}
          <SlideUp delay={600} distance={30}>
            <Card title="Monthly Expenses" className="mb-6">
              <View className="flex-row flex-wrap justify-between mb-4">
                {monthlyExpenses.labels.map((month, index) => {
                  // Determine color based on expense amount
                  const amount = monthlyExpenses.data[index];
                  let bgColor = 'bg-gray-100';
                  let textColor = 'text-gray-400';
                  
                  if (amount > 0) {
                    if (amount < 12000) {
                      bgColor = 'bg-[#8B4513]/10';
                      textColor = 'text-[#8B4513]';
                    } else if (amount <= 15000) {
                      bgColor = 'bg-[#CD853F]/20';
                      textColor = 'text-[#CD853F]';
                    } else {
                      bgColor = 'bg-[#A52A2A]/20';
                      textColor = 'text-[#A52A2A]';
                    }
                  }

                  return (
                    <View 
                      key={month} 
                      className={`w-[30%] py-3 mb-3 rounded-xl ${bgColor} justify-center items-center`}
                    >
                      <Text className="text-gray-700 font-bold text-base">{month}</Text>
                      {amount > 0 ? (
                        <>
                          <Text className={`${textColor} font-bold text-sm mt-1`}>
                            ₹{amount}
                          </Text>
                        </>
                      ) : (
                        <Text className="text-gray-400 text-xs mt-1">No expenses</Text>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Color Legend */}
              <View className="border-t border-gray-200 pt-3">
                <Text className="text-[#8B4513] font-bold mb-2">Expense Ranges:</Text>
                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-[#8B4513]/10 mr-2" />
                    <Text className="text-gray-600">Below ₹12,000 - Good spending</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-[#CD853F]/20 mr-2" />
                    <Text className="text-gray-600">₹12,000 - ₹15,000 - Moderate spending</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-[#A52A2A]/20 mr-2" />
                    <Text className="text-gray-600">Above ₹15,000 - High spending</Text>
                  </View>
                </View>
              </View>
            </Card>
          </SlideUp>

          {/* Monthly Bar Chart */}
          <SlideUp delay={700} distance={30}>
            <Card title="Monthly Breakdown" className="mb-6">
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: monthlyExpenses.labels,
                    datasets: [{ data: monthlyExpenses.data }],
                  }}
                  width={Math.max(screenWidth * 0.85, monthlyExpenses.labels.length * 45)}
                  height={200}
                  fromZero={true}
                  chartConfig={{
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
                    labelColor: () => '#666666',
                    style: {
                      borderRadius: 16
                    },
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  showBarTops={false}
                  barPercentage={0.4}
                  yAxisLabel="₹"
                />
              </ScrollView>
            </Card>
          </SlideUp>

          {/* Overall Statistics */}
          <SlideUp delay={800} distance={30}>
            <Card title="Overall Statistics" className="mb-10">
              <View className="space-y-1">
                <View className="flex-row border-b border-gray-100 py-3">
                  <Text className="flex-1 font-medium text-gray-700">Total Expenses</Text>
                  <Text className="flex-1 text-right font-bold text-[#8B4513]">₹{data.stats.totalExpenses}</Text>
                </View>
                <View className="flex-row border-b border-gray-100 py-3">
                  <Text className="flex-1 font-medium text-gray-700">Average Monthly</Text>
                  <Text className="flex-1 text-right font-bold text-[#8B4513]">₹{data.stats.avgMonthlyExpense}</Text>
                </View>
                <View className="flex-row border-b border-gray-100 py-3">
                  <Text className="flex-1 font-medium text-gray-700">Top Category</Text>
                  <View className="flex-1 items-end">
                    <View className="bg-[#8B4513]/10 px-3 py-1 rounded-full">
                      <Text className="text-[#8B4513] font-bold">{data.stats.topCategory}</Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row py-3">
                  <Text className="flex-1 font-medium text-gray-700">Current Month Total</Text>
                  <Text className="flex-1 text-right font-bold text-[#8B4513]">₹{data.stats.currentMonthTotal}</Text>
                </View>
              </View>
            </Card>
          </SlideUp>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default Insights;