import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { TConstructorIngredient, TIngredient } from '@utils-types';

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
    addIngredient: {
      reducer: (state, action: PayloadAction<TIngredient & { id: string }>) => {
        if (!action.payload) {
          console.error(' addIngredient: no payload');
          return state;
        }

        if (!state.ingredients) {
          state.ingredients = [];
        }

        if (action.payload.type === 'bun') {
          state.bun = { ...action.payload };
        } else {
          state.ingredients.push({ ...action.payload });
        }

        return state;
      },
      prepare: (ingredient: TIngredient) => {
        const id = uuidv4();
        return { payload: { ...ingredient, id } };
      }
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
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

export const constructorReducer = constructorSlice.reducer;
