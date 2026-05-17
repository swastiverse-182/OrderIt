const catchAsync = require("../middlewares/catchAsyncErrors");
const aiService = require("../services/ai.service");
const FoodItem = require("../models/foodItem");
const Restaurant = require("../models/restaurant");
const { analyzeReviewsWithAI } = require("../services/aiReviewAnalyzer");

// @desc    Generate AI description for food (No Save)
// @route   POST /api/v1/ai/generate-food-ai
exports.generateFoodAI = catchAsync(async (req, res) => {
    const { name, category, spiceLevel, price } = req.body;

    if (!name || !category || !spiceLevel || !price) {
        return res.status(400).json({
            success: false,
            message: "name, category, spiceLevel and price are required"
        });
    }

    const aiData = await aiService.generateDishDescription({
        name,
        category,
        spiceLevel,
        price
    });

    res.status(200).json({
        success: true,
        data: aiData
    });
});

// @desc    Generate AI description and save to Database
// @route   POST /api/v1/ai/generate-food-ai/:foodId
exports.generateAndSaveFoodAI = catchAsync(async (req, res) => {
    const { foodId } = req.params;

    const food = await FoodItem.findById(foodId);
    if (!food) {
        return res.status(404).json({
            success: false,
            message: "Food item not found"
        });
    }

    const aiData = await aiService.generateDishDescription({
        name: food.name,
        category: food.category || "Veg",
        spiceLevel: food.spiceLevel || "Medium",
        price: food.price
    });

    // Mapping AI results to schema
    food.aiDescription = aiData.description;
    food.aiTags = aiData.tags;
    food.aiAllergens = aiData.allergens;
    food.aiServes = aiData.serves;
    food.aiBestFor = aiData.bestFor;

    await food.save();

    res.status(200).json({
        success: true,
        message: "Food AI data updated",
        data: food
    });
});

// @desc    Analyze restaurant reviews using AI
// @route   PUT /api/v1/ai/admin/restaurants/:id/analyze
exports.analyzeRestaurantReviews = catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
    }

    if (!restaurant.reviews || restaurant.reviews.length === 0) {
        return res.status(400).json({ message: "No reviews to analyze" });
    }

    // Call service to process comments
    const aiData = await analyzeReviewsWithAI(restaurant.reviews);

    // Update restaurant document
    restaurant.reviewSentiment = aiData.sentiment;
    restaurant.reviewSummaryBullets = aiData.summaryBullets;
    restaurant.reviewTopMentions = aiData.topMentions;

    await restaurant.save();

    res.status(200).json({
        success: true,
        data: restaurant
    });
});