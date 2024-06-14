"use client";

import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@goober/trpc/react";
import { UserRole } from "@prisma/client";
import { setIndexedDBUser } from "../utils";
import { useCurrentUser } from "../hooks/useUser";
import { COMMON_ERROR_MESSAGE } from "../constants";
import Toast from "./Toast";

export function CreateUser() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.RIDER);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const createPost = api.users.create.useMutation({
    onMutate: () => {
      setToastMessage('')
      setShowToast(false)
    },
    onSuccess: async (user) => {
      router.refresh();
      setName("");
      setRole(UserRole.RIDER);
      const userData = { id: String(user.id), name: user.name, role: user.role };
      await setIndexedDBUser(userData);
    },
    onError: (error) => {
      const errorParsed = JSON.parse(error.message)
      setToastMessage(errorParsed?.[0]?.message || COMMON_ERROR_MESSAGE)
      setShowToast(true)
    }
  });

  const handleCloseToast = () => {
    setShowToast(false);
  };

  const handleSubmit = async () => {
    createPost.mutate({ name, role });
  }

  return (
    <div className="absolute top-4 left-4 z-50 w-[300px] max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <input 
        type="text" 
        id="name" 
        value={name}
        className="bg-gray-50 mb-3 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
        placeholder="Yurii" 
        onChange={(e) => setName(e.target.value)}
        required 
      />
      <select id="role" name="role" onChange={(e) => setRole(e.target.value as UserRole)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <option value={UserRole.RIDER}>Rider</option>
        <option value={UserRole.DRIVER}>Driver</option>
      </select>
      {showToast && (
        <Toast
          type="warning"
          message={toastMessage}
          onClose={handleCloseToast}
        />
      )}
      <button
        className="text-gray-900 w-full mt-4 cursor-pointer bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
        disabled={!name || createPost.isPending}
        onClick={handleSubmit}
      >
        {createPost.isPending ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
