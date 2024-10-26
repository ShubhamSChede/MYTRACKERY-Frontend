import React from 'react';
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export const generatePDF = async (data) => {
  try {
    // Create HTML content with all statistics
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { 
              font-family: 'Helvetica', sans-serif; 
              padding: 20px;
              color: #333;
            }
            .header { 
              text-align: center; 
              color: #2F4F4F; 
              margin-bottom: 30px;
              padding: 20px;
              background-color: #f5f5f5;
              border-radius: 8px;
            }
            .section { 
              margin-bottom: 30px;
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .section h2 {
              color: #2F4F4F;
              border-bottom: 2px solid #4CAF50;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .stats-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
              background: white;
            }
            .stats-table th, .stats-table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            .stats-table th { 
              background-color: #f5f5f5;
              color: #2F4F4F;
            }
            .highlight { 
              color: #4CAF50; 
              font-weight: bold; 
            }
            .expense-card {
              border: 1px solid #ddd;
              padding: 10px;
              margin-bottom: 10px;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Comprehensive Expense Report</h1>
            <p>Year: ${data.selectedYear}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>

          <!-- Year Statistics -->
          <div class="section">
            <h2>Year ${data.selectedYear} Statistics</h2>
            <table class="stats-table">
              <tr>
                <th>Total Expenses</th>
                <td>₹${data.yearData?.stats?.yearTotal || 0}</td>
              </tr>
              <tr>
                <th>Average Monthly</th>
                <td>₹${data.yearData?.stats?.avgMonthlyExpense || 0}</td>
              </tr>
              <tr>
                <th>Top Category</th>
                <td>${data.yearData?.stats?.topCategory || 'N/A'}</td>
              </tr>
              <tr>
                <th>Active Months</th>
                <td>${data.yearData?.stats?.monthsWithExpenses || 0}</td>
              </tr>
            </table>
          </div>

          <!-- Yearly Expenses -->
          <div class="section">
            <h2>Yearly Expenses Overview</h2>
            <table class="stats-table">
              <tr>
                <th>Year</th>
                <th>Total Amount</th>
              </tr>
              ${data.yearlyExpenses?.map(yearExpense => `
                <tr>
                  <td>${yearExpense._id}</td>
                  <td>₹${yearExpense.total}</td>
                </tr>
              `).join('') || '<tr><td colspan="2">No data available</td></tr>'}
            </table>
          </div>

          <!-- Category Breakdown -->
          <div class="section">
            <h2>Category Breakdown for ${data.selectedYear}</h2>
            <table class="stats-table">
              <tr>
                <th>Category</th>
                <th>Amount</th>
              </tr>
              ${data.yearData?.categoryBreakdown?.map(category => `
                <tr>
                  <td>${category._id}</td>
                  <td>₹${category.total}</td>
                </tr>
              `).join('') || '<tr><td colspan="2">No data available</td></tr>'}
            </table>
          </div>

          <!-- Monthly Expenses -->
          <div class="section">
            <h2>Monthly Expenses for ${data.selectedYear}</h2>
            <table class="stats-table">
              <tr>
                <th>Month</th>
                <th>Amount</th>
              </tr>
              ${data.yearData?.monthlyExpenses?.map(expense => `
                <tr>
                  <td>${getMonthName(expense.month)}</td>
                  <td>₹${expense.total}</td>
                </tr>
              `).join('') || '<tr><td colspan="2">No data available</td></tr>'}
            </table>
          </div>

          <!-- Recent Expenses -->
          <div class="section">
            <h2>Recent Expenses</h2>
            ${data.recentExpenses?.map(expense => `
              <div class="expense-card">
                <p><strong>Amount:</strong> ₹${expense.amount}</p>
                <p><strong>Category:</strong> ${expense.category}</p>
                <p><strong>Date:</strong> ${new Date(expense.date).toLocaleDateString()}</p>
                <p><strong>Reason:</strong> ${expense.reason}</p>
              </div>
            `).join('') || '<p>No recent expenses available</p>'}
          </div>

          <!-- Overall Statistics -->
          <div class="section">
            <h2>Overall Statistics</h2>
            <table class="stats-table">
              <tr>
                <th>Total Expenses</th>
                <td>₹${data.overallStats?.totalExpenses || 0}</td>
              </tr>
              <tr>
                <th>Average Monthly Expense</th>
                <td>₹${data.overallStats?.avgMonthlyExpense || 0}</td>
              </tr>
              <tr>
                <th>Top Category</th>
                <td>${data.overallStats?.topCategory || 'N/A'}</td>
              </tr>
              <tr>
                <th>Current Month Total</th>
                <td>₹${data.overallStats?.currentMonthTotal || 0}</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;

    // Generate PDF file
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false
    });

    // On iOS, use sharing
    if (Platform.OS === 'ios') {
      await Sharing.shareAsync(uri);
    } else {
      // On Android, save to downloads
      const downloadDir = FileSystem.documentDirectory + 'ExpenseReport.pdf';
      await FileSystem.moveAsync({
        from: uri,
        to: downloadDir
      });
      await Sharing.shareAsync(downloadDir);
    }

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Helper function to convert month number to name
const getMonthName = (monthNum) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNum - 1] || '';
};