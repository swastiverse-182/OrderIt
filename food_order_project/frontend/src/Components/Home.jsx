import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  sortByRatings,
  sortByReviews,
  toggleVegOnly,
} from "../redux/slices/restaurantSlice";

import { createRestaurant, getRestaurants } from "../redux/actions/restaurantAction";
import Restaurant from "../Components/Restaurant";
import Loader from "../Components/layout/Loader";
import Message from "../Components/Message";
import CountRestaurant from "./CountRestaurant";

const Home = () => {
  const dispatch = useDispatch();
  const { keyword } = useParams();

  const {
    loading: restaurantsLoading,
    error: restaurantsError,
    restaurants,
    showVegOnly,
    creating,
    createError,
  } = useSelector((state) => state.restaurants);

  const { isAuthenticated, user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getRestaurants(keyword));
  }, [dispatch, keyword]);

  // FIX: Show toast when restaurants fetch fails
  useEffect(() => {
    if (restaurantsError) toast.error(restaurantsError);
  }, [restaurantsError]);

  const handleSortByRatings = () => dispatch(sortByRatings());
  const handleSortByReviews = () => dispatch(sortByReviews());
  const handleToggleVegOnly = () => dispatch(toggleVegOnly());

  // --- ADMIN CONTROLS ---
  const emptyRestaurant = {
    name: "",
    address: "",
    isVeg: false,
    location: { type: "Point", coordinates: [] },
    imageUrl: "",
  };

  const [showCreate, setShowCreate] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState(emptyRestaurant);
  const [coordsInput, setCoordsInput] = useState("");

  const handleOpenCreate = () => {
    setCoordsInput(newRestaurant.location.coordinates.join(","));
    setShowCreate(true);
  };

  // FIX: Reset form state on close
  const handleCloseCreate = () => {
    setShowCreate(false);
    setCoordsInput("");
    setNewRestaurant(emptyRestaurant);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "isVeg") {
      setNewRestaurant({ ...newRestaurant, isVeg: checked });
    } else if (name === "coordinates") {
      setCoordsInput(value);
      const parts = value.split(",").map((v) => v.trim()).filter((v) => v !== "");
      const coords = parts.map((v) => parseFloat(v)).filter((n) => !isNaN(n));
      setNewRestaurant({
        ...newRestaurant,
        location: { ...newRestaurant.location, coordinates: coords },
      });
    } else if (name === "imageUrl") {
      setNewRestaurant({ ...newRestaurant, imageUrl: value });
    } else {
      setNewRestaurant({ ...newRestaurant, [name]: value });
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();

    // FIX: Validate coordinates before submitting
    if (newRestaurant.location.coordinates.length !== 2) {
      toast.error("Please enter valid coordinates (lat, lng)");
      return;
    }

    const payload = {
      name: newRestaurant.name,
      address: newRestaurant.address,
      isVeg: newRestaurant.isVeg,
      location: newRestaurant.location,
      images: [{ public_id: "default", url: newRestaurant.imageUrl }],
    };

    const result = await dispatch(createRestaurant(payload));

    // FIX: Safe check on result.meta to avoid crash on rejection
    if (result?.meta?.requestStatus === "fulfilled") {
      handleCloseCreate();
    }
  };

  return (
    <>
      <CountRestaurant />
      {restaurantsLoading ? (
        <Loader />
      ) : (
        <>
          <section>
            <div className="sort">
              <button className="sort_veg p-3" onClick={handleToggleVegOnly}>
                {showVegOnly ? "Show All" : "Pure Veg"}
              </button>
              <button className="sort_rev p-3" onClick={handleSortByReviews}>
                Sort By Reviews
              </button>
              <button className="sort_rate p-3" onClick={handleSortByRatings}>
                Sort By Ratings
              </button>
            </div>

            {/* Display Error Message if fetching fails */}
            {restaurantsError && <Message variant="danger">{restaurantsError}</Message>}

            <div className="row mt-4">
              {restaurants && restaurants.length > 0 ? (
                restaurants.map((restaurant) =>
                  !showVegOnly || restaurant.isVeg ? (
                    <Restaurant key={restaurant._id} restaurant={restaurant} />
                  ) : null
                )
              ) : (
                <Message variant="info"> No restaurants Found. </Message>
              )}

              {/* Admin "Add Restaurant" Card */}
              {isAuthenticated && user?.role === "admin" && (
                <div className="col-sm-12 col-md-6 col-lg-3 my-3">
                  <div
                    className="card p-3 rounded text-center d-flex align-items-center justify-content-center admin-add-card"
                    style={{ cursor: "pointer", border: "2px dashed #ccc", minHeight: "250px" }}
                    onClick={handleOpenCreate}
                  >
                    <h1 className="m-0" style={{ fontSize: "3rem" }}>+</h1>
                    <p className="mb-0">Add Restaurant</p>
                  </div>
                </div>
              )}
            </div>

            {/* Create Form Modal */}
            {showCreate && (
              <>
                {/* FIX: Backdrop to close modal on outside click */}
                <div
                  className="modal-backdrop"
                  style={{
                    position: "fixed", top: 0, left: 0,
                    width: "100%", height: "100%",
                    background: "rgba(0,0,0,0.5)", zIndex: 999
                  }}
                  onClick={handleCloseCreate}
                />
                <div className="create-modal shadow-lg" style={{ zIndex: 1000 }}>
                  <div className="create-content">
                    <h3 className="mb-4">Create Restaurant</h3>
                    <form onSubmit={submitCreate}>
                      {createError && <Message variant="danger">{createError}</Message>}

                      <div className="form-group mb-2">
                        <label>Name</label>
                        <input type="text" name="name" className="form-control" value={newRestaurant.name} onChange={handleChange} required />
                      </div>

                      <div className="form-group mb-2">
                        <label>Address</label>
                        <input type="text" name="address" className="form-control" value={newRestaurant.address} onChange={handleChange} required />
                      </div>

                      <div className="form-group mb-2 d-flex align-items-center">
                        <input type="checkbox" name="isVeg" className="mr-2" checked={newRestaurant.isVeg} onChange={handleChange} />
                        <label className="mb-0">Pure Veg</label>
                      </div>

                      <div className="form-group mb-2">
                        <label>Coordinates (lat, lng)</label>
                        <input type="text" name="coordinates" className="form-control" value={coordsInput} onChange={handleChange} placeholder="e.g. 22.57, 88.36" required />
                      </div>

                      <div className="form-group mb-4">
                        <label>Image URL</label>
                        <input type="text" name="imageUrl" className="form-control" value={newRestaurant.imageUrl} onChange={handleChange} placeholder="https://..." required />
                      </div>

                      <div className="d-flex justify-content-end">
                        <button className="btn btn-secondary mr-2" type="button" onClick={handleCloseCreate}>Cancel</button>
                        <button className="btn btn-primary" type="submit" disabled={creating}>
                          {creating ? "Creating..." : "Create"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </>
  );
};

export default Home;