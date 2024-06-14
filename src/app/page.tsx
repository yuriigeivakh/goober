"use client";

import NavBar from './components/NavBar';
import { CreateUser } from './components/create-user';
import Map from './components/map';
import User from './components/user';
import { useCurrentUser } from './hooks/useUser';

export default function Index() {
  const user = useCurrentUser();

  return (
    <div className="relative w-screen" style={{height: 'calc(100vh - 72px)'}}>
      {user?.name ? (
        <User name={user?.name} role={user?.role}/>
      ) : (
        <CreateUser />
      )}
      <Map userId={user?.id}/>
    </div>
  )
}

