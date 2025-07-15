"use client";

import { useUser } from "@/features/auth/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Image from "next/image";

export default function HomePage() {
  const { userEmail, loading } = useUser();
  const router = useRouter();
  const { signIn } = useAuth();

  useEffect(() => {
    if (!loading && userEmail) {
      router.push("/dashboard");
    }
  }, [loading, userEmail, router]);

  if (loading) {
    return <p className="text-center mt-10">Загрузка...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Добро пожаловать в JobTracker ✨
      </h1>
      <div className="flex  items-center flex-col gap-4">
        <div className="flex gap-4 ">
          <Link
            href="/login"
            className="bg-blue-600  items-center text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="bg-gray-100  items-center text-gray-800 px-6 py-2 rounded hover:bg-gray-200 transition"
          >
            Зарегистрироваться
          </Link>
        </div>
        <div className="flex gap-8">
          <button
            onClick={() => signIn("google")}
            className="flex items-center bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-200 transition  gap-2"
          >
            <Image
              src="/google-icon-logo-svgrepo-com.svg"
              alt="Google"
              width={20}
              height={20}
            />
            <span className="ml-2">Войти через Google</span>
          </button>

          <button
            onClick={() => signIn("linkedin_oidc")}
            className="flex items-center bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-200 transition gap-2"
          >
            <Image
              src="/linkedin-icon-logo-svgrepo-com.svg"
              alt="LinkedIn"
              width={24}
              height={24}
            />
            <span className="ml-2">Войти через LinkedIn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
