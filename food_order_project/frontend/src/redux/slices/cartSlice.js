import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItems: [],
    restaurant: {},
    deliveryInfo: {},
    loading: false,
    error: null
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        cartRequest: (state) => {
            state.loading = true;
        },
        cartSuccess: (state, action) => {
            state.loading = false;
            state.cartItems = action.payload.items;
            state.restaurant = action.payload.restaurant;
        },
        cartFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateCartSuccess: (state, action) => {
            state.cartItems = action.payload.items;
        },
        removeCartSuccess: (state, action) => {
            // Match the ID against the nested foodItem._id
            state.cartItems = state.cartItems.filter(
                (item) => item.foodItem._id !== action.payload
            );
            
            // Logic for the last item: if cart is empty, clear restaurant
            if (state.cartItems.length === 0) {
                state.restaurant = {};
            }
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.restaurant = {};
        },
        clearErrors: (state) => {
            state.error = null;
        },
        saveDeliveryInfo: (state, action) => {
            state.deliveryInfo = action.payload;
        }
    }
});

export const {
    cartRequest,
    cartSuccess,
    cartFail,
    updateCartSuccess,
    removeCartSuccess,
    clearCart,
    clearErrors,
    saveDeliveryInfo,
} = cartSlice.actions;

export default cartSlice.reducer;