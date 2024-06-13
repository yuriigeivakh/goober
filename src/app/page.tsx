"use client";

import { CreateUser } from './components/create-user';
import Map from './components/map';
import User from './components/user';
import { useCurrentUser } from './hooks/useUser';

export default function Index() {
  const user = useCurrentUser();

  return (
    <div>
      {user?.name ? (
        <User name={user?.name} role={user?.role}/>
      ) : (
        <CreateUser />
      )}
      <Map />
    </div>
  )
}

