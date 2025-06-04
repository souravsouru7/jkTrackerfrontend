import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import PageWrapper from './loading/PageWrapper';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './pages/Dashborad';
import Main from './components/addentry/main';
import BalanceSheet from './components/balance/BalanceSheet';
import CreateBill from './components/bill/CreateBill';
import EditBill from './components/bill/EditBill';
import BillsList from './components/bill/BillsList';
import { Toaster } from 'react-hot-toast';


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
        <>
            <Helmet>
                <title>JK Tracker - Interior Project Management</title>
                <meta name="description" content="JK Tracker - Professional interior project management and expense tracking solution" />
                <meta name="keywords" content="interior design, project management, expense tracking, interior billing" />
                <meta property="og:title" content="JK Tracker - Interior Project Management" />
                <meta property="og:description" content="Professional interior project management and expense tracking solution" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.jktracker.site" />
                <link rel="canonical" href="https://www.jktracker.site" />
            </Helmet>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#FDF8F3',
                        color: '#7F5539',
                        border: '1px solid rgba(176, 137, 104, 0.2)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#7F5539',
                            secondary: '#FDF8F3',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#FDF8F3',
                        },
                    },
                }}
            />
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
        </>
    );
}

export default App;
