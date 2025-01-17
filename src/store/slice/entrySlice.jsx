import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config';

const API = axios.create({
  baseURL: config.API_URL,
});

const validateEntry = (entry) => {
  return {
    ...entry,
    type: entry.type || 'Expense',
    amount: parseFloat(entry.amount) || 0,
    category: entry.category || '',
    description: entry.description || ''
  };
};

export const fetchEntries = createAsyncThunk(
  'entries/fetchEntries',
  async (_, { rejectWithValue, getState }) => {
    try {
      const user = localStorage.getItem('user');
      if (!user) throw new Error('User information not found');

      const { id: userId } = JSON.parse(user);
      const selectedProject = getState().projects.selectedProject;

      if (!selectedProject) {
        return []; 
      }

      const response = await API.get('/entries', { 
        params: { 
          userId,
          projectId: selectedProject._id 
        } 
      });
      return response.data.map(entry => validateEntry(entry));
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch entries');
    }
  }
);

export const addEntry = createAsyncThunk(
  'entries/addEntry',
  async (entry, { rejectWithValue, getState }) => {
    try {
      const { projects } = getState();
      const validatedEntry = {
        ...validateEntry(entry),
        projectId: entry.projectId || projects.selectedProject?._id
      };
      
      if (!validatedEntry.projectId) {
        throw new Error('Project ID is required');
      }

      const { data } = await API.post('/entries', validatedEntry);
      return validateEntry(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteEntry = createAsyncThunk(
  'entries/deleteEntry',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/entries/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete entry');
    }
  }
);

export const updateEntry = createAsyncThunk(
  'entries/updateEntry',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const validatedUpdates = validateEntry(updates);
      const { data } = await API.put(`/entries/${id}`, validatedUpdates);
      return validateEntry(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update entry');
    }
  }
);

export const exportEntries = createAsyncThunk(
  'entries/exportEntries',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/entries/export/${projectId}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project-entries-${projectId}.xlsx`);
      
      // Append to html page
      document.body.appendChild(link);
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to export entries');
    }
  }
);

const entriesSlice = createSlice({
  name: 'entries',
  initialState: {
    entries: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntries.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        state.entries = action.payload.map(entry => validateEntry(entry));
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch entries';
      })
      .addCase(addEntry.fulfilled, (state, action) => {
        state.entries.push(validateEntry(action.payload));
        state.error = null;
      })
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter((entry) => entry._id !== action.payload);
        state.error = null;
      })
      .addCase(updateEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex((entry) => entry._id === action.payload._id);
        if (index !== -1) {
          state.entries[index] = validateEntry(action.payload);
        }
        state.error = null;
      })
      .addCase(exportEntries.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(exportEntries.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(exportEntries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to export entries';
      });
  },
});

export default entriesSlice.reducer;