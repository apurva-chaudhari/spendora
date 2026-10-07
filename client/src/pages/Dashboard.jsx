import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div>
            <h1>Spendora Dashboard</h1>

            <p>Welcome to your spending dashboard.</p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};

export default Dashboard;