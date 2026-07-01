import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { getFeeds, clearNewOrderId } from '@slices'; // ✅ Добавьте clearNewOrderId

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, newOrderId } = useSelector((state) => state.feed);

  const handleGetFeeds = useCallback(() => {
    dispatch(getFeeds());
  }, [dispatch]);

  useEffect(() => {
    handleGetFeeds();

    const intervalId = setInterval(() => {
      handleGetFeeds();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [handleGetFeeds]);

  // ✅ Сброс подсветки через 5 секунд после появления нового заказа
  useEffect(() => {
    if (newOrderId) {
      const timer = setTimeout(() => {
        dispatch(clearNewOrderId());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [newOrderId, dispatch]);

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
