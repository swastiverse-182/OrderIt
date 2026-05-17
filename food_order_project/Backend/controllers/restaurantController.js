const mongoose = require("mongoose");
const Restaurant = require("../models/restaurant");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

// Get all restaurants
exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  // FIX: Added filter() and pagination() to APIFeatures chain
  const apiFeatures = new APIFeatures(Restaurant.find(), req.query)
    .search()
    .filter()
    .sort()
    .pagination(10);

  const restaurants = await apiFeatures.query;
  const totalCount = await Restaurant.countDocuments();

  res.status(200).json({
    success: true,
    count: totalCount,
    results: restaurants.length,
    restaurants,
  });
});


// Create restaurant
exports.createRestaurant = catchAsync(async (req, res, next) => {
  // FIX: Validate required fields
  if (!req.body.name || !req.body.address) {
    return next(new ErrorHandler("Name and address are required", 400));
  }

  const restaurant = await Restaurant.create(req.body);

  res.status(201).json({
    success: true,
    data: restaurant,
  });
});


// Get restaurant by ID
exports.getRestaurant = catchAsync(async (req, res, next) => {
  // FIX: Validate storeId format
  if (!mongoose.Types.ObjectId.isValid(req.params.storeId)) {
    return next(new ErrorHandler("Invalid restaurant ID", 400));
  }

  const restaurant = await Restaurant.findById(req.params.storeId);

  if (!restaurant) {
    return next(new ErrorHandler("No restaurant found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: restaurant,
  });
});


// Update restaurant
exports.updateRestaurant = catchAsync(async (req, res, next) => {
  // FIX: Validate storeId format
  if (!mongoose.Types.ObjectId.isValid(req.params.storeId)) {
    return next(new ErrorHandler("Invalid restaurant ID", 400));
  }

  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.storeId,
    req.body,
    { new: true, runValidators: true }
  );

  if (!restaurant) {
    return next(new ErrorHandler("No restaurant found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: restaurant,
  });
});


// Delete restaurant
exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  // FIX: Validate storeId format
  if (!mongoose.Types.ObjectId.isValid(req.params.storeId)) {
    return next(new ErrorHandler("Invalid restaurant ID", 400));
  }

  const restaurant = await Restaurant.findByIdAndDelete(req.params.storeId);

  if (!restaurant) {
    return next(new ErrorHandler("No restaurant found with that ID", 404));
  }

  res.status(204).json({
    success: true,
  });
});