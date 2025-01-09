import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import useSelector from react-redux
import PageWrapper from './loading/PageWrapper';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './pages/Dashborad';
import Main from './components/addentry/main'; // Import Main (Entries Manager)
import BalanceSheet from './components/balance/BalanceSheet';
import CreateBill from './components/bill/CreateBill';
// PrivateRoute Component
const PrivateRoute = ({ element }) => {
    const token = useSelector((state) => state.auth.token); // Get token from Redux store
    return token ? element : <Navigate to="/login" />;
};

// PublicRoute Component
const PublicRoute = ({ element }) => {
    const token = useSelector((state) => state.auth.token); // Get token from Redux store
    return token ? <Navigate to="/dashboard" /> : element;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirect root path to login */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route
                    path="/login"
                    element={<PublicRoute element={<PageWrapper><Login /></PageWrapper>} />}
                />
                <Route
                    path="/signup"
                    element={<PublicRoute element={<PageWrapper><Signup /></PageWrapper>} />}
                />
                <Route
                    path="/dashboard"
                    element={<PrivateRoute element={<Dashboard />} />}
                />
              
                <Route
                    path="/entries"
                    element={<PrivateRoute element={<PageWrapper><Main /></PageWrapper>} />}
                />
                <Route
                    path="/balance-sheet"
                    element={<PrivateRoute element={<PageWrapper><BalanceSheet /></PageWrapper>} />}
                />
                <Route path="/create-bill" element={<PageWrapper><CreateBill /></PageWrapper>} />
            </Routes>
        </Router>
    );
}

export default App;


