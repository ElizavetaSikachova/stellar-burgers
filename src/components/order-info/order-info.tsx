import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useDispatch, useSelector } from '../../services/store';
import { getOrderByNumber } from '../../services/slices/orders-slice';

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();
  const { number } = useParams();
  const orderNumber = Number(number);

  const ingredients: TIngredient[] = useSelector(
    (state) => state.ingredients.items
  );
  const feedOrders = useSelector((state) => state.feed.orders);
  const profileOrders = useSelector((state) => state.orders.orders);
  const orderModalData = useSelector((state) => state.orders.orderModalData);

  const orderData =
    feedOrders.find((order) => order.number === orderNumber) ||
    profileOrders.find((order) => order.number === orderNumber) ||
    (orderModalData?.number === orderNumber ? orderModalData : null);

  useEffect(() => {
    if (!orderData && Number.isFinite(orderNumber)) {
      dispatch(getOrderByNumber(orderNumber));
    }
  }, [dispatch, orderData, orderNumber]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
