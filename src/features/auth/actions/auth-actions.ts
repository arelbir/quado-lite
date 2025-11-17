"use server"

import { DEFAULT_LOGIN_REDIRECT } from "@/config/routes";
import { action } from "@/lib/core/safe-action"
import { LoginSchema, NewPasswordSchema, RegisterByAdminSchema, ResetSchema, SignupByTokenSchema, SignupSchema } from "@/schema/auth"
import { signIn, signOut } from "@/server/auth";
import { getUserByEmail, getUserById, updateUserEmail, updateUserPassword } from "@/core/database/queries/user";
import { db } from "@/core/database/client";
import { user, userRoles, roles } from "@/core/database/schema";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { generatePasswordResetToken, generateRegisterEmailVerificationToken, generateVerificationToken } from "@/lib/core/tokens";
import { deletePasswordResetToken, getPasswordResetTokenByToken } from "@/core/database/queries/password-reset-token";
import { sendPasswordResetEmail, sendRegisterEmail, sendVerificationEmail } from "@/server/mail/send-email";
import { deleteVerificationToken, getVerificationTokenByToken } from "@/core/database/queries/verification-token";
import { AuthResponse } from "@/types/actions";
import { deleteNewEmailVerificationToken, getNewEmailVerificationTokenByToken } from "@/core/database/queries/email-verification-token";
import { deleteRegisterVerificationToken, getRegisterVerificationTokenByToken } from "@/core/database/queries/signup-verification-token";
import { normalizeEmailForLogin } from "@/lib/utils/email";


export const login = action<typeof LoginSchema, AuthResponse | undefined>(LoginSchema, async (params: LoginSchema) => {
  // ✅ Normalize email (Turkish chars → ASCII)
  const email = normalizeEmailForLogin(params.email);

  const existingUser = await getUserByEmail(email);

  if (!existingUser?.password || !existingUser.email) {
    return {
      error: "Email does not exist"
    }
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);
    return await sendVerificationEmail({
      email: verificationToken.email,
      token: verificationToken.token,
    });
  }

  try {
    await signIn("credentials", { ...params, email, redirectTo: DEFAULT_LOGIN_REDIRECT });
  } catch (error) {
    if (!(error instanceof AuthError)) throw error;

    switch (error.type) {
      case "CredentialsSignin":
        return {
          error: "Invalid credentials"
        }
      default:
        return {
          error: "An error occurred"
        }
    }
  }
})


export const signup = action<typeof SignupSchema, AuthResponse>(SignupSchema, async (params) => {
  const { email, password, name } = params;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  // Create user with new multi-role system
  const [newUser] = await db.insert(user).values({
    name,
    email,
    password: hashedPassword,
    emailVerified: new Date(), // Auto-verify or send email based on your flow
  }).returning({ id: user.id });

  // Assign default USER role
  const userRole = await db.query.roles.findFirst({
    where: eq(roles.code, 'USER')
  });

  if (userRole && newUser) {
    await db.insert(userRoles).values({
      userId: newUser.id,
      roleId: userRole.id,
      contextType: 'Global',
      isActive: true,
    });
  }

  const verificationToken = await generateVerificationToken(email);

  return await sendVerificationEmail({
    email: verificationToken.email,
    token: verificationToken.token,
  });

})

export const signupByAdmin = action<typeof SignupByTokenSchema, AuthResponse>(SignupByTokenSchema, async (params) => {
  const { password, username, token } = params;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingToken = await getRegisterVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token, please use the link sent to your email to open. " };
  }
  const existingUser = await getUserByEmail(existingToken.email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }
  // Create user with new multi-role system
  const [newUser] = await db.insert(user).values({
    name: username,
    email: existingToken.email,
    password: hashedPassword,
    createdById: existingToken.adminId,
    emailVerified: new Date(),
  }).returning({ id: user.id });

  // Assign default USER role
  const userRole = await db.query.roles.findFirst({
    where: eq(roles.code, 'USER')
  });

  if (userRole && newUser) {
    await db.insert(userRoles).values({
      userId: newUser.id,
      roleId: userRole.id,
      contextType: 'Global',
      isActive: true,
      assignedBy: existingToken.adminId,
    });
  }

  await deleteRegisterVerificationToken(existingToken.id)

  return {
    success: "User created!"
  }
})

// register by admin
export const createByAdmin = action<typeof RegisterByAdminSchema, AuthResponse>(RegisterByAdminSchema, async (params) => {
  const { email, username, adminId } = params;
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  const verificationToken = await generateRegisterEmailVerificationToken({ email, username, adminId });

  return await sendRegisterEmail({
    email: verificationToken.email,
    token: verificationToken.token,
  });
}
)

// register token verification
export const registerVerification = async (token: string) => {

  const existingToken = await getRegisterVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token, please use the link sent to your email to open. " };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }



  return {
    data: {
      email: existingToken.email,
      username: existingToken.name,
    }
  };
}

export const reset = action<typeof ResetSchema, AuthResponse>(ResetSchema, async (params) => {
  const { email } = params;

  const existingUser = await getUserByEmail(email);

  if (!existingUser?.email) {
    return {
      error: "Email does not exist"
    }
  }

  const passwordResetToken = await generatePasswordResetToken(email);


  return await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  )
})


export const newPassword = async (params: NewPasswordSchema, token?: string) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(params);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { password } = validatedFields.data;


  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return {
      error: "Invalid token"
    }
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await updateUserPassword(existingToken.email, { password: hashedPassword })

  deletePasswordResetToken(existingToken.id);

  return {
    success: "Password updated!"
  }
}

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  updateUserEmail(existingUser.id, existingToken.email);

  deleteVerificationToken(existingToken.id);

  return { success: "Email verified!" };
};

export const newEmailVerification = async (token: string) => {
  const existingToken = await getNewEmailVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserById(existingToken.userId);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  updateUserEmail(existingUser.id, existingToken.email);


  deleteNewEmailVerificationToken(existingToken.id);

  return { success: "Email verified!" };
};


export const logout = async () => {
  await signOut();
  revalidatePath("/", "layout");
};
