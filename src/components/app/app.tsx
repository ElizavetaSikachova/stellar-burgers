import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';
import { useDispatch, useSelector } from '../../services/store';
import { getIngredients, getUser } from '@slices';
import { getCookie } from '../../utils/cookie';
import styles from './app.module.css';
import '../../index.css';

import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute
} from '@components';
import { Preloader } from '@ui';

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const background = location.state?.background;

  const {
    isLoading: isIngredientsLoading,
    items: ingredients,
    error
  } = useSelector((state) => state.ingredients);

  useEffect(() => {
    dispatch(getIngredients());

    if (getCookie('accessToken')) {
      dispatch(getUser());
    }
  }, [dispatch]);

  const closeModal = () => navigate(-1);

  return (
    <div className={styles.app}>
      <AppHeader />
      <>
        <Routes location={background || location}>
          <Route
            path='/'
            element={
              isIngredientsLoading ? (
                <Preloader />
              ) : error ? (
                <div
                  className={`${styles.error} text text_type_main-medium pt-4`}
                >
                  {error}
                </div>
              ) : ingredients.length > 0 ? (
                <ConstructorPage />
              ) : (
                <div
                  className={`${styles.title} text text_type_main-medium pt-4`}
                >
                  Нет игредиентов
                </div>
              )
            }
          />
          <Route path='/feed' element={<Feed />} />

          <Route
            path='/login'
            element={<ProtectedRoute onlyUnAuth component={<Login />} />}
          />
          <Route
            path='/register'
            element={<ProtectedRoute onlyUnAuth component={<Register />} />}
          />
          <Route
            path='/forgot-password'
            element={
              <ProtectedRoute onlyUnAuth component={<ForgotPassword />} />
            }
          />
          <Route
            path='/reset-password'
            element={
              <ProtectedRoute onlyUnAuth component={<ResetPassword />} />
            }
          />
          <Route
            path='/profile'
            element={<ProtectedRoute component={<Profile />} />}
          />
          <Route
            path='/profile/orders'
            element={<ProtectedRoute component={<ProfileOrders />} />}
          />

          <Route path='/ingredients/:id' element={<IngredientDetails />} />
          <Route path='/feed/:number' element={<OrderInfo />} />
          <Route
            path='/profile/orders/:number'
            element={<ProtectedRoute component={<OrderInfo />} />}
          />

          <Route path='*' element={<NotFound404 />} />
        </Routes>

        {background && (
          <Routes>
            <Route
              path='/ingredients/:id'
              element={
                <Modal title='Детали ингредиента' onClose={closeModal}>
                  <IngredientDetails />
                </Modal>
              }
            />
            <Route
              path='/feed/:number'
              element={
                <Modal title='Информация о заказе' onClose={closeModal}>
                  <OrderInfo />
                </Modal>
              }
            />
            <Route
              path='/profile/orders/:number'
              element={
                <ProtectedRoute
                  component={
                    <Modal title='Информация о заказе' onClose={closeModal}>
                      <OrderInfo />
                    </Modal>
                  }
                />
              }
            />
          </Routes>
        )}
      </>
    </div>
  );
};

export default App;
