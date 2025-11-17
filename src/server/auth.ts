import { authConfig } from "@/config/auth";
import { comparePassword } from "@/lib/core/compare";
import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { user } from "@/drizzle/schema";
import { getUserById } from "./data/user";
import { getUserRoles } from "./data/role-menu";
import { normalizeEmailForLogin } from "@/lib/utils/email";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token }) {
      if (!token?.sub) return token
      const existingUser = await getUserById(token.sub)

      if (!existingUser) return token

      // NEW: Multi-role system - Get roles separately (no circular dependency)
      const userRoles = await getUserRoles(token.sub)
      const primaryRole = userRoles?.[0];
      
      token.role = primaryRole?.code || 'user'
      token.image = existingUser.image
      token.superAdmin = primaryRole?.code === 'SUPER_ADMIN'
      token.roleId = primaryRole?.id
      token.roles = userRoles?.map((role: any) => role.code) || []

      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub!;
      }
      if (token.role && session.user) {
        session.user.role = token.role as any
      }

      if (session.user) {
        session.user.superAdmin = token.superAdmin as boolean
        session.user.image = token.image as string
        session.user.roleId = token.roleId as string
        session.user.roles = token.roles as string[]
      }
      return session
    },
    redirect: () => "/"

  },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) throw new Error("Missing credentials");
        if (!credentials.email)
          throw new Error('"email" is required in credentials');
        if (!credentials.password)
          throw new Error('"password" is required in credentials');

        // ✅ Normalize email (Turkish chars → ASCII)
        const normalizedEmail = normalizeEmailForLogin(credentials.email as string);

        // Get user without relations (avoid circular dependency)
        const maybeUser = await db.query.user.findFirst({
          where: eq(user.email, normalizedEmail),
          columns: {
            id: true,
            email: true,
            password: true,
            name: true,
          },
        });

        if (!maybeUser?.password) return null;
        const password = credentials.password as string

        // verify the input password with stored hash
        const isValid = await comparePassword(password, maybeUser.password);
        if (!isValid) return null;
        
        // Get roles separately using manual join (no circular dependency)
        const userRoles = await getUserRoles(maybeUser.id);
        const primaryRole = userRoles?.[0];
        
        return {
          id: maybeUser.id,
          email: maybeUser.email || "",
          name: maybeUser.name || "",
          role: primaryRole?.code || 'user',
          superAdmin: primaryRole?.code === 'SUPER_ADMIN',
          roles: userRoles?.map((role: any) => role.code) || [],
        } as any;
      },
    }),
  ],
})

