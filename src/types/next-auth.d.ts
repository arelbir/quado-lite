// NextAuth type augmentation - Kurumsal Denetim Sistemi için
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ⚠️ DEPRECATED: Use roles[] array instead
      role?: string; 
      roles?: string[]; // ✅ Multi-role system
      superAdmin?: boolean;
      roleId?: string;
      roleDescription?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    // ⚠️ DEPRECATED: Use roles[] array instead
    role?: string;
    roles?: string[]; // ✅ Multi-role system
    superAdmin?: boolean;
    roleId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    // ⚠️ DEPRECATED: Use roles[] array instead
    role?: string;
    roles?: string[]; // ✅ Multi-role system
    superAdmin?: boolean;
    roleId?: string;
    roleDescription?: string;
    image?: string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends DefaultUser {
    // ⚠️ DEPRECATED: Use roles[] array instead
    role?: string;
    roles?: string[]; // ✅ Multi-role system
    superAdmin?: boolean;
    roleId?: string;
    roleDescription?: string;
  }
}
