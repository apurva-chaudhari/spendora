import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import analyticsService from "../services/analyticsService";

const Dashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [summary, setSummary] = useState({
    totalSpending: 0,
    monthlySpending: 0,
    todaySpending: 0,
    recentExpenses: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await analyticsService.getSummary();

        setSummary(data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <header>
        <h1>Spendora</h1>

        <div>
          <span>Welcome, {user?.name || "User"}</span>

          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main>
        <nav>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>

          <button onClick={() => navigate("/expenses")}>Expenses</button>

          <button onClick={() => navigate("/expenses/add")}>Add Expense</button>

          <button onClick={() => navigate("/scan-bill")}>Scan Bill</button>

          <button onClick={() => navigate("/insights")}>AI Insights</button>

          <button onClick={() => navigate("/ask-spendora")}>
            Ask Spendora
          </button>
        </nav>
        <h2>Dashboard</h2>

        <p>Understand your spending. Make better decisions.</p>

        {error && <p>{error}</p>}

        <section>
          <div>
            <h3>Total Spending</h3>

            <p>
              {loading ? "Loading..." : `₹${summary.totalSpending.toFixed(2)}`}
            </p>
          </div>

          <div>
            <h3>This Month</h3>

            <p>
              {loading
                ? "Loading..."
                : `₹${summary.monthlySpending.toFixed(2)}`}
            </p>
          </div>

          <div>
            <h3>Today's Spending</h3>

            <p>
              {loading ? "Loading..." : `₹${summary.todaySpending.toFixed(2)}`}
            </p>
          </div>
        </section>

        <section>
          <h2>Quick Actions</h2>

          <button onClick={() => navigate("/expenses/add")}>Add Expense</button>

          <button onClick={() => navigate("/expenses")}>View Expenses</button>
          <button onClick={() => navigate("/scan-bill")}>Scan Bill</button>
        </section>
        <section>
          <h2>Recent Expenses</h2>

          {loading ? (
            <p>Loading recent expenses...</p>
          ) : summary.recentExpenses.length === 0 ? (
            <p>No expenses yet.</p>
          ) : (
            <div>
              {summary.recentExpenses.map((expense) => (
                <div key={expense._id}>
                  <h3>{expense.title}</h3>

                  <p>₹{expense.amount.toFixed(2)}</p>

                  <p>{expense.category}</p>

                  <p>{new Date(expense.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate("/expenses")}>
            View All Expenses
          </button>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
