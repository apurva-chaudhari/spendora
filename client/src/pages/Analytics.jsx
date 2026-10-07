import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import analyticsService from "../services/analyticsService";

const Analytics = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMonthlyData = async () => {
      try {
        setLoading(true);
        setError("");

        const monthlyResult = await analyticsService.getMonthlySpending();
        const categoryResult = await analyticsService.getCategorySpending();

        setMonthlyData(monthlyResult.monthlySpending);
        setCategoryData(categoryResult.categorySpending);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadMonthlyData();
  }, []);

  return (
    <div>
      <h1>Spending Analytics</h1>

      <Link to="/dashboard">Back to Dashboard</Link>

      {loading && <p>Loading analytics...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <div>
          <h2>Monthly Spending</h2>

          {monthlyData.length === 0 ? (
            <p>No spending data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />

                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563EB"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
      <div>
        <h2>Spending by Category</h2>

        {categoryData.length === 0 ? (
          <p>No category spending data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={130}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Pie>

              <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Analytics;
