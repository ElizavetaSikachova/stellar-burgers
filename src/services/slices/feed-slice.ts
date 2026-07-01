import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';
import { getFeedsApi } from '@api';

export interface FeedState {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: string | null;
  newOrderId: number | null;
}

const initialFeedState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
  newOrderId: null
};

export const getFeeds = createAsyncThunk('feed/getFeeds', async () => getFeedsApi());

const feedSlice = createSlice({
  name: 'feed',
  initialState: initialFeedState,
  reducers: {
    clearNewOrderId: (state) => {
      state.newOrderId = null;
      return state;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        state.isLoading = false;

        const oldOrderIds = new Set(state.orders.map((o) => o.number));
        const newOrder = action.payload.orders.find(
          (o) => !oldOrderIds.has(o.number)
        );

        if (newOrder) {
          state.newOrderId = newOrder.number;
        }

        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(getFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки ленты';
      });
  }
});

export const { clearNewOrderId } = feedSlice.actions;
export const feedReducer = feedSlice.reducer;
