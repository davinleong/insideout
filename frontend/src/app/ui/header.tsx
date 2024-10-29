// File: components/Header.tsx

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

const Header = () => {
  return (
    <header>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Dashboard</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/dashboard">Register</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          {/* Add more NavigationMenuItem as needed */}
        </NavigationMenuList>
        <NavigationMenuIndicator />
      </NavigationMenu>
    </header>
  );
};

export default Header;