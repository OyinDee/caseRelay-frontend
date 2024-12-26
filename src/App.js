import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import LoginPage from './components/Login';
import NotFoundPage from './components/404';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';
import SignupPage from './components/SignupPage';
import DashboardPage from './components/Dashboard';
import ResetPasswordPage from './components/ResetPassword';
import AdminDashboardPage from './components/AdminDashboard';
import ProtectedAdminRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path='/dashboard' element={<DashboardPage/>}/>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path='/admin-dashboard' element={<AdminDashboardPage/>}/>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;