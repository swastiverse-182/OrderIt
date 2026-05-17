import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Actions
import { loadUser } from './redux/actions/userActions';
import { fetchCartItems } from "./redux/actions/cartActions";

// Components
import Home from './Components/Home';
import Header from './Components/layout/Header';
import Footer from './Components/layout/Footer';
import Menu from "./Components/Menu";
import Login from "./Components/user/Login";
import Register from "./Components/user/Register";
import ForgotPassword from "./Components/user/ForgotPassword";
import NewPassword from "./Components/user/NewPassword";
import Profile from "./Components/user/Profile";
import UpdateProfile from "./Components/user/UpdateProfile";
import Cart from './Components/cart/Cart';
import OrderSuccess from "./Components/cart/OrderSuccess";
import ListOrders from "./Components/order/ListOrders";
import OrderDetails from "./Components/order/OrderDetails";
import Loader from "./Components/layout/Loader";

// Notifications
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

// FIX: Protected route component to guard authenticated-only pages
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.user);
  if (loading) return <Loader />;
  return isAuthenticated ? element : <Navigate to="/users/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      dispatch(fetchCartItems());
    }
  }, [dispatch, loading, isAuthenticated]);

  return (
    <>
      <ToastContainer position="bottom-center" />
      <Router>
        <div className='App'>
          <Header />
          <div className='container container-fluid'>
            <Routes>
              {/* Home & Search */}
              <Route path='/' element={<Home />} />
              <Route path="/eats/stores/search/:keyword" element={<Home />} />
              <Route path="/eats/stores/:id/menus" element={<Menu />} />

              {/* User Routes */}
              <Route path="/users/login" element={<Login />} />
              <Route path="/users/signup" element={<Register />} />
              <Route path="/users/forgetPassword" element={<ForgotPassword />} />
              <Route path="/users/resetPassword/:token" element={<NewPassword />} />
              <Route path="/users/me" element={<ProtectedRoute element={<Profile />} />} />
              <Route path="/users/me/update" element={<ProtectedRoute element={<UpdateProfile />} />} />

              {/* Cart & Order Processing */}
              <Route path="/cart" element={<ProtectedRoute element={<Cart />} />} />
              <Route path="/success" element={<ProtectedRoute element={<OrderSuccess />} />} />
              <Route path="/eats/orders/me/myOrders" element={<ProtectedRoute element={<ListOrders />} />} />
              <Route path="/eats/orders/:id" element={<ProtectedRoute element={<OrderDetails />} />} />

              {/* 404 catch-all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </>
  );
}

export default App;