import {
  ingredientsReducer,
  getIngredients,
  IngredientsState
} from '../ingredients-slice';
import { TIngredient } from '@utils-types';

describe('ingredientsSlice reducer', () => {
  const initialState: IngredientsState = {
    items: [],
    isLoading: false,
    error: null
  };

  const mockIngredients: TIngredient[] = [
    {
      _id: '643d69a5c3f7b9001cce0550',
      name: 'Краторная булка N-200i',
      type: 'bun',
      proteins: 80,
      fat: 24,
      carbohydrates: 53,
      calories: 420,
      price: 1255,
      image: 'https://code.s3.yandex.net/react/code/bun-02.png',
      image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png'
    },
    {
      _id: '643d69a5c3f7b9001cce0552',
      name: 'Метеоритная котлета',
      type: 'main',
      proteins: 24,
      fat: 21,
      carbohydrates: 36,
      calories: 228,
      price: 1337,
      image: 'https://code.s3.yandex.net/react/code/meat-03.png',
      image_large: 'https://code.s3.yandex.net/react/code/meat-03-large.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/meat-03-mobile.png'
    }
  ];

  it('should return the initial state when called with undefined state and unknown action', () => {
    const action = { type: 'UNKNOWN' };
    const result = ingredientsReducer(undefined, action as any);

    expect(result).toEqual(initialState);
  });

  describe('getIngredients.pending', () => {
    it('should set isLoading to true and error to null when pending', () => {
      const action = { type: getIngredients.pending.type };
      const result = ingredientsReducer(initialState, action as any);

      expect(result).toEqual({
        items: [],
        isLoading: true,
        error: null
      });
    });
  });

  describe('getIngredients.fulfilled', () => {
    it('should set items and isLoading to false when fulfilled', () => {
      const action = {
        type: getIngredients.fulfilled.type,
        payload: mockIngredients
      };
      const result = ingredientsReducer(initialState, action as any);

      expect(result).toEqual({
        items: mockIngredients,
        isLoading: false,
        error: null
      });
    });

    it('should replace old items with new items', () => {
      const stateWithOldItems = {
        items: [mockIngredients[0]],
        isLoading: false,
        error: null
      };

      const action = {
        type: getIngredients.fulfilled.type,
        payload: mockIngredients
      };
      const result = ingredientsReducer(stateWithOldItems, action as any);

      expect(result.items).toEqual(mockIngredients);
      expect(result.items.length).toBe(2);
    });
  });

  describe('getIngredients.rejected', () => {
    it('should set error and isLoading to false when rejected', () => {
      const errorMessage = 'Failed to load ingredients';
      const action = {
        type: getIngredients.rejected.type,
        error: { message: errorMessage }
      };
      const result = ingredientsReducer(initialState, action as any);

      expect(result).toEqual({
        items: [],
        isLoading: false,
        error: errorMessage
      });
    });

    it('should set default error message when no error message provided', () => {
      const action = {
        type: getIngredients.rejected.type,
        error: {}
      };
      const result = ingredientsReducer(initialState, action as any);

      expect(result).toEqual({
        items: [],
        isLoading: false,
        error: 'Ошибка загрузки ингредиентов'
      });
    });

    it('should clear items on error', () => {
      const stateWithItems = {
        items: mockIngredients,
        isLoading: true,
        error: null
      };

      const action = {
        type: getIngredients.rejected.type,
        error: { message: 'Error' }
      };
      const result = ingredientsReducer(stateWithItems, action as any);

      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Error');
      expect(result.items).toEqual(mockIngredients);
    });
  });
});
