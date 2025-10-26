import { MenuWithChildren, NewUser, User as UserType } from '@/drizzle/schema'

export type UserCreate = NewUser

export interface User extends UserType {
  createdBy?: User | null,
  menus?: MenuWithChildren[]
}