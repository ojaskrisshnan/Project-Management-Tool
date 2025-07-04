import api from './index';

export const fetchUsers = async () => {
  const res = await api.get('/auth/users');
  return res.data;
}; 