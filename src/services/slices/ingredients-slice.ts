import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TIngredient } from '@utils-types';
import { getIngredientsApi } from '@api';

export interface IngredientsState {
  items: TIngredient[];
  isLoading: boolean;
  error: string | null;
}

const initialIngredientsState: IngredientsState = {
  items: [],
  isLoading: false,
  error: null
};

export const getIngredients = createAsyncThunk(
  'ingredients/getIngredients',
  async () => getIngredientsApi()
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState: initialIngredientsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(getIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки ингредиентов';
      });
  }
});

export const ingredientsReducer = ingredientsSlice.reducer;
