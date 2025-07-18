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
      
      // Sort entries by date in descending order (newest first)
      const entries = response.data
        .map(entry => validateEntry(entry))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
        
      return entries;
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
      
      // Only handle PDF download if it's an income entry AND generateBill is true
      if (data.paymentBill && validatedEntry.type === 'Income' && validatedEntry.generateBill === true) {
        // Convert base64 to Blob directly without using Buffer
        const byteCharacters = atob(data.paymentBill.data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create download link
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payment-bill-${data.entry._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return validateEntry(data.entry || data);
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
      const token = localStorage.getItem('token');
      const { data } = await API.put(
        `/entries/${id}`,
        validatedUpdates,
        { headers: { 'x-auth-token': token } }
      );
      
      // Handle PDF download if it's an income entry AND generateBill is true
      if (data.paymentBill && validatedUpdates.type === 'Income' && validatedUpdates.generateBill === true) {
        // Convert base64 to Blob directly without using Buffer
        const byteCharacters = atob(data.paymentBill.data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create download link
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payment-bill-${data.entry._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return validateEntry(data.entry || data);
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

export const createIncomeFromProject = createAsyncThunk(
  'entries/createIncomeFromProject',
  async (entryData, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/entries/income-from-project', entryData);
      
      // Handle PDF download if it's an income entry AND generateBill is true
      if (data.paymentBill && entryData.generateBill === true) {
        // Convert base64 to Blob directly without using Buffer
        const byteCharacters = atob(data.paymentBill.data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create download link
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payment-bill-${data.incomeEntry._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
        state.status = 'succeeded';
        state.entries = action.payload;
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addEntry.fulfilled, (state, action) => {
        // Add new entry at the beginning of the array
        state.entries.unshift(action.payload);
      })
      .addCase(updateEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex(entry => entry._id === action.payload._id);
        if (index !== -1) {
          state.entries[index] = action.payload;
          // Re-sort entries after update
          state.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
      })
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(entry => entry._id !== action.payload);
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
      })
      .addCase(createIncomeFromProject.fulfilled, (state, action) => {
        state.entries.unshift(action.payload.incomeEntry);
      })
      .addCase(createIncomeFromProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to create income from project';
      });
  },
});

export default entriesSlice.reducer;