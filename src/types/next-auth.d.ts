// NextAuth type augmentation - Multi-role system
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      roles?: string[]; // Multi-role system
      superAdmin?: boolean;
      email?: string;
      name?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    roles?: string[]; // Multi-role system
    superAdmin?: boolean;
    isActive?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    roles?: string[]; // Multi-role system
    superAdmin?: boolean;
    email?: string;
    name?: string;
    id: string;
    image?: string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends DefaultUser {
    roles?: string[]; // Multi-role system
    superAdmin?: boolean;
    isActive?: boolean;
  }
}
