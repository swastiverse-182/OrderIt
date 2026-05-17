const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");

// Test Route
router.get("/test", (req, res) => {
    res.send("AI route working");
});

// FOOD AI
// Generate Only
router.post("/generate-food-ai", aiController.generateFoodAI);

// Generate + Save
router.post("/generate-food-ai/:foodId", aiController.generateAndSaveFoodAI);

// RESTAURANT ANALYZER
router.put("/admin/restaurants/:id/analyze", aiController.analyzeRestaurantReviews);

module.exports = router;