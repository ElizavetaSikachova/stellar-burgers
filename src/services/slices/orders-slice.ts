import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';
import { getOrdersApi, orderBurgerApi, getOrderByNumberApi } from '@api';

export interface OrdersState {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
  orderRequest: boolean;
  orderModalData: TOrder | null;
  orderError: string | null;
}

const initialOrdersState: OrdersState = {
  orders: [],
  isLoading: false,
  error: null,
  orderRequest: false,
  orderModalData: null,
  orderError: null
};

export const getUserOrders = createAsyncThunk(
  'orders/getUserOrders',
  async () => getOrdersApi()
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (ingredientIds: string[]) => orderBurgerApi(ingredientIds)
);

export const getOrderByNumber = createAsyncThunk(
  'orders/getOrderByNumber',
  async (number: number) => {
    const response = await getOrderByNumberApi(number);
    return response.orders[0] ?? null;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: initialOrdersState,
  reducers: {
    clearOrderModal: (state) => {
      state.orderModalData = null;
      state.orderRequest = false;
      state.orderError = null;
      return state;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки истории заказов';
      })
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.orderError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.orderError = action.error.message || 'Ошибка оформления заказа';
      })
      .addCase(getOrderByNumber.pending, (state) => {
        state.isLoading = true;
        state.orderModalData = null;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderModalData = action.payload ?? null;
      })
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || 'Ошибка загрузки информации о заказе';
        state.orderModalData = null;
      });
  }
});

export const { clearOrderModal } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
