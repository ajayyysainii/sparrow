import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-screen w-64 shrink-0 flex-col border-r bg-[hsl(var(--background))]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex h-16 items-center border-b px-6", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex-1 overflow-auto px-3 py-4", className)}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("border-t px-3 py-4", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

interface SidebarNavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

const SidebarNavItem = React.forwardRef<HTMLButtonElement, SidebarNavItemProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
            : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarNavItem.displayName = "SidebarNavItem"

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarNavItem }

