import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  TConstructorIngredient,
  TIngredient,
  TOrder,
  TUser
} from '@utils-types';
import {
  getFeedsApi,
  getIngredientsApi,
  getOrderByNumberApi,
  getOrdersApi,
  loginUserApi,
  logoutApi,
  orderBurgerApi,
  registerUserApi,
  updateUserApi,
  getUserApi,
  TLoginData,
  TRegisterData
} from '@api';
import { deleteCookie, getCookie, setCookie } from '../../utils/cookie';

// Constructor State and Slice
export type ConstructorState = {
  bun: TIngredient | null;
  ingredients: (TIngredient & { id: string })[];
};

const initialConstructorState: ConstructorState = {
  bun: null,
  ingredients: []
};

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState: initialConstructorState,
  reducers: {
    addIngredient: (state, action: PayloadAction<TIngredient>) => {
      console.log(' addIngredient called', action.payload);

      if (!action.payload) {
        console.error(' addIngredient: no payload');
        return state;
      }

      if (!state.ingredients) {
        console.warn(' state.ingredients was undefined, initializing');
        state.ingredients = [];
      }

      if (action.payload.type === 'bun') {
        state.bun = { ...action.payload };
        console.log(' Bun added to state:', state.bun);
      } else {
        const newIngredient = {
          ...action.payload,
          id: `${Date.now()}-${Math.random()}`
        };
        state.ingredients.push(newIngredient);
        console.log(' Ingredient added:', newIngredient);
        console.log(' All ingredients:', state.ingredients);
      }

      console.log(' New burgerConstructor state:', {
        bun: state.bun,
        ingredients: state.ingredients,
        ingredientsCount: state.ingredients?.length || 0
      });

      return state;
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      console.log(' removeIngredient called', action.payload);

      if (!state.ingredients) {
        state.ingredients = [];
        return state;
      }

      const index = state.ingredients.findIndex(
        (ing) => ing.id === action.payload
      );
      if (index >= 0) {
        state.ingredients.splice(index, 1);
      }
      return state;
    },
    moveIngredient: (
      state,
      action: PayloadAction<{
        fromIndex: number;
        toIndex: number;
      }>
    ) => {
      console.log(' moveIngredient called', action.payload);

      if (!state.ingredients || state.ingredients.length === 0) {
        return state;
      }

      const { fromIndex, toIndex } = action.payload;
      if (
        fromIndex >= 0 &&
        toIndex >= 0 &&
        fromIndex < state.ingredients.length &&
        toIndex < state.ingredients.length
      ) {
        const [item] = state.ingredients.splice(fromIndex, 1);
        state.ingredients.splice(toIndex, 0, item);
      }
      return state;
    },
    clearBurgerConstructor: (state) => {
      console.log(' clearBurgerConstructor called');
      state.bun = null;
      state.ingredients = [];
      return state;
    }
  }
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearBurgerConstructor
} = constructorSlice.actions;
export const burgerConstructorReducer = constructorSlice.reducer;

interface IngredientsState {
  items: TIngredient[];
  isLoading: boolean;
  error: string | null;
}

interface FeedState {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: string | null;
  newOrderId: number | null; //1
}

interface OrdersState {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
  orderRequest: boolean;
  orderModalData: TOrder | null;
  orderError: string | null;
}

interface AuthState {
  user: TUser | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
  updateUserError: string | null;
}

const initialIngredientsState: IngredientsState = {
  items: [],
  isLoading: false,
  error: null
};

const initialFeedState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
  newOrderId: null //1
};

const initialOrdersState: OrdersState = {
  orders: [],
  isLoading: false,
  error: null,
  orderRequest: false,
  orderModalData: null,
  orderError: null
};

const initialAuthState: AuthState = {
  user: null,
  isAuth: false,
  isLoading: false,
  error: null,
  updateUserError: null
};

export const getIngredients = createAsyncThunk(
  'ingredients/getIngredients',
  async () => {
    console.log(' getIngredients called');
    return getIngredientsApi();
  }
);

export const getFeeds = createAsyncThunk('feed/getFeeds', async () => {
  console.log(' getFeeds called');
  return getFeedsApi();
});

export const getUserOrders = createAsyncThunk(
  'orders/getUserOrders',
  async () => {
    console.log(' getUserOrders called');
    return getOrdersApi();
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (ingredientIds: string[]) => {
    console.log(' createOrder called', ingredientIds);
    return orderBurgerApi(ingredientIds);
  }
);

export const getUser = createAsyncThunk(
  'auth/getUser',
  async (_, { rejectWithValue }) => {
    console.log(' getUser called');
    try {
      const response = await getUserApi();
      console.log(' getUser success', response.user);
      return response.user;
    } catch (error) {
      console.log(' getUser error', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка загрузки профиля'
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (user: Partial<TRegisterData>, { rejectWithValue }) => {
    console.log(' updateUser called', user);
    try {
      const response = await updateUserApi(user);
      console.log(' updateUser success', response.user);
      return response.user;
    } catch (error) {
      console.log(' updateUser error', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка обновления профиля'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (data: TLoginData, { rejectWithValue }) => {
    console.log(' loginUser called', data);
    try {
      const response = await loginUserApi(data);
      localStorage.setItem('refreshToken', response.refreshToken);
      setCookie('accessToken', response.accessToken);
      console.log(' loginUser success', response.user);
      return response.user;
    } catch (error) {
      console.log(' loginUser error', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка авторизации'
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (data: TRegisterData, { rejectWithValue }) => {
    console.log(' registerUser called', data);
    try {
      const response = await registerUserApi(data);
      localStorage.setItem('refreshToken', response.refreshToken);
      setCookie('accessToken', response.accessToken);
      console.log(' registerUser success', response.user);
      return response.user;
    } catch (error) {
      console.log(' registerUser error', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка регистрации'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    console.log(' logoutUser called');
    try {
      await logoutApi();
      console.log(' logoutUser success');
      return true;
    } catch (error) {
      console.log(' logoutUser error', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка выхода'
      );
    } finally {
      localStorage.removeItem('refreshToken');
      deleteCookie('accessToken');
    }
  }
);

export const getOrderByNumber = createAsyncThunk(
  'orders/getOrderByNumber',
  async (number: number) => {
    console.log(' getOrderByNumber called', number);
    const response = await getOrderByNumberApi(number);
    const result = response.orders[0] ?? null;
    console.log(' getOrderByNumber result', result);
    return result;
  }
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState: initialIngredientsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getIngredients.pending, (state) => {
        console.log(' ingredients/getIngredients.pending called');
        state.isLoading = true;
        state.error = null;
        return state;
      })
      .addCase(getIngredients.fulfilled, (state, action) => {
        console.log(
          ' ingredients/getIngredients.fulfilled called',
          action.payload
        );
        state.isLoading = false;
        state.items = action.payload;
        return state;
      })
      .addCase(getIngredients.rejected, (state, action) => {
        console.log(
          ' ingredients/getIngredients.rejected called',
          action.error
        );
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки ингредиентов';
        return state;
      });
  }
});

const feedSlice = createSlice({
  //1
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
        console.log(' feed/getFeeds.pending called');
        state.isLoading = true;
        state.error = null;
        return state;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        console.log(' feed/getFeeds.fulfilled called', action.payload);
        state.isLoading = false;

        // ✅ Проверяем, есть ли новый заказ
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
        return state;
      })
      .addCase(getFeeds.rejected, (state, action) => {
        console.log(' feed/getFeeds.rejected called', action.error);
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки ленты';
        return state;
      });
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: initialOrdersState,
  reducers: {
    clearOrderModal: (state) => {
      console.log(' orders/clearOrderModal called');
      state.orderModalData = null;
      state.orderRequest = false;
      state.orderError = null;
      console.log(' orders/clearOrderModal finished', state);
      return state;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserOrders.pending, (state) => {
        console.log(' orders/getUserOrders.pending called');
        state.isLoading = true;
        state.error = null;
        return state;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        console.log(' orders/getUserOrders.fulfilled called', action.payload);
        state.isLoading = false;
        state.orders = action.payload;
        return state;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        console.log(' orders/getUserOrders.rejected called', action.error);
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки истории заказов';
        return state;
      })
      .addCase(createOrder.pending, (state) => {
        console.log(' orders/createOrder.pending called');
        state.orderRequest = true;
        state.orderError = null;
        return state;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        console.log(' orders/createOrder.fulfilled called', action.payload);
        state.orderRequest = false;
        state.orderModalData = action.payload.order;
        return state;
      })
      .addCase(createOrder.rejected, (state, action) => {
        console.log(' orders/createOrder.rejected called', action.error);
        state.orderRequest = false;
        state.orderError = action.error.message || 'Ошибка оформления заказа';
        return state;
      })
      .addCase(getOrderByNumber.pending, (state) => {
        console.log(' orders/getOrderByNumber.pending called');
        state.isLoading = true;
        state.orderModalData = null;
        return state;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        console.log(
          ' orders/getOrderByNumber.fulfilled called',
          action.payload
        );
        state.isLoading = false;
        state.orderModalData = action.payload ?? null;
        return state;
      })
      .addCase(getOrderByNumber.rejected, (state, action) => {
        console.log(' orders/getOrderByNumber.rejected called', action.error);
        state.isLoading = false;
        state.error =
          action.error.message || 'Ошибка загрузки информации о заказе';
        state.orderModalData = null;
        return state;
      });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    clearAuthError: (state) => {
      console.log(' auth/clearAuthError called');
      state.error = null;
      state.updateUserError = null;
      console.log(' auth/clearAuthError finished', state);
      return state;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        console.log(' auth/getUser.pending called');
        state.isLoading = true;
        return state;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        console.log(' auth/getUser.fulfilled called', action.payload);
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
        return state;
      })
      .addCase(getUser.rejected, (state) => {
        console.log(' auth/getUser.rejected called');
        state.isLoading = false;
        state.isAuth = false;
        state.user = null;
        return state;
      })
      .addCase(updateUser.pending, (state) => {
        console.log(' auth/updateUser.pending called');
        state.isLoading = true;
        state.updateUserError = null;
        return state;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        console.log(' auth/updateUser.fulfilled called', action.payload);
        state.isLoading = false;
        state.user = action.payload;
        return state;
      })
      .addCase(updateUser.rejected, (state, action) => {
        console.log(' auth/updateUser.rejected called', action.error);
        state.isLoading = false;
        state.updateUserError =
          action.error.message || 'Ошибка обновления профиля';
        return state;
      })
      .addCase(loginUser.pending, (state) => {
        console.log(' auth/loginUser.pending called');
        state.isLoading = true;
        state.error = null;
        return state;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log(' auth/loginUser.fulfilled called', action.payload);
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
        return state;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log(' auth/loginUser.rejected called', action.error);
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка авторизации';
        return state;
      })
      .addCase(registerUser.pending, (state) => {
        console.log(' auth/registerUser.pending called');
        state.isLoading = true;
        state.error = null;
        return state;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log(' auth/registerUser.fulfilled called', action.payload);
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
        return state;
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.log(' auth/registerUser.rejected called', action.error);
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка регистрации';
        return state;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log(' auth/logoutUser.fulfilled called');
        state.user = null;
        state.isAuth = false;
        return state;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        console.log(' auth/logoutUser.rejected called', action.error);
        state.error = action.error.message || 'Ошибка выхода';
        return state;
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export const { clearOrderModal } = ordersSlice.actions;
export const { clearNewOrderId } = feedSlice.actions; //1
export const ingredientsReducer = ingredientsSlice.reducer;
export const feedReducer = feedSlice.reducer;
export const ordersReducer = ordersSlice.reducer;
export const authReducer = authSlice.reducer;

export const reducers = {
  ingredients: ingredientsReducer,
  feed: feedReducer,
  orders: ordersReducer,
  burgerConstructor: burgerConstructorReducer,
  auth: authReducer
};
