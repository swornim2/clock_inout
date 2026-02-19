"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

export async function login(password: string) {
  if (password === ADMIN_PASSWORD) {
    cookies().set("admin-session", "true", { httpOnly: true });
    return { success: true };
  } else {
    return { success: false, message: "Invalid password" };
  }
}

export async function logout() {
  cookies().delete("admin-session");
  redirect("/login");
}
