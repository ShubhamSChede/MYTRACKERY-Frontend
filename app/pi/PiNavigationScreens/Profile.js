import React, { Component } from 'react';
import { Text, View, ActivityIndicator, ScrollView, Dimensions, TouchableOpacity,Alert  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { styled } from 'nativewind';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { generatePDF } from '../../../components/pdfGenerator'; 
import { CommonActions } from '@react-navigation/native';
import { router } from 'expo-router';

const StyledView = styled(View);
const StyledText = styled(Text);
const screenWidth = Dimensions.get('window').width;

export class Profile extends Component {
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
  
  handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('x-auth-token');
              // Use CommonActions to reset the navigation state
              this.props.navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'HomeScreen' }],
                })
              );
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

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

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#4BC0C0', '#FFCE56', '#36A2EB'
    ];

    const total = yearData.categoryBreakdown.reduce((sum, category) => sum + category.total, 0);

    return yearData.categoryBreakdown.map((category, index) => ({
      name: `${category._id} (${((category.total / total) * 100).toFixed(1)}%)`,
      total: category.total,
      color: colors[index % colors.length],
      legendFontColor: '#9ca3af',
      legendFontSize: 12
    }));
  };

  createPDF = async () => {
    try {
      const result = await generatePDF({
        selectedYear: this.state.selectedYear,
        yearData: this.state.yearData
      });
      if (result) {
        alert('PDF generated successfully!');
      }
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  render() {
    const { data, yearData, loading, error, selectedYear, expandedExpenseIds } = this.state;

    if (loading) {
      return (
        <StyledView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </StyledView>
      );
    }

 // Show header with logout even when there's no data
 const headerSection = (
  <StyledView className="flex-row justify-between items-center mb-6">
    <StyledView>
      <StyledText className="text-2xl font-bold text-white">
        Welcome, {data?.user?.username || 'User'} 👋🏻
      </StyledText>
      <StyledText className="text-gray-400 mt-1">
        {data?.user?.email || ''}
      </StyledText>
    </StyledView>
    <TouchableOpacity 
      className="bg-red-500/20 px-4 py-2 rounded-lg" 
      onPress={this.handleLogout}
    >
      <StyledText className="text-red-500">Logout</StyledText>
    </TouchableOpacity>
  </StyledView>
);

// If there's an error or no data, show a simplified view
if (error || !data) {
  return (
    <ScrollView className="p-4 bg-black">
      {headerSection}
      <StyledView className="flex-1 justify-center items-center mt-10">
        <StyledText className="text-gray-400 text-lg">No data available</StyledText>
      </StyledView>
    </ScrollView>
  );
}
    const monthlyExpenses = this.getMonthlyExpensesForYear();
    const yearlyExpenses = this.getYearlyExpenses();
    const pieChartData = this.getPieChartData();

    return (
      <ScrollView className="p-4 bg-black">
        {/* Header Section */}
        {headerSection}

        {/* Export PDF Button */}
        <TouchableOpacity 
          className="bg-gray-800 p-3 rounded-lg mb-4 flex-row items-center justify-center border border-gray-700"
          onPress={this.createPDF}
        >
          <StyledText className="text-white text-center">📄 Export as PDF</StyledText>
        </TouchableOpacity>

        {/* Year Picker */}
        <StyledView className="bg-gray-900 rounded-lg mb-4 border border-gray-800">
          <Picker
            selectedValue={selectedYear}
            onValueChange={this.handleYearChange}
            dropdownIconColor="white"
            className="text-white"
          >
            {data.monthlyExpensesByYear.map((yearData) => (
              <Picker.Item 
                key={yearData._id} 
                label={`${yearData._id}`} 
                value={yearData._id}
                style={{ backgroundColor: "#1f2937", color: "white" }}
              />
            ))}
          </Picker>
        </StyledView>

        {/* Year Statistics */}
        {yearData && (
          <StyledView className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-800">
            <StyledText className="text-lg font-semibold mb-4 text-white">
              Year {selectedYear} Statistics
            </StyledText>
            
            <StyledView className="space-y-3">
              <StyledView className="flex-row justify-between items-center">
                <StyledText className="text-gray-400">Total Expenses</StyledText>
                <StyledText className="text-green-400 font-bold">₹{yearData.stats.yearTotal}</StyledText>
              </StyledView>
              
              <StyledView className="flex-row justify-between items-center">
                <StyledText className="text-gray-400">Average Monthly</StyledText>
                <StyledText className="text-blue-400 font-bold">₹{yearData.stats.avgMonthlyExpense}</StyledText>
              </StyledView>
              
              <StyledView className="flex-row justify-between items-center">
                <StyledText className="text-gray-400">Top Category</StyledText>
                <StyledText className="text-purple-400 font-bold">{yearData.stats.topCategory}</StyledText>
              </StyledView>
              
              <StyledView className="flex-row justify-between items-center">
                <StyledText className="text-gray-400">Active Months</StyledText>
                <StyledText className="text-yellow-400 font-bold">{yearData.stats.monthsWithExpenses}</StyledText>
              </StyledView>
            </StyledView>
          </StyledView>
        )}

        {/* Category Breakdown Pie Chart */}
        <StyledText className="text-lg font-bold mb-4 text-white">Category Breakdown</StyledText>
        <StyledView className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-800">
          <PieChart
            data={pieChartData}
            width={screenWidth * 0.9}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: () => '#ffffff',
            }}
            accessor="total"
            backgroundColor="transparent"
            paddingLeft="1"
            absolute
          />
        </StyledView>

     {/* Yearly Expenses Bar Chart */}
     <StyledText className="text-lg font-bold mb-4 text-white">Yearly Expenses</StyledText>
        <StyledView className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-800">
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <BarChart
              data={{
                labels: yearlyExpenses.labels,
                datasets: [{ data: yearlyExpenses.data }],
              }}
              width={Math.max(screenWidth * 0.9, yearlyExpenses.labels.length * 50)}
              height={180}
              fromZero={true}
              chartConfig={{
                backgroundGradientFrom: '#1f2937',
                backgroundGradientTo: '#1f2937',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(129, 140, 248, ${opacity})`,
                labelColor: () => '#9ca3af',
                style: {
                  borderRadius: 16
                },
                propsForLabels: {
                  fontSize: 12,
                },
              }}
              style={{
                marginVertical: 5,
                borderRadius: 15,
              }}
              showBarTops={false}
              withInnerLines={true}
              withVerticalLabels={true}
              barPercentage={0.4}
              yAxisLabel="₹"
            />
          </ScrollView>
        </StyledView>

 {/* Monthly Expenses Circles */}
<StyledView>
  <StyledText className="text-lg font-bold mb-4 text-white">Monthly Expenses</StyledText>
  <StyledView className="bg-gray-900/50 p-4 rounded-2xl mb-4 border border-gray-800">
    <StyledView className="flex-row flex-wrap justify-between gap-2">
      {monthlyExpenses.labels.map((month, index) => {
        // Determine color based on expense amount
        const amount = monthlyExpenses.data[index];
        let bgColor = 'bg-gray-800/50';
        let borderColor = 'border-gray-700/50';
        let textColor = 'text-gray-400';
        
        if (amount > 0) {
          if (amount < 12000) {
            bgColor = 'bg-green-500/20';
            borderColor = 'border-green-500/50';
            textColor = 'text-green-400';
          } else if (amount <= 15000) {
            bgColor = 'bg-yellow-500/20';
            borderColor = 'border-yellow-500/50';
            textColor = 'text-yellow-400';
          } else {
            bgColor = 'bg-red-500/20';
            borderColor = 'border-red-500/50';
            textColor = 'text-red-400';
          }
        }

        return (
          <StyledView 
            key={month} 
            className={`w-[30%] py-3 mb-2 rounded-2xl 
              ${bgColor} justify-center items-center border ${borderColor}`}
          >
            <StyledText className="text-white font-bold text-base">{month}</StyledText>
            {amount > 0 ? (
              <>
                <StyledText className={`${textColor} font-bold text-sm`}>
                  ₹{amount}
                </StyledText>
                <StyledText className="text-gray-400 text-xs">spent</StyledText>
              </>
            ) : (
              <StyledText className="text-gray-500/70 text-xs">No expenses</StyledText>
            )}
          </StyledView>
        )
      })}
    </StyledView>

    {/* Color Legend */}
    <StyledView className="border-t border-gray-800/50">
      <StyledText className="text-white font-bold mt-3 mb-2">Expense Ranges:</StyledText>
      <StyledView className="flex-row items-center mb-1.5">
        <StyledView className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50 mr-2" />
        <StyledText className="text-gray-400">Below ₹12,000 - Good spending</StyledText>
      </StyledView>
      <StyledView className="flex-row items-center mb-1.5">
        <StyledView className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 mr-2" />
        <StyledText className="text-gray-400">₹12,000 - ₹15,000 - Moderate spending</StyledText>
      </StyledView>
      <StyledView className="flex-row items-center">
        <StyledView className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50 mr-2" />
        <StyledText className="text-gray-400">Above ₹15,000 - High spending</StyledText>
      </StyledView>
    </StyledView>
  </StyledView>
</StyledView>


        {/* Monthly Bar Chart */}
        <StyledView className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-800">
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <BarChart
              data={{
                labels: monthlyExpenses.labels,
                datasets: [{ data: monthlyExpenses.data }],
              }}
              width={Math.max(screenWidth * 0.9, monthlyExpenses.labels.length * 40)}
              height={180}
              fromZero={true}
              chartConfig={{
                backgroundGradientFrom: '#1f2937',
                backgroundGradientTo: '#1f2937',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: () => '#9ca3af',
                style: {
                  borderRadius: 16
                },
              }}
              style={{
                marginVertical: 5,
                borderRadius: 15,
              }}
              showBarTops={false}
              withInnerLines={true}
              withVerticalLabels={true}
              barPercentage={0.1}
              yAxisLabel="₹"
            />
          </ScrollView>
        </StyledView>

  {/* Recent Expenses */}
  <StyledText className="text-lg font-bold mb-4 text-white">Recent Expenses</StyledText>
        {data.recentExpenses.map((expense) => (
          <TouchableOpacity
            key={expense._id}
            onPress={() => this.toggleExpand(expense._id)}
            className="bg-gray-900 mb-3 rounded-lg p-4 border border-gray-800"
          >
            <StyledView className="flex-row justify-between items-center">
              <StyledText className="text-green-400 font-bold">₹{expense.amount}</StyledText>
              <StyledText className="text-white">{expense.category}</StyledText>
              <StyledText className="text-gray-400">
                {(() => {
                  const [year, month, day] = expense.date.split('T')[0].split('-');
                  return `${day}-${month}-${year}`;
                })()}
              </StyledText>
            </StyledView>
            {expandedExpenseIds.includes(expense._id) && (
              <StyledText className="text-gray-400 mt-2 p-2 bg-gray-800/50 rounded-lg">
                {expense.reason}
              </StyledText>
            )}
          </TouchableOpacity>
        ))}

        {/* Overall Statistics */}
<StyledText className="text-lg font-bold mt-6 mb-4 text-white">Overall Statistics</StyledText>
<StyledView className="bg-gray-900 rounded-lg p-4 mb-10 border border-gray-800">
  <StyledView className="space-y-3">
    <StyledView className="flex-row border-b border-gray-800 pb-2 mb-2">
      <StyledText className="flex-1 font-bold text-white">Metric</StyledText>
      <StyledText className="flex-1 font-bold text-right text-white">Value</StyledText>
    </StyledView>
    <StyledView className="flex-row border-b border-gray-800 py-2">
      <StyledText className="flex-1 text-white">Total Expenses</StyledText>
      <StyledText className="flex-1 text-right text-white">₹{data.stats.totalExpenses}</StyledText>
    </StyledView>
    <StyledView className="flex-row border-b border-gray-800 py-2">
      <StyledText className="flex-1 text-white">Average Monthly Expense</StyledText>
      <StyledText className="flex-1 text-right text-white">₹{data.stats.avgMonthlyExpense}</StyledText>
    </StyledView>
    <StyledView className="flex-row border-b border-gray-800 py-2">
      <StyledText className="flex-1 text-white">Top Category</StyledText>
      <StyledText className="flex-1 text-right text-white">{data.stats.topCategory}</StyledText>
    </StyledView>
    <StyledView className="flex-row py-2">
      <StyledText className="flex-1 text-white">Current Month Total</StyledText>
      <StyledText className="flex-1 text-right text-white">₹{data.stats.currentMonthTotal}</StyledText>
    </StyledView>
  </StyledView>
</StyledView>

      </ScrollView>
    );
  }
}

export default Profile;