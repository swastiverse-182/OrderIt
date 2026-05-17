import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../../redux/actions/userActions";
import { toast } from "react-toastify";

import Search from "./Search";
import "../../App.css";

const Header = () => {
  const dispatch = useDispatch();

  // Pulling state from Redux
  const { user, loading } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);

  const logoutHandler = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
  };

  return (
    <>
      <nav className="navbar row sticky-top">
        {/* --- Logo Section --- */}
        <div className="col-12 col-md-3">
          <div className="navbar-brand">
            <Link to="/">
              <img src="/images/logo.webp" alt="logo" className="logo" />
            </Link>
          </div>
        </div>

        {/* --- Search Bar Section --- */}
        {/* FIX: Removed <Routes> inside Header, Search handles keyword internally */}
        <div className="col-12 col-md-6 mt-2 mt-md-0">
          <Search />
        </div>

        {/* --- Right Side: Cart & User Profile --- */}
        <div className="col-12 col-md-3 mt-4 mt-md-0 text-center">
          <Link to="/cart" style={{ textDecoration: "none" }}>
            <span className="ml-3" id="cart">
              Cart
            </span>
            <span className="ml-1" id="cart_count">
              {/* FIX: cartItems always exists from Redux initial state */}
              {cartItems.length}
            </span>
          </Link>

          {loading ? (
            <span className="ml-4 text-white">...</span>
          ) : user ? (
            <div className="ml-4 dropdown d-inline">
              {/* FIX: Use button instead of Link for dropdown toggle since it doesn't navigate */}
              <button
                className="btn dropdown-toggle text-white mr-4"
                id="dropDownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <figure className="avatar avatar-nav">
                  <img
                    src={user.avatar?.url || "/images/images.png"}
                    alt={user.name}
                    className="rounded-circle"
                  />
                </figure>
                <span>{user.name}</span>
              </button>

              <div className="dropdown-menu" aria-labelledby="dropDownMenuButton">
                {user.role === "admin" && (
                  <Link className="dropdown-item" to="/">
                    Dashboard
                  </Link>
                )}

                <Link className="dropdown-item" to="/eats/orders/me/myOrders">
                  Orders
                </Link>

                <Link className="dropdown-item" to="/users/me">
                  Profile
                </Link>

                <Link
                  className="dropdown-item text-danger"
                  to="/"
                  onClick={logoutHandler}
                >
                  Logout
                </Link>
              </div>
            </div>
          ) : (
            <Link to="/users/login" className="btn ml-4" id="login_btn">
              Login
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;