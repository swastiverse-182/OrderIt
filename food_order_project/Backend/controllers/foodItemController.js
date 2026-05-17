const mongoose = require("mongoose");
const Fooditem = require("../models/foodItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

// Get all food items
exports.getAllFoodItems = catchAsync(async (req, res, next) => {
  let restaurantFilter = {};
  if (req.params.storeId) {
    restaurantFilter = { restaurant: req.params.storeId };
  }

  // FIX: Use APIFeatures for search, filter, sort and pagination
  const features = new APIFeatures(
    Fooditem.find(restaurantFilter).populate("restaurant"),
    req.query
  )
    .search()
    .filter()
    .sort()
    .pagination(10);

  const foodItems = await features.query;

  res.status(200).json({
    success: true,
    results: foodItems.length,
    data: foodItems,
  });
});


// Create food item
exports.createFoodItem = catchAsync(async (req, res, next) => {
  // FIX: Whitelist allowed fields instead of spreading entire req.body
  const {
    name,
    price,
    description,
    category,
    restaurant,
    spiceLevel,
    imageUrl,
  } = req.body;

  // FIX: Validate restaurant ID is provided
  if (!restaurant) {
    return next(new ErrorHandler("Restaurant ID is required", 400));
  }

  // FIX: Validate restaurant ID format
  if (!mongoose.Types.ObjectId.isValid(restaurant)) {
    return next(new ErrorHandler("Invalid restaurant ID", 400));
  }

  // Handle optional imageUrl input by converting to images array
  let images = [];
  if (imageUrl) {
    images = [{ public_id: "default", url: imageUrl }];
  }

  const fooditem = await Fooditem.create({
    name,
    price,
    description,
    category,
    restaurant,
    spiceLevel,
    images,
  });

  res.status(201).json({
    success: true,
    data: fooditem,
  });
});


// Get single food item
exports.getFoodItem = catchAsync(async (req, res, next) => {
  // FIX: Validate foodId before querying
  if (!mongoose.Types.ObjectId.isValid(req.params.foodId)) {
    return next(new ErrorHandler("Invalid food item ID", 400));
  }

  const foodItem = await Fooditem.findById(req.params.foodId);

  if (!foodItem) {
    return next(new ErrorHandler("No food item found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: foodItem,
  });
});


// Update food item
exports.updateFoodItem = catchAsync(async (req, res, next) => {
  // FIX: Validate foodId before querying
  if (!mongoose.Types.ObjectId.isValid(req.params.foodId)) {
    return next(new ErrorHandler("Invalid food item ID", 400));
  }

  const foodItem = await Fooditem.findByIdAndUpdate(
    req.params.foodId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!foodItem) {
    return next(new ErrorHandler("No food item found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: foodItem,
  });
});


// Delete food item
exports.deleteFoodItem = catchAsync(async (req, res, next) => {
  // FIX: Validate foodId before querying
  if (!mongoose.Types.ObjectId.isValid(req.params.foodId)) {
    return next(new ErrorHandler("Invalid food item ID", 400));
  }

  const foodItem = await Fooditem.findByIdAndDelete(req.params.foodId);

  if (!foodItem) {
    return next(new ErrorHandler("No food item found with that ID", 404));
  }

  res.status(204).json({
    success: true,
  });
});