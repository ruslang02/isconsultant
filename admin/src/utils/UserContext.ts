import { GetUserInfoDto } from '@common/dto/get-user-info.dto';
import { createContext } from 'react';

type UserContextType = {
  token: string | null;
  user: GetUserInfoDto | null;
  setUser: (user: GetUserInfoDto | null) => void;
  setToken: (token: string | null) => void;
};

const UserContext = createContext<UserContextType>({
  token: null,
  user: null,
  setToken: () => {},
  setUser: () => {},
});

export default UserContext;
