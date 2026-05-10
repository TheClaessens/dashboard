import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { isValidCredentials, isAuthorized } from "./auth-helpers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        if (!isValidCredentials(credentials?.email, credentials?.password)) {
          return null;
        }
        return { id: "1", email: credentials.email as string };
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session }) {
      return isAuthorized(session);
    },
  },
});
