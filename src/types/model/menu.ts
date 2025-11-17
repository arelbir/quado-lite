import { Menu } from "@/core/database/schema";

export type MenuWithValue = Omit<Menu, 'icon'> & { value: string }
