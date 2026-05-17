const Cart = require("../models/cartModel");
const FoodItem = require("../models/foodItem");
const Restaurant = require("../models/restaurant");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Helper to fetch populated cart
const getPopulatedCart = (userId) =>
  Cart.findOne({ user: userId })
    .populate({ path: "items.foodItem", select: "name price images" })
    .populate({ path: "restaurant", select: "name" });

// Add item to cart
const addItemToCart = catchAsyncErrors(async (req, res, next) => {
  // FIX: Get userId from authenticated user, not from req.body (security fix)
  const userId = req.user._id;
  const { foodItemId, restaurantId, quantity } = req.body;

  // FIX: Validate quantity
  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: "Invalid quantity" });
  }

  const foodItem = await FoodItem.findById(foodItemId);
  if (!foodItem) {
    return res.status(404).json({ success: false, message: "Food item not found" });
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ success: false, message: "Restaurant not found" });
  }

  let cart = await Cart.findOne({ user: userId });

  if (cart) {
    if (cart.restaurant.toString() !== restaurantId) {
      // Different restaurant — clear old cart and start fresh
      await Cart.deleteOne({ _id: cart._id });
      cart = new Cart({
        user: userId,
        restaurant: restaurantId,
        items: [{ foodItem: foodItemId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.foodItem.toString() === foodItemId
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ foodItem: foodItemId, quantity });
      }
    }
  } else {
    cart = new Cart({
      user: userId,
      restaurant: restaurantId,
      items: [{ foodItem: foodItemId, quantity }],
    });
  }

  await cart.save();

  const updatedCart = await getPopulatedCart(userId);
  // FIX: Consistent response format
  res.status(200).json({ success: true, message: "Cart updated", cart: updatedCart });
});


// Update cart item quantity
const updateCartItemQuantity = catchAsyncErrors(async (req, res, next) => {
  // FIX: Get userId from authenticated user, not from req.body
  const userId = req.user._id;
  const { foodItemId, quantity } = req.body;

  // FIX: Validate quantity
  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: "Invalid quantity" });
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.foodItem.toString() === foodItemId
  );
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: "Food item not found in cart" });
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  const updatedCart = await getPopulatedCart(userId);
  res.status(200).json({ success: true, message: "Cart item quantity updated", cart: updatedCart });
});


// Delete cart item
const deleteCartItem = catchAsyncErrors(async (req, res, next) => {
  // FIX: Get userId from authenticated user, not from req.body
  const userId = req.user._id;
  const { foodItemId } = req.body;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.foodItem.toString() === foodItemId
  );
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: "Food item not found in cart" });
  }

  cart.items.splice(itemIndex, 1);

  if (cart.items.length === 0) {
    await Cart.deleteOne({ _id: cart._id });
    return res.status(200).json({ success: true, message: "Cart deleted" });
  }

  await cart.save();

  const updatedCart = await getPopulatedCart(userId);
  res.status(200).json({ success: true, message: "Cart item deleted", cart: updatedCart });
});


// Fetch cart items
const getCartItem = catchAsyncErrors(async (req, res, next) => {
  // FIX: Use req.user._id instead of req.user
  const userId = req.user._id;

  const cart = await getPopulatedCart(userId);

  if (!cart) {
    return res.status(404).json({ success: false, message: "No cart found" });
  }

  return res.status(200).json({ success: true, data: cart });
});


module.exports = {
  addItemToCart,
  updateCartItemQuantity,
  deleteCartItem,
  getCartItem,
};