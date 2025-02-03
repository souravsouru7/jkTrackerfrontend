import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config';

const API = axios.create({
  baseURL: config.API_URL,
});

// Async thunk for sending messages
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token not found');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      const response = await API.post('/api/chat/message', { message }, config);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to send message');
    }
  }
);

// Async thunk for fetching chat history
export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token not found');

      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      const response = await API.get('/api/chat/history', config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch chat history');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    loading: false,
    error: null,
    isOpen: false
  },
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send message';
      })
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch chat history';
      });
  }
});

export const { toggleChat } = chatSlice.actions;
export default chatSlice.reducer; 