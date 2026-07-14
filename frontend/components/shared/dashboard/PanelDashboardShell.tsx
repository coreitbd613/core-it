"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, ReactNode, Suspense } from "react";
import { useTheme } from "next-themes";
import {
  ChevronRight,
  ChevronsUpDown,
  House,
  LogOut,
  Moon,
  Sun,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export type PanelNavItem = {
  name: string;
  href: string;
  icon: ReactNode;
  children?: { name: string; href: string; exact?: boolean }[];
};

type UserMenuItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  hidden?: boolean;
  icon?: ReactNode;
};

type HeaderAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  className?: string;
};

type PanelDashboardShellProps = {
  children: ReactNode;
  panelHomeHref: string;
  navItems: PanelNavItem[];
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
  profileHref: string;
  onLogout: () => void;
  loading?: boolean;
  userMenuItems?: UserMenuItem[];
  headerActions?: HeaderAction[];
  footer?: ReactNode;
};

export default function PanelDashboardShell({
  children,
  panelHomeHref,
  navItems,
  user,
  profileHref,
  onLogout,
  loading = false,
  userMenuItems = [],
  headerActions = [],
  footer,
}: PanelDashboardShellProps) {
  const pathname = usePathname();
  const breadcrumbItems = getBreadcrumbItems(pathname, navItems);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Suspense fallback={null}>
          <PanelSidebar
            navItems={navItems}
            panelHomeHref={panelHomeHref}
            user={user}
            profileHref={profileHref}
            onLogout={onLogout}
            loading={loading}
            userMenuItems={userMenuItems}
          />
        </Suspense>
        <SidebarInset className="min-w-0 bg-muted/20">
          <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-3 md:h-16 md:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
              <Breadcrumb className="min-w-0">
                <BreadcrumbList className="flex-nowrap">
                  {breadcrumbItems.map((item, index) => {
                    const isLast = index === breadcrumbItems.length - 1;

                    return (
                      <Fragment key={`${item.href}-${item.label}`}>
                        <BreadcrumbItem className={cn(isLast ? "min-w-0" : "hidden sm:flex", index === 0 && "sm:hidden md:flex")}>
                          {isLast ? (
                            <BreadcrumbPage className="max-w-[42vw] truncate text-sm font-medium md:max-w-140">
                              {item.label}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link href={item.href}>{item.label}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!isLast ? (
                          <BreadcrumbSeparator className={cn("hidden sm:flex", index === 0 && "sm:hidden md:flex")} />
                        ) : null}
                      </Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button asChild variant="outline" size="sm" className="size-9 gap-2 px-0 sm:w-auto sm:px-3">
                <Link href="/" aria-label="Back to Home">
                  <House className="size-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              </Button>
              {headerActions.map((item) => (
                item.href ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className={cn("size-9 gap-2 px-0 sm:w-auto sm:px-3", item.className)}
                    key={item.label}
                  >
                    <Link href={item.href} aria-label={item.label}>
                      {item.icon}
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("size-9 gap-2 px-0 sm:w-auto sm:px-3", item.className)}
                    onClick={item.onClick}
                    aria-label={item.label}
                    key={item.label}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                )
              ))}
            </div>
          </header>

          <main className="min-w-0 flex-1 px-3 py-4 pb-8 md:px-0 md:py-6">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
            {footer ? <div className="mx-auto w-full max-w-7xl">{footer}</div> : null}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function PanelSidebar({
  navItems,
  panelHomeHref,
  user,
  profileHref,
  onLogout,
  loading,
  userMenuItems,
}: {
  navItems: PanelNavItem[];
  panelHomeHref: string;
  user: PanelDashboardShellProps["user"];
  profileHref: string;
  onLogout: () => void;
  loading: boolean;
  userMenuItems: UserMenuItem[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const { isMobile, setOpenMobile } = useSidebar();
  const menuButtonClassName = "h-10 gap-3 text-base [&_svg]:size-5";
  const subMenuButtonClassName = "h-8 text-sm";

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="mx-auto w-full max-w-5xl">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton  asChild>
              <Link href={panelHomeHref}>
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-background ring-1 ring-border">
                  <Image src="/favicon.jpeg" alt="Core IT" width={32} height={32} className="object-cover" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Core IT</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="mx-auto w-full max-w-5xl">
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const active = isNavActive(pathname, currentSearch, item);

              if (item.children?.length) {
                return (
                  <Collapsible key={item.name} asChild defaultOpen={active} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.name}
                          isActive={active || undefined}
                          className={menuButtonClassName}
                        >
                          {item.icon}
                          <span>{item.name}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isChildNavActive(pathname, currentSearch, child) || undefined}
                                className={subMenuButtonClassName}
                              >
                                <Link href={child.href} onClick={handleNavClick}>
                                  <span>{child.name}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    isActive={active || undefined}
                    className={menuButtonClassName}
                  >
                    <Link href={item.href} onClick={handleNavClick}>
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} profileHref={profileHref} onLogout={onLogout} loading={loading} userMenuItems={userMenuItems} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavUser({
  user,
  profileHref,
  onLogout,
  loading,
  userMenuItems,
}: {
  user: PanelDashboardShellProps["user"];
  profileHref: string;
  onLogout: () => void;
  loading: boolean;
  userMenuItems: UserMenuItem[];
}) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const initials = getInitials(user.name);

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton  className="pointer-events-none">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="grid flex-1 gap-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={profileHref}>
                <User />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {theme === "dark" ? <Moon /> : <Sun />}
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">
                    <Sun />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon />
                    Dark
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {userMenuItems.filter((item) => !item.hidden).map((item) => (
              item.href ? (
                <DropdownMenuItem asChild key={item.label}>
                  <Link href={item.href}>
                    {item.icon}
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={item.label} onClick={item.onClick}>
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              )
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} variant="destructive">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function isNavActive(pathname: string, currentSearch: string, item: PanelNavItem) {
  if (item.children?.some((child) => isChildNavActive(pathname, currentSearch, child))) {
    return true;
  }

  return isPathActive(pathname, item.href);
}

function isPathActive(pathname: string, href: string) {
  const [targetPath] = href.split("?");
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}

function isChildNavActive(
  pathname: string,
  currentSearch: string,
  child: NonNullable<PanelNavItem["children"]>[number] | string,
) {
  const href = typeof child === "string" ? child : child.href;
  const exact = typeof child === "string" ? false : child.exact;
  const [targetPath, targetSearch = ""] = href.split("?");

  if (targetSearch) {
    if (pathname !== targetPath) return false;

    const currentParams = new URLSearchParams(currentSearch);
    const targetParams = new URLSearchParams(targetSearch);

    for (const [key, value] of targetParams.entries()) {
      if (currentParams.get(key) !== value) return false;
    }

    return true;
  }

  if (currentSearch) return false;
  return exact ? pathname === targetPath : isPathActive(pathname, href);
}

function getBreadcrumbItems(pathname: string, navItems: PanelNavItem[]) {
  const flattened = navItems.flatMap((item) => [
    { label: item.name, href: item.href },
    ...(item.children || []).map((child) => ({ label: child.name, href: child.href })),
  ]);
  const exact = flattened.find((item) => pathname === item.href);
  const nearest = exact || flattened
    .filter((item) => pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const currentLabel = nearest?.label || formatSegment(pathname.split("/").filter(Boolean).at(-1) || "Dashboard");
  const leafSegment = pathname.split("/").filter(Boolean).at(-1);

  if (!exact && nearest && leafSegment) {
    return [
      { label: nearest.label, href: nearest.href },
      { label: formatSegment(leafSegment), href: pathname },
    ];
  }

  return [{ label: currentLabel, href: pathname }];
}

function formatSegment(segment: string) {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "U";
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
}
