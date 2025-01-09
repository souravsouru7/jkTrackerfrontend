import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://modernbakery.shop';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/api/projects?userId=${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access');
    }
    throw error;
  }
});

export const createProject = createAsyncThunk('projects/createProject', async (projectData) => {
  try {
    const response = await axios.post(`${API_URL}/api/projects`, projectData, {
      headers: getAuthHeader()
    });
    return response.data.project;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access');
    }
    throw error;
  }
});

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async ({projectId, userId}) => {
    try {
      await axios.delete(`${API_URL}/api/projects/${projectId}?userId=${userId}`, {
        headers: getAuthHeader()
      });
      return projectId;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access');
      }
      throw error;
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    selectedProject: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    selectProject: (state, action) => {
      state.selectedProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })
      .addCase(deleteProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = state.projects.filter(
          project => project._id !== action.payload
        );
        if (state.selectedProject?._id === action.payload) {
          state.selectedProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { selectProject } = projectSlice.actions;

export default projectSlice.reducer;