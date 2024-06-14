"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
// import { useEffect, useState } from "react";
import { type FC, useEffect } from "react";
import { type UserRole } from "@prisma/client";
import { Button } from 'primereact/button';

interface HomeProps {
    user?: {
        id: number
        name: string
        role: UserRole
    }
}

const Home: FC<HomeProps> = ({ user }) => {
  // const [userId, setUserId] = useState('');
  // const [name, setName] = useState('');
  const handleClick = () => {}

//   const fetchUser = async (userId: string) => {
//     const user = await api.users.getById(userId);
//     setName(user?.name)
//   }

//   useEffect(() => {
//     const userIdFromStorage = getLocalStorage('userId')
//     const nameFromStorage = getLocalStorage('name')
//     const roleFromStorage = getLocalStorage('role')
//     if (userIdFromStorage) {
//       return fetchUser(userIdFromStorage)
//     }
//   }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      Hello {user?.name}
      <div>Role: {user?.role}</div>
      <Button onClick={handleClick}>Change account</Button>
    </main>
  );
}

export default Home

