import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { API_BASE_URL } from "./config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          const { data } = res.data;

          if (data?.accessToken && data?.role === "admin") {
            return {
              _id: data.user?._id ?? data._id,
              name: data.user?.name ?? data.name,
              email: data.user?.email ?? data.email,
              role: data.user?.role ?? data.role,
              accessToken: data.accessToken,
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user._id = token._id as string;
      session.user.role = token.role as string;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: { strategy: "jwt" },
});
