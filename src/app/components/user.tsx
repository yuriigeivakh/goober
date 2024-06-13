"use client";
import { api } from "@goober/trpc/server";
import { type UserRole } from "@prisma/client";
import { useEffect, useState } from "react";
import { deleteIndexedDBUser } from "../utils";

interface UserProps {
  name: string
  role: UserRole
}

const User: React.FC<UserProps> = ({ name, role }) => {
    const [isToggle, setIsToggle] = useState(false);
    const firstLetter = name[0]

    const handleLogout = () => {
      window.dispatchEvent(new Event('userLogout'));
    }

    return isToggle ? (<div>
        {firstLetter}
    </div>) : (
      <div className="flex flex-col gap-2 absolute top-4 left-4 z-20 rounded-sm bg-slate-50 p-4">
        <div>
          {name}
        </div>
        <div>
          {role}
        </div>
        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    )
}

export default User