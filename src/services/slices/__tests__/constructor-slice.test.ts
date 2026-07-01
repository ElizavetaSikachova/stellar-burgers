import {
  constructorReducer,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearBurgerConstructor,
  ConstructorState
} from '../constructor-slice';
import { TIngredient } from '@utils-types';

describe('constructorSlice reducer', () => {
  const initialState: ConstructorState = {
    bun: null,
    ingredients: []
  };

  const mockBun: TIngredient = {
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
  };

  const mockMain: TIngredient = {
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
  };

  const mockSauce: TIngredient = {
    _id: '643d69a5c3f7b9001cce0555',
    name: 'Соус Spicy-X 🌶️ 🌶️ 🌶️',
    type: 'sauce',
    proteins: 30,
    fat: 20,
    carbohydrates: 42,
    calories: 111,
    price: 90,
    image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png'
  };

  it('should return the initial state when called with undefined state and unknown action', () => {
    const action = { type: 'UNKNOWN' };
    const result = constructorReducer(undefined, action as any);

    expect(result).toEqual(initialState);
  });

  describe('addIngredient', () => {
    it('should add bun ingredient to constructor', () => {
      const action = addIngredient(mockBun);
      const result = constructorReducer(initialState, action);

      expect(result.bun).not.toBeNull();
      expect(result.bun?.name).toBe('Краторная булка N-200i');
      expect(result.bun?.type).toBe('bun');
    });

    it('should replace bun ingredient when adding another bun', () => {
      let state = constructorReducer(initialState, addIngredient(mockBun));
      const firstBun = state.bun;

      state = constructorReducer(state, addIngredient(mockBun));
      const secondBun = state.bun;

      expect(firstBun).not.toBe(secondBun);
      expect(state.bun?.name).toBe('Краторная булка N-200i');
    });

    it('should add main ingredient to constructor', () => {
      const action = addIngredient(mockMain);
      const result = constructorReducer(initialState, action);

      expect(result.ingredients.length).toBe(1);
      expect(result.ingredients[0].name).toBe('Метеоритная котлета');
      expect(result.ingredients[0].type).toBe('main');
      expect(result.ingredients[0].id).toBeDefined();
    });

    it('should add sauce ingredient to constructor', () => {
      const action = addIngredient(mockSauce);
      const result = constructorReducer(initialState, action);

      expect(result.ingredients.length).toBe(1);
      expect(result.ingredients[0].name).toBe('Соус Spicy-X 🌶️ 🌶️ 🌶️');
      expect(result.ingredients[0].type).toBe('sauce');
      expect(result.ingredients[0].id).toBeDefined();
    });

    it('should add multiple ingredients to constructor', () => {
      let state = constructorReducer(initialState, addIngredient(mockMain));
      state = constructorReducer(state, addIngredient(mockSauce));

      expect(state.ingredients.length).toBe(2);
      expect(state.ingredients[0].type).toBe('main');
      expect(state.ingredients[1].type).toBe('sauce');
    });

    it('should assign unique ids to each ingredient', () => {
      let state = constructorReducer(initialState, addIngredient(mockMain));
      const firstId = state.ingredients[0].id;

      state = constructorReducer(state, addIngredient(mockMain));
      const secondId = state.ingredients[1].id;

      expect(firstId).not.toBe(secondId);
    });
  });

  describe('removeIngredient', () => {
    it('should remove ingredient by id', () => {
      let state = constructorReducer(initialState, addIngredient(mockMain));
      let state2 = constructorReducer(state, addIngredient(mockSauce));

      const idToRemove = state2.ingredients[0].id;
      const action = removeIngredient(idToRemove);
      const result = constructorReducer(state2, action);

      expect(result.ingredients.length).toBe(1);
      expect(result.ingredients[0].id).not.toBe(idToRemove);
    });

    it('should not remove anything if id does not exist', () => {
      let state = constructorReducer(initialState, addIngredient(mockMain));
      const action = removeIngredient('non-existent-id');
      const result = constructorReducer(state, action);

      expect(result.ingredients.length).toBe(1);
    });

    it('should handle removing from empty ingredients array', () => {
      const action = removeIngredient('any-id');
      const result = constructorReducer(initialState, action);

      expect(result.ingredients).toEqual([]);
    });
  });

  describe('moveIngredient', () => {
    it('should move ingredient from one index to another', () => {
      let state = constructorReducer(initialState, addIngredient(mockMain));
      state = constructorReducer(state, addIngredient(mockSauce));

      const action = moveIngredient({ fromIndex: 0, toIndex: 1 });
      const result = constructorReducer(state, action);

      expect(result.ingredients[0].type).toBe('sauce');
      expect(result.ingredients[1].type).toBe('main');
    });

    it('should not move if indices are invalid', () => {
      let state = constructorReducer(initialState, addIngredient(mockMain));

      const action = moveIngredient({ fromIndex: 0, toIndex: 5 });
      const result = constructorReducer(state, action);

      expect(result.ingredients.length).toBe(1);
      expect(result.ingredients[0].type).toBe('main');
    });

    it('should handle move with negative indices', () => {
      let state = constructorReducer(initialState, addIngredient(mockMain));

      const action = moveIngredient({ fromIndex: -1, toIndex: 0 });
      const result = constructorReducer(state, action);

      expect(result.ingredients[0].type).toBe('main');
    });

    it('should handle move with from index >= array length', () => {
      let state = constructorReducer(initialState, addIngredient(mockMain));

      const action = moveIngredient({ fromIndex: 5, toIndex: 0 });
      const result = constructorReducer(state, action);

      expect(result.ingredients[0].type).toBe('main');
    });

    it('should not move if ingredients array is empty', () => {
      const action = moveIngredient({ fromIndex: 0, toIndex: 1 });
      const result = constructorReducer(initialState, action);

      expect(result.ingredients).toEqual([]);
    });
  });

  describe('clearBurgerConstructor', () => {
    it('should clear bun and ingredients', () => {
      let state = constructorReducer(initialState, addIngredient(mockBun));
      state = constructorReducer(state, addIngredient(mockMain));
      state = constructorReducer(state, addIngredient(mockSauce));

      expect(state.bun).not.toBeNull();
      expect(state.ingredients.length).toBe(2);

      const action = clearBurgerConstructor();
      const result = constructorReducer(state, action);

      expect(result.bun).toBeNull();
      expect(result.ingredients).toEqual([]);
    });

    it('should handle clearing already empty constructor', () => {
      const action = clearBurgerConstructor();
      const result = constructorReducer(initialState, action);

      expect(result.bun).toBeNull();
      expect(result.ingredients).toEqual([]);
    });
  });

  describe('full workflow', () => {
    it('should handle complete burger construction workflow', () => {
      let state = initialState;

      // Add bun
      state = constructorReducer(state, addIngredient(mockBun));
      expect(state.bun?.name).toBe('Краторная булка N-200i');

      // Add ingredients
      state = constructorReducer(state, addIngredient(mockMain));
      state = constructorReducer(state, addIngredient(mockSauce));
      expect(state.ingredients.length).toBe(2);

      // Move ingredient
      state = constructorReducer(
        state,
        moveIngredient({ fromIndex: 0, toIndex: 1 })
      );
      expect(state.ingredients[0].type).toBe('sauce');
      expect(state.ingredients[1].type).toBe('main');

      // Remove ingredient
      const idToRemove = state.ingredients[0].id;
      state = constructorReducer(state, removeIngredient(idToRemove));
      expect(state.ingredients.length).toBe(1);
      expect(state.ingredients[0].type).toBe('main');

      // Clear constructor
      state = constructorReducer(state, clearBurgerConstructor());
      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([]);
    });
  });
});
