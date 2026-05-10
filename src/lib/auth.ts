import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAllowedEmail, isAuthorized } from "./auth-helpers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    signIn({ profile }) {
      return isAllowedEmail(profile?.email);
    },
    authorized({ auth: session }) {
      return isAuthorized(session);
    },
  },
});
