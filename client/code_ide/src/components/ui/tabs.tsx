"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* Tabs Root                                                                  */
/* -------------------------------------------------------------------------- */

type TabsOrientation = "horizontal" | "vertical"

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  orientation?: TabsOrientation
}

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2",
        orientation === "horizontal" && "flex-col",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Tabs List Variants                                                        */
/* -------------------------------------------------------------------------- */

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/* -------------------------------------------------------------------------- */
/* Tabs List                                                                 */
/* -------------------------------------------------------------------------- */

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Tabs Trigger                                                              */
/* -------------------------------------------------------------------------- */

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex flex-1 items-center justify-center gap-1.5",
        "rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap",
        "text-foreground/60 transition-all",
        "hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",

        "data-[state=active]:bg-background data-[state=active]:text-foreground",

        "group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start",

        "group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",

        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Tabs Content                                                             */
/* -------------------------------------------------------------------------- */

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
