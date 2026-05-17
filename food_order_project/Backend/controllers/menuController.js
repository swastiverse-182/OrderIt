const mongoose = require("mongoose");
const Menu = require("../models/menu");
const FoodItem = require("../models/foodItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");

// GET ALL MENUS
exports.getAllMenus = catchAsync(async (req, res, next) => {

  const filter = req.params.storeId
    ? { restaurant: req.params.storeId }
    : {};

  const menu = await Menu.find(filter).populate("menu.items");

  res.status(200).json({
    success: true,
    count: menu.length,
    data: menu,
  });

});


// CREATE MENU
exports.createMenu = catchAsync(async (req, res, next) => {

  // FIX: Validate restaurant ID is provided
  if (!req.body.restaurant) {
    return next(new ErrorHandler("Restaurant ID is required", 400));
  }

  // FIX: Validate restaurant ID format
  if (!mongoose.Types.ObjectId.isValid(req.body.restaurant)) {
    return next(new ErrorHandler("Invalid restaurant ID", 400));
  }

  const menu = await Menu.create(req.body);

  res.status(201).json({
    success: true,
    data: menu,
  });

});


// DELETE MENU
exports.deleteMenu = catchAsync(async (req, res, next) => {

  // FIX: Validate menuId before querying
  if (!mongoose.Types.ObjectId.isValid(req.params.menuId)) {
    return next(new ErrorHandler("Invalid menu ID", 400));
  }

  const menu = await Menu.findByIdAndDelete(req.params.menuId);

  if (!menu) {
    return next(new ErrorHandler("No menu found with that ID", 404));
  }

  res.status(204).json({
    success: true,
  });

});


// ADD ITEM TO MENU
exports.addItemToMenu = catchAsync(async (req, res, next) => {

  const { category, foodItemId } = req.body;
  const menuId = req.params.menuId;

  // FIX: Validate menuId format
  if (!mongoose.Types.ObjectId.isValid(menuId)) {
    return next(new ErrorHandler("Invalid menu ID", 400));
  }

  // FIX: Validate foodItemId format
  if (!mongoose.Types.ObjectId.isValid(foodItemId)) {
    return next(new ErrorHandler("Invalid food item ID", 400));
  }

  // FIX: Validate that food item actually exists
  const foodItem = await FoodItem.findById(foodItemId);
  if (!foodItem) {
    return next(new ErrorHandler("Food item not found", 404));
  }

  const menu = await Menu.findById(menuId);
  if (!menu) {
    return next(new ErrorHandler("Menu not found", 404));
  }

  // Find category or create new one
  let cat = menu.menu.find((c) => c.category === category);

  if (!cat) {
    cat = { category, items: [] };
    menu.menu.push(cat);
  }

  cat.items.push(foodItemId);

  // FIX: markModified so Mongoose detects nested array change
  menu.markModified("menu");
  await menu.save();

  await menu.populate("menu.items");

  res.status(200).json({
    success: true,
    data: menu,
  });

});


// UPDATE MENU
exports.updateMenu = catchAsync(async (req, res, next) => {

  // FIX: Validate menuId before querying
  if (!mongoose.Types.ObjectId.isValid(req.params.menuId)) {
    return next(new ErrorHandler("Invalid menu ID", 400));
  }

  const menu = await Menu.findByIdAndUpdate(
    req.params.menuId,
    req.body,
    { new: true, runValidators: true }
  );

  if (!menu) {
    return next(new ErrorHandler("No menu found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: menu,
  });

});