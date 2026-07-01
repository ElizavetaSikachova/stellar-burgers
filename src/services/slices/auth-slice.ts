import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TUser } from '@utils-types';
import {
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi,
  getUserApi,
  TLoginData,
  TRegisterData
} from '@api';
import { deleteCookie, getCookie, setCookie } from '../../utils/cookie';

const getErrorMessage = (error: any): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return error.message;
  }
  return 'Неизвестная ошибка';
};

export interface AuthState {
  user: TUser | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
  updateUserError: string | null;
  isAuthChecked: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  isAuth: false,
  isLoading: false,
  error: null,
  updateUserError: null,
  isAuthChecked: false
};

export const getUser = createAsyncThunk(
  'auth/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserApi();
      return response.user;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error) || 'Ошибка загрузки профиля'
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (user: Partial<TRegisterData>, { rejectWithValue }) => {
    try {
      const response = await updateUserApi(user);
      return response.user;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error) || 'Ошибка обновления профиля'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (data: TLoginData, { rejectWithValue }) => {
    try {
      const response = await loginUserApi(data);
      localStorage.setItem('refreshToken', response.refreshToken);
      setCookie('accessToken', response.accessToken);
      return response.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error) || 'Ошибка авторизации');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (data: TRegisterData, { rejectWithValue }) => {
    try {
      const response = await registerUserApi(data);
      localStorage.setItem('refreshToken', response.refreshToken);
      setCookie('accessToken', response.accessToken);
      return response.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error) || 'Ошибка регистрации');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      return true;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error) || 'Ошибка выхода');
    } finally {
      localStorage.removeItem('refreshToken');
      deleteCookie('accessToken');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.updateUserError = null;
      return state;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.isAuthChecked = false;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
        state.isAuthChecked = true;
      })
      .addCase(getUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuth = false;
        state.isAuthChecked = true;
        state.user = null;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.updateUserError =
          action.error.message || 'Ошибка обновления профиля';
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthChecked = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка авторизации';
        state.isAuthChecked = true;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthChecked = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка регистрации';
        state.isAuthChecked = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuth = false;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка выхода';
        state.user = null;
        state.isAuth = false;
        state.isAuthChecked = true;
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;
