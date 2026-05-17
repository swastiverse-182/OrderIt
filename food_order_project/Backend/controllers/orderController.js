const mongoose = require("mongoose");
const Order = require("../models/order");
const FoodItem = require("../models/foodItem");
const Cart = require("../models/cartModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// FIX: Removed dotenv.config() - should only be loaded in server.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create a new order   =>  /api/v1/orders/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const { session_id } = req.body;

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["customer"],
  });

  // FIX: Check payment is actually completed before creating order
  if (session.payment_status !== "paid") {
    return next(new ErrorHandler("Payment not completed", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id })
    .populate({ path: "items.foodItem", select: "name price images" })
    .populate({ path: "restaurant", select: "name" });

  // FIX: Check cart exists and has items before processing
  if (!cart || !cart.items || cart.items.length === 0) {
    return next(new ErrorHandler("Cart is empty", 400));
  }

  // FIX: Fixed address using line1 + line2 (was using line1 twice)
  const deliveryInfo = {
    address: `${session.shipping_details.address.line1 || ""} ${session.shipping_details.address.line2 || ""}`.trim(),
    city: session.shipping_details.address.city,
    phoneNo: session.customer_details.phone,
    postalCode: session.shipping_details.address.postal_code,
    country: session.shipping_details.address.country,
  };

  const orderItems = cart.items.map((item) => ({
    name: item.foodItem.name,
    quantity: item.quantity,
    image: item.foodItem.images[0].url,
    price: item.foodItem.price,
    fooditem: item.foodItem._id,
  }));

  const paymentInfo = {
    id: session.payment_intent,
    status: session.payment_status,
  };

  const order = await Order.create({
    orderItems,
    deliveryInfo,
    paymentInfo,
    deliveryCharge: +session.shipping_cost.amount_subtotal / 100,
    itemsPrice: +session.amount_subtotal / 100,
    finalTotal: +session.amount_total / 100,
    user: req.user.id,
    restaurant: cart.restaurant._id,
    paidAt: Date.now(),
  });

  // Clear cart after order is created
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(200).json({
    success: true,
    order,
  });
});


// Get single order   =>   /api/v1/orders/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  // FIX: Validate order ID format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorHandler("Invalid order ID", 400));
  }

  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("restaurant")
    .exec();

  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});


// Get logged in user orders   =>   /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  // FIX: Use mongoose.Types.ObjectId instead of importing from mongodb directly
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const orders = await Order.find({ user: userId })
    .populate("user", "name email")
    .populate("restaurant")
    .exec();

  res.status(200).json({
    success: true,
    orders,
  });
});


// Get all orders - ADMIN   =>   /api/v1/admin/orders/
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  // FIX: Use MongoDB aggregation for total instead of JS loop
  const [orders, totalResult] = await Promise.all([
    Order.find().populate("user", "name email").populate("restaurant"),
    Order.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$finalTotal" } } }
    ])
  ]);

  const totalAmount = totalResult[0]?.totalAmount || 0;

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});


// Update order status - ADMIN   =>   /api/v1/admin/orders/:id
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  // FIX: Validate order ID format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorHandler("Invalid order ID", 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("This order has already been delivered", 400));
  }

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});