import { useSelector } from 'react-redux';

export const useAuth = () => {
  const authState = useSelector((state) => state.auth);
  return authState;
};
