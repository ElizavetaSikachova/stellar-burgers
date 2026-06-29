import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { clearBurgerConstructor } from '../../services/slices/constructor-slice';
import {
  clearOrderModal,
  createOrder
} from '../../services/slices/orders-slice';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const constructorItems = useSelector((state) => state.burgerConstructor);
  const { orderRequest, orderModalData } = useSelector((state) => state.orders);
  const isAuth = useSelector((state) => state.auth.isAuth);

  const onOrderClick = async () => {
    if (
      !constructorItems ||
      !constructorItems.bun ||
      !constructorItems.ingredients ||
      orderRequest
    ) {
      return;
    }

    if (!isAuth) {
      navigate('/login', { state: { from: location } });
      return;
    }

    const ingredientsIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item) => item._id),
      constructorItems.bun._id
    ];

    const resultAction = await dispatch(createOrder(ingredientsIds));

    if (createOrder.fulfilled.match(resultAction)) {
      dispatch(clearBurgerConstructor());
    }
  };

  const closeOrderModal = () => {
    dispatch(clearOrderModal());
  };

  const price = useMemo(() => {
    if (!constructorItems) return 0;
    return (
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      (constructorItems.ingredients?.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ) || 0)
    );
  }, [constructorItems]);

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems || { bun: null, ingredients: [] }}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
