const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getAllRestaurants,
  createRestaurant,
  getRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

const { protect } = require("../controllers/authController");
const { authorizeRoles } = require("../middlewares/authorizeRoles");

const menuRoutes = require("./menu");
const Restaurant = require("../models/restaurant");

router.get("/count", async (req, res) => {
  try {
    const count = await Restaurant.countDocuments();
    res.json({ count });
  } catch {
    res
      .status(500)
      .json({ error: "Unable to fetch the number of restaurants." });
  }
});

router
  .route("/")
  .get(getAllRestaurants)
  .post(protect, authorizeRoles("admin"), createRestaurant);

router
  .route("/:storeId")
  .get(getRestaurant)
  .delete(protect, authorizeRoles("admin"), deleteRestaurant);

router.use("/:storeId/menus", menuRoutes);

module.exports = router;
