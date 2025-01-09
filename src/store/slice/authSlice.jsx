import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginService, signup as signupService } from '../../services/api';

// Get token and user from localStorage
const tokenFromStorage = localStorage.getItem('token');
const userFromStorage = JSON.parse(localStorage.getItem('user'));

// Async Thunks
export const login = createAsyncThunk('auth/login', async (formData, { rejectWithValue }) => {
    try {
        const response = await loginService(formData);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
});

export const signup = createAsyncThunk('auth/signup', async (formData, { rejectWithValue }) => {
    try {
        await signupService(formData);
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Signup failed');
    }
});

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: userFromStorage || null,
        token: tokenFromStorage || null,
        isLoading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;

                // Save to localStorage
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(signup.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
