import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

// Async thunk for creating a bill
export const createBill = createAsyncThunk(
    'interiorBilling/createBill',
    async (billData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token'); // Get auth token
            const response = await axios.post(`${API_URL}/api/interior/bills`, billData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Async thunk for generating PDF
export const generatePDF = createAsyncThunk(
    'interiorBilling/generatePDF',
    async (billId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/interior/bills/${billId}/pdf`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const interiorBillingSlice = createSlice({
    name: 'interiorBilling',
    initialState: {
        bills: [],
        currentBill: null,
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        setCurrentBill: (state, action) => {
            state.currentBill = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Bill
            .addCase(createBill.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBill.fulfilled, (state, action) => {
                state.loading = false;
                state.bills.push(action.payload);
                state.currentBill = action.payload;
                state.success = true;
            })
            .addCase(createBill.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to create bill';
            })
            // Generate PDF
            .addCase(generatePDF.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generatePDF.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(generatePDF.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to generate PDF';
            });
    }
});

export const { clearError, clearSuccess, setCurrentBill } = interiorBillingSlice.actions;
export default interiorBillingSlice.reducer;