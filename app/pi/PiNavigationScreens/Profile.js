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

    return yearData.categoryBreakdown.map((category, index) => ({
      name: category._id,
      total: category.total,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
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

    if (error) {
      return (
        <StyledView className="flex-1 justify-center items-center">
          <StyledText className="text-red-500">{error}</StyledText>
        </StyledView>
      );
    }

    const monthlyExpenses = this.getMonthlyExpensesForYear();
    const yearlyExpenses = this.getYearlyExpenses();
    const pieChartData = this.getPieChartData();

    return (
      <ScrollView className="p-4 bg-white">

<StyledView className="flex-row justify-between items-center">
          <StyledText className="text-xl font-bold">Welcome, {data.user.username} 👋🏻</StyledText>
          <TouchableOpacity className="bg-black p-2 rounded-md" onPress={this.createPDF}>
            <StyledText className="text-white text-md">📄 Export as PDF</StyledText>
          </TouchableOpacity>
        </StyledView>
        <StyledView className="flex-row justify-between items-center">
          <StyledText className="text-md font-bold mt-2 mb-3 shadow-black">
            Email: {data.user.email}
          </StyledText>
          <TouchableOpacity 
            className="bg-red-500 p-2 rounded-md" 
            onPress={this.handleLogout}
          >
            <StyledText className="text-white text-md">Logout</StyledText>
          </TouchableOpacity>
        </StyledView>

        {/* Year Picker */}
        <Picker
          selectedValue={selectedYear}
          onValueChange={this.handleYearChange}
          className="bg-gray-200 mb-4"
        >
          {data.monthlyExpensesByYear.map((yearData) => (
            <Picker.Item key={yearData._id} label={`${yearData._id}`} value={yearData._id} />
          ))}
        </Picker>

        {/* Year Statistics */}
{yearData && (
  <StyledView className="bg-emerald-200 shadow-md shadow-black rounded-lg p-4 mb-4">
    <StyledText className="text-lg font-semibold mb-2">Year {selectedYear} Statistics</StyledText>
    
    {/* Table Header */}
    <StyledView className="flex-row border-b border-gray-400 pb-2 mb-2">
      <StyledText className="flex-1 font-bold">Metric</StyledText>
      <StyledText className="flex-1 font-bold text-right">Value</StyledText>
    </StyledView>

    {/* Table Rows */}
    <StyledView className="flex-row border-b border-gray-300 py-2">
      <StyledText className="flex-1">Total Expenses</StyledText>
      <StyledText className="flex-1 text-right">₹{yearData.stats.yearTotal}</StyledText>
    </StyledView>
    <StyledView className="flex-row border-b border-gray-300 py-2">
      <StyledText className="flex-1">Average Monthly</StyledText>
      <StyledText className="flex-1 text-right">₹{yearData.stats.avgMonthlyExpense}</StyledText>
    </StyledView>
    <StyledView className="flex-row border-b border-gray-300 py-2">
      <StyledText className="flex-1">Top Category</StyledText>
      <StyledText className="flex-1 text-right">{yearData.stats.topCategory}</StyledText>
    </StyledView>
    <StyledView className="flex-row py-2">
      <StyledText className="flex-1">Active Months</StyledText>
      <StyledText className="flex-1 text-right">{yearData.stats.monthsWithExpenses}</StyledText>
    </StyledView>
  </StyledView>
)}


        {/* Monthly Expenses Bar Chart */}
        <StyledText className="pl-2 text-lg font-semibold mb-2 bg-emerald-200 rounded-xl shadow-md shadow-black">
          Monthly Expenses for {selectedYear}
        </StyledText>
        <BarChart
          data={{
            labels: monthlyExpenses.labels,
            datasets: [{ data: monthlyExpenses.data }],
          }}
          width={screenWidth * 0.9}
          height={180}
          fromZero={true}
          chartConfig={{
            backgroundGradientFrom: '#f1f1f1',
            backgroundGradientTo: '#f1f1f1',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
          }}
          style={{
            marginVertical: 5,
            borderRadius: 15,
          }}
          showBarTops={false}
          withInnerLines={true}
          withVerticalLabels={true}
          barPercentage={0.1}
        />

        {/* Yearly Expenses Bar Chart */}
        <StyledText className="pl-2 text-lg font-semibold my-5 bg-emerald-200 rounded-xl shadow-md shadow-black">
          Yearly Expenses
        </StyledText>
        <BarChart
          data={{
            labels: yearlyExpenses.labels,
            datasets: [{ data: yearlyExpenses.data }],
          }}
          width={screenWidth - 40}
          height={220}
          fromZero
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#f1f1f1',
            backgroundGradientTo: '#f1f1f1',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
          }}
          style={{ borderRadius: 10, marginBottom: 16 }}
        />

        {/* Category Breakdown Pie Chart */}
        {pieChartData.length > 0 && (
          <>
            <StyledText className="pl-2 text-lg font-semibold my-5 bg-emerald-200 rounded-xl shadow-md shadow-black">
              Category Breakdown for {selectedYear}
            </StyledText>
            <PieChart
              data={pieChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="total"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </>
        )}

        {/* Recent Expenses */}
        <StyledText className="text-lg font-semibold mb-2">Recent Expenses</StyledText>
        {data.recentExpenses.map((expense) => (
          <TouchableOpacity
            key={expense._id}
            onPress={() => this.toggleExpand(expense._id)}
            className="bg-emerald-200 mb-2 rounded-lg p-3 shadow-md shadow-black"
          >
            <StyledView className="flex-row justify-between">
              <StyledText className="font-semibold">{`Amount: ₹${expense.amount}`}</StyledText>
              <StyledText>{expense.category}</StyledText>
              <StyledText>{new Date(expense.date).toLocaleDateString()}</StyledText>
            </StyledView>
            {expandedExpenseIds.includes(expense._id) && (
              <StyledView className="mt-2">
                <StyledText className="text-gray-600">{`Reason: ${expense.reason}`}</StyledText>
              </StyledView>
            )}
          </TouchableOpacity>
        ))}

        {/* Overall Statistics Section */}
<StyledText className="text-lg font-semibold mt-4 mb-2">Overall Statistics</StyledText>
<StyledView className="bg-emerald-200 shadow-md shadow-black rounded-lg p-4 mb-10">
  
  {/* Table Header */}
  <StyledView className="flex-row border-b border-gray-400 pb-2 mb-2">
    <StyledText className="flex-1 font-bold">Metric</StyledText>
    <StyledText className="flex-1 font-bold text-right">Value</StyledText>
  </StyledView>

  {/* Table Rows */}
  <StyledView className="flex-row border-b border-gray-300 py-2">
    <StyledText className="flex-1">Total Expenses</StyledText>
    <StyledText className="flex-1 text-right">₹{data.stats.totalExpenses}</StyledText>
  </StyledView>
  <StyledView className="flex-row border-b border-gray-300 py-2">
    <StyledText className="flex-1">Average Monthly Expense</StyledText>
    <StyledText className="flex-1 text-right">₹{data.stats.avgMonthlyExpense}</StyledText>
  </StyledView>
  <StyledView className="flex-row border-b border-gray-300 py-2">
    <StyledText className="flex-1">Top Category</StyledText>
    <StyledText className="flex-1 text-right">{data.stats.topCategory}</StyledText>
  </StyledView>
  <StyledView className="flex-row py-2">
    <StyledText className="flex-1">Current Month Total</StyledText>
    <StyledText className="flex-1 text-right">₹{data.stats.currentMonthTotal}</StyledText>
  </StyledView>
</StyledView>

      </ScrollView>
    );
  }
}

export default Profile;