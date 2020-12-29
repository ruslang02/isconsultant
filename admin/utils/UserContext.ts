import { User } from '@common/models/User';
import { createContext } from 'react';

type OptionalUser = Omit<User, 'password'> | null;

type UserContextType = {
  token: string | null;
  user: OptionalUser;
  setUser: (user: OptionalUser) => void;
  setToken: (token: string | null) => void;
};

const UserContext = createContext<UserContextType>({
  token: null,
  user: null,
  setToken: () => {},
  setUser: () => {},
});

export default UserContext;
