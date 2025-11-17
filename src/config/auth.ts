import {
  type NextAuthConfig,
  type DefaultSession,
} from "next-auth";

import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/core/database/client";
import { MenuWithChildren, UserRole, user } from "@/core/database/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { NextResponse } from "next/server";
import { authRoutes, publicPages } from "./routes";
import { getMatchMenus } from "@/lib/core/compare";
import { z } from "zod";

const userPermissionResponseSchema = z.object({
  menus: z.array(z.any()),
  role: z.any(),
  superAdmin: z.boolean(),
});

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      role: UserRole;
      superAdmin: boolean;
      roleId: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export const authConfig = {
  session: {
    strategy: "jwt",
  },

  events: {
    async linkAccount({ user: userinfo }) {
      await db.update(user).set({
        emailVerified: new Date()
      }).where(eq(user.id, userinfo.id!))
    }
  },
  adapter: DrizzleAdapter(db),
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  callbacks: {
    async authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname
      
      const isPublicRoute = publicPages.some((page) => pathname.startsWith(page))

      if (isPublicRoute || pathname.startsWith("/api")) return true

      if (!auth?.user) return false
      
      const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/get-user-permission?email=${auth?.user.email}`)
      
      if (!res.ok) {
        console.error('Failed to fetch user permissions');
        return false;
      }
      
      const jsonData = await res.json();
      const validation = userPermissionResponseSchema.safeParse(jsonData);
      
      if (!validation.success) {
        console.error('Invalid permission response:', validation.error);
        return false;
      }
      
      const data = validation.data;

      if (data.superAdmin) return true

      // Allow detail routes (not in menu but use parent permission)
      // Pattern 1: -detail or /detail suffix
      // Pattern 2: UUID in path (e.g., /templates/[uuid], /audits/[uuid])
      if (pathname.includes('-detail') || 
          pathname.includes('/detail') ||
          /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/.test(pathname)) {
        return true;
      }

      // Menus kontrolü
      if (!data.menus || !Array.isArray(data.menus)) {
        return NextResponse.redirect(new URL("/not-found", request.url))
      }

      const hasPermission = getMatchMenus(data.menus as MenuWithChildren[], pathname)

      if (!hasPermission) {
        return NextResponse.redirect(new URL("/not-found", request.url))
      }

      return true
    }
  },
  // we will add more providers later, because bcrypt relies on Node.js APIs not available in Next.js Middleware.
  // https://nextjs.org/learn/dashboard-app/adding-authentication
  providers: []
} satisfies NextAuthConfig


