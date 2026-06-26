import { forwardRef, useMemo } from 'react';
import { TIngredientsCategoryProps } from './type';
import { TIngredient } from '@utils-types';
import { IngredientsCategoryUI } from '../ui/ingredients-category';
import { useSelector } from '../../services/store';

export const IngredientsCategory = forwardRef<
  HTMLUListElement,
  TIngredientsCategoryProps
>(({ title, titleRef, ingredients }, ref) => {
  const burgerConstructor = useSelector((state) => state.constructor);

  const ingredientsCounters = useMemo(() => {
    // ✅ Защита от undefined
    if (!burgerConstructor) {
      return {};
    }

    const { bun, ingredients: ctorIngredients } = burgerConstructor;
    const counters: { [key: string]: number } = {};

    // ✅ Проверяем, что ctorIngredients существует и является массивом
    if (ctorIngredients && Array.isArray(ctorIngredients)) {
      ctorIngredients.forEach((ingredient: TIngredient) => {
        if (ingredient && ingredient._id) {
          if (!counters[ingredient._id]) counters[ingredient._id] = 0;
          counters[ingredient._id]++;
        }
      });
    }

    // ✅ Проверяем, что bun существует
    if (bun && bun._id) {
      counters[bun._id] = 2;
    }

    return counters;
  }, [burgerConstructor]);

  return (
    <IngredientsCategoryUI
      title={title}
      titleRef={titleRef}
      ingredients={ingredients}
      ingredientsCounters={ingredientsCounters}
      ref={ref}
    />
  );
});
