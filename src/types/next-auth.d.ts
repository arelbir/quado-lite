// NextAuth type augmentation - Kurumsal Denetim Sistemi için
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string; // Yeni roles sistemi - string (esnek roller)
      superAdmin?: boolean; // Backward compatibility
      roleId?: string;
      roleDescription?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    superAdmin?: boolean;
    roleId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string;
    superAdmin?: boolean;
    roleId?: string;
    roleDescription?: string;
    image?: string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends DefaultUser {
    role?: string;
    superAdmin?: boolean;
    roleId?: string;
    roleDescription?: string;
  }
}
