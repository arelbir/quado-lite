import { MenuWithChildren, NewUser, User as UserType } from '@/core/database/schema'

export type UserCreate = NewUser

export interface User extends UserType {
  createdBy?: User | null,
  menus?: MenuWithChildren[]
}
