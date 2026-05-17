import { createSlice } from "@reduxjs/toolkit";
import { 
    getRestaurants, 
    createRestaurant, 
    deleteRestaurant, 
    analyzeReviews 
} from "../actions/restaurantAction";

const initialState = {
    restaurants: [],
    count: 0,
    loading: false,
    error: null,
    showVegOnly: false,
    pureVegRestaurantsCount: 0,
    creating: false,      
    createError: null,
    deleting: false,
    deleteError: null
};

const restaurantSlice = createSlice({
    name: "restaurants",
    initialState,
    reducers: {
        // Updated to match your DB field 'ratings'
        sortByRatings: (state) => {
            state.restaurants.sort((a, b) => b.ratings - a.ratings);
        },
        // Updated to match your DB field 'numOfReviews'
        sortByReviews: (state) => {
            state.restaurants.sort((a, b) => b.numOfReviews - a.numOfReviews);
        },
        toggleVegOnly: (state) => {
            state.showVegOnly = !state.showVegOnly;
            state.pureVegRestaurantsCount = calculatePureVegCount(state.restaurants, state.showVegOnly);
        },
        clearError: (state) => {
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            // --- GET ALL RESTAURANTS ---
            .addCase(getRestaurants.pending, (state) => {
                state.loading = true;
            })
            .addCase(getRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurants = action.payload.restaurants;
                state.count = action.payload.count;
            })
            .addCase(getRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch restaurants";
            })

            // --- CREATE RESTAURANT ---
            .addCase(createRestaurant.pending, (state) => {
                state.creating = true;
                state.createError = null;
            })
            .addCase(createRestaurant.fulfilled, (state, action) => {
                state.creating = false;
                // action.payload.data is the new restaurant object from backend
                state.restaurants.push(action.payload.data);
                state.count += 1;
            })
            .addCase(createRestaurant.rejected, (state, action) => {
                state.creating = false;
                state.createError = action.payload;
            })

            // --- DELETE RESTAURANT ---
            .addCase(deleteRestaurant.pending, (state) => {
                state.deleting = true;
                state.deleteError = null;
            })
            .addCase(deleteRestaurant.fulfilled, (state, action) => {
                state.deleting = false;
                state.restaurants = state.restaurants.filter(
                    (rest) => rest._id !== action.payload.id
                );
                state.count -= 1;
            })
            .addCase(deleteRestaurant.rejected, (state, action) => {
                state.deleting = false;
                state.deleteError = action.payload;
            })

            // --- ANALYZE REVIEWS (AI INSIGHTS) ---
            .addCase(analyzeReviews.pending, (state) => {
                state.loading = true;
            })
            .addCase(analyzeReviews.fulfilled, (state, action) => {
                state.loading = false;

                const { restaurantId, aiData } = action.payload;

                // Find the specific restaurant in our state to update its AI fields
                const restaurant = state.restaurants.find(
                    (r) => r._id === restaurantId
                );

                if (restaurant && aiData) {
                    // We map both potential naming conventions to be safe
                    restaurant.reviewSentiment = aiData.reviewSentiment || aiData.sentiment;
                    restaurant.reviewSummaryBullets = aiData.reviewSummaryBullets || aiData.summaryBullets;
                    restaurant.reviewTopMentions = aiData.reviewTopMentions || aiData.topMentions;
                }
            })
            .addCase(analyzeReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

// Exporting actions for use in components
export const {
    sortByRatings,
    sortByReviews,
    toggleVegOnly,
    clearError,
} = restaurantSlice.actions;

export default restaurantSlice.reducer;

/**
 * Helper function to calculate pure veg restaurant count
 */
const calculatePureVegCount = (restaurants, showVegOnly) => {
    if (!showVegOnly) return restaurants.length;
    return restaurants.filter(restaurant => restaurant.isVeg).length;
};