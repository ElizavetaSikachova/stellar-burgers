import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { updateUser } from '@slices';

export const Profile: FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const updateUserError = useSelector((state) => state.auth.updateUserError);

  const [formValue, setFormValue] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  useEffect(() => {
    setFormValue((prevState) => ({
      ...prevState,
      name: user?.name || '',
      email: user?.email || ''
    }));
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const changedData: { name?: string; email?: string; password?: string } =
      {};

    if (formValue.name !== (user?.name || '')) {
      changedData.name = formValue.name;
    }

    if (formValue.email !== (user?.email || '')) {
      changedData.email = formValue.email;
    }

    if (formValue.password) {
      changedData.password = formValue.password;
    }

    if (!Object.keys(changedData).length) {
      return;
    }

    const resultAction = await dispatch(updateUser(changedData));

    if (updateUser.fulfilled.match(resultAction)) {
      setFormValue((prevState) => ({
        ...prevState,
        password: ''
      }));
    }
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    setFormValue({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      updateUserError={updateUserError || undefined}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
