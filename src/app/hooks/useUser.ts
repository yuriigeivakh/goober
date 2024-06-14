/* eslint-disable @typescript-eslint/no-misused-promises */
'use client'
import { useEffect, useState } from 'react';
import { deleteIndexedDBUser, getIndexedDBUser } from '../utils';
import { type UserRole } from '@prisma/client';

export const useCurrentUser = () => {
  const [user, setUser] = useState<{ id: string; name: string; role: UserRole } | null>(null);

  const fetchUser = async () => {
    const userData = await getIndexedDBUser();
    setUser(userData as any);
  };

  useEffect(() => {
    fetchUser();

    window.addEventListener("userLogout", handleUserLogout);
    window.addEventListener("userLoggedIn", fetchUser);

    return () => {
      window.removeEventListener("userLogout", handleUserLogout);
      window.removeEventListener("userLoggedIn", handleUserLogout);
    };
  }, []);

  const handleUserLogout = () => {
    setUser(null);
    return deleteIndexedDBUser()
  };

  return user;
};
