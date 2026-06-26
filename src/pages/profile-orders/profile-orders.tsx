import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { getUserOrders } from '@slices';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.orders);

  useEffect(() => {
    dispatch(getUserOrders());

    const intervalId = setInterval(() => {
      dispatch(getUserOrders());
    }, 5000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
