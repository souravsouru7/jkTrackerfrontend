import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config';

const API_URL = config.API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'x-auth-token': token } : {};
};

const VALID_STATUSES = ['Under Disscussion', 'In Progress', 'Completed'];

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

// Update createProject to use correct initial status
export const createProject = createAsyncThunk('projects/createProject', async (projectData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/projects`, {
      ...projectData,
      budget: Number(projectData.budget) || 0,
      status: 'Under Disscussion' // Match backend exactly
    }, {
      headers: { 'x-auth-token': token }
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
  async (projectId) => {
    try {
      await axios.delete(`${API_URL}/api/projects/${projectId}`, {
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

export const updateProjectBudget = createAsyncThunk(
  'projects/updateProjectBudget',
  async ({ projectId, budget }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/projects/${projectId}/budget`,
        { budget: Number(budget) },
        { headers: getAuthHeader() }
      );
      return response.data.project;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access');
      }
      throw error;
    }
  }
);

// Add validation to updateProjectStatus
export const updateProjectStatus = createAsyncThunk(
  'projects/updateProjectStatus',
  async ({ projectId, status }) => {
    // Validate status before sending request
    if (!VALID_STATUSES.includes(status)) {
      console.error('Invalid status:', status, 'Valid statuses:', VALID_STATUSES);
      throw new Error('Invalid status value');
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/projects/${projectId}/status`,
        { status },
        { headers: getAuthHeader() }
      );
      return response.data.project;
    } catch (error) {
      console.error('Update status API error:', error);
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access');
      }
      throw error.response?.data?.message || error.message || 'Failed to update status';
    }
  }
);

export const fetchProjectsByStatus = createAsyncThunk(
  'projects/fetchProjectsByStatus',
  async (status) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/projects/by-status/${status}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access');
      }
      throw error;
    }
  }
);

const initialState = {
  projects: [],
  selectedProject: null,
  status: 'idle',
  error: null,
  projectsByStatus: {
    'Under Disscussion': [],
    'In Progress': [],
    'Completed': []
  },
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
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
      })
      .addCase(updateProjectBudget.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProjectBudget.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.selectedProject?._id === action.payload._id) {
          state.selectedProject = action.payload;
        }
      })
      .addCase(updateProjectBudget.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.selectedProject?._id === action.payload._id) {
          state.selectedProject = action.payload;
        }
      })
      .addCase(fetchProjectsByStatus.fulfilled, (state, action) => {
        const status = action.meta.arg;
        state.projectsByStatus[status] = action.payload;
      })
      // Add a case to handle budget updates when connecting estimate bills
      .addCase('interiorBilling/connectBillToProject/fulfilled', (state, action) => {
        if (action.payload?.projectId && action.payload?.documentType === 'Estimate') {
          const project = state.projects.find(p => p._id === action.payload.projectId);
          if (project) {
            project.budget = action.payload.finalAmount;
          }
          if (state.selectedProject?._id === action.payload.projectId) {
            state.selectedProject.budget = action.payload.finalAmount;
          }
        }
      })
      .addCase('interiorBilling/disconnectBillFromProject/fulfilled', (state, action) => {
        if (action.payload?.documentType === 'Estimate' && action.payload?.projectId) {
          const project = state.projects.find(p => p._id === action.payload.projectId);
          if (project) {
            project.budget = 0;
          }
          if (state.selectedProject?._id === action.payload.projectId) {
            state.selectedProject.budget = 0;
          }
        }
      });
  },
});

export const { selectProject } = projectSlice.actions;

export default projectSlice.reducer;