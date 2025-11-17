import { Menu, MenuWithChildren } from "@/core/database/schema";
import { compare } from "bcryptjs";

export const comparePassword = async (password: string, maybeUserPassword: string) => await compare(password, maybeUserPassword);


export function getMatchMenus(menus: MenuWithChildren[], path: string): Menu | null {
  // Güvenlik kontrolü: menus undefined veya boş ise
  if (!menus || !Array.isArray(menus)) {
    return null;
  }

  const match = menus.find(menu => menu.path === path)
  if (match) return match
  
  for (const menu of menus) {
    if (menu.children?.length) {
      const match = getMatchMenus(menu.children, path)
      if (match) return match
    }
  }
  return null
}
