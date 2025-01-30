import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageWrapper from './loading/PageWrapper';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './pages/Dashborad';
import Main from './components/addentry/main';
import BalanceSheet from './components/balance/BalanceSheet';
import CreateBill from './components/bill/CreateBill';
import EditBill from './components/bill/EditBill';
import BillsList from './components/bill/BillsList';


// PrivateRoute Component
const PrivateRoute = ({ element }) => {
    const token = useSelector((state) => state.auth.token);
    return token ? (
        <PageWrapper>
            {element}
        </PageWrapper>
    ) : <Navigate to="/login" />;
};

// PublicRoute Component
const PublicRoute = ({ element }) => {
    const token = useSelector((state) => state.auth.token);
    return token ? <Navigate to="/dashboard" /> : (
        <PageWrapper>
            {element}
        </PageWrapper>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirect root path to login */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route
                    path="/login"
                    element={<PublicRoute element={<Login />} />}
                />
                <Route
                    path="/signup"
                    element={<PublicRoute element={<Signup />} />}
                />
                <Route
                    path="/dashboard"
                    element={<PrivateRoute element={<Dashboard />} />}
                />
                <Route
                    path="/entries"
                    element={<PrivateRoute element={<Main />} />}
                />
                <Route
                    path="/balance-sheet"
                    element={<PrivateRoute element={<BalanceSheet />} />}
                />
                <Route 
                    path="/create-bill" 
                    element={<PrivateRoute element={<CreateBill />} />} 
                />
                <Route 
                    path="/edit-bill/:id" 
                    element={<PrivateRoute element={<EditBill />} />} 
                />
                <Route 
                    path="/bills" 
                    element={<PrivateRoute element={<BillsList />} />} 
                />
             
            </Routes>
        </Router>
    );
}

export default App;
