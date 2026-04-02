"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const weekdayLabels = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]
  return (
    <div className={cn("p-3", className)}>
      <div className="grid grid-cols-[36px_repeat(7,minmax(0,1fr))_36px] items-center gap-0 px-0.5 pb-2">
        <div aria-hidden className="h-9 w-9" />
        {weekdayLabels.map((d) => (
          <div
            key={d}
            className="h-9 flex items-center justify-center text-[0.75rem] font-black text-white/55"
          >
            {d}
          </div>
        ))}
        <div aria-hidden className="h-9 w-9" />
      </div>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("", className)}
        classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "grid grid-cols-[36px_1fr_36px] items-center pt-1",
        caption_label: "text-sm font-medium text-center",
        nav: "w-full grid grid-cols-[36px_1fr_36px] items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "justify-self-start",
        nav_button_next: "justify-self-end",
        table: "w-full table-fixed border-separate border-spacing-0",
        // Ocultar cabecera nativa (según versión de react-day-picker)
        head_row: "hidden",
        head_cell: "hidden",
        weekdays: "hidden",
        weekday: "hidden",
        row: "grid grid-cols-7 w-full mt-2",
        cell: "p-0 text-center text-sm relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          const cls = cn("h-4 w-4", className)
          if (orientation === "left") return <ChevronLeft className={cls} {...props} />
          if (orientation === "right") return <ChevronRight className={cls} {...props} />
          if (orientation === "up") return <ChevronUp className={cls} {...props} />
          return <ChevronDown className={cls} {...props} />
        },
      }}
      {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
