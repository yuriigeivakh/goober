"use client";

import { redirect, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToast, Select, Input } from '@chakra-ui/react'

import { api } from "@goober/trpc/react";
import { UserRole } from "@prisma/client";
import { setIndexedDBUser, setLocalStorage } from "../utils";
import { useCurrentUser } from "../hooks/useUser";
import { COMMON_ERROR_MESSAGE } from "../constants";

export function CreateUser() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.RIDER);
  const toast = useToast()

  // const user = useCurrentUser();
  // if (user?.id) {
  //   return redirect('/')
  // }
  // console.warn(user, 'user')

  const createPost = api.users.create.useMutation({
    onSuccess: async (user) => {
      router.refresh();
      setName("");
      setRole(UserRole.RIDER);
      const userData = { id: String(user.id), name: user.name, role: user.role };
      await setIndexedDBUser(userData);
    },
    onError: (error) => {
      toast({
        title: 'Uh-oh!',
        description: error?.[0]?.message || COMMON_ERROR_MESSAGE,
      })
    }
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createPost.mutate({ name, role });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 absolute top-4 left-4 z-20"
    >
      <Input
        type="text"
        placeholder="Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
        // className="w-full rounded-full px-4 py-2 text-black"
      />
      <Select name="role" onChange={(e) => setRole(e.target.value as UserRole)}>
        <option value={UserRole.RIDER}>Rider</option>
        <option value={UserRole.DRIVER}>Driver</option>
      </Select>
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={!name || createPost.isPending}
      >
        {createPost.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
