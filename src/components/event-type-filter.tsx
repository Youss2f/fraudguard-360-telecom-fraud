"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const eventTypes = [
  "Voice Calls",
  "SMS",
  "Data Sessions",
  "International Calls",
  "Roaming",
  "Recharges",
  "Device Changes",
]

interface EventTypeFilterProps {
  selectedEventTypes: string[]
  onEventTypeChange: (eventTypes: string[]) => void
}

export function EventTypeFilter({ selectedEventTypes, onEventTypeChange }: EventTypeFilterProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (eventType: string) => {
    const newEventTypes = selectedEventTypes.includes(eventType)
      ? selectedEventTypes.filter((e) => e !== eventType)
      : [...selectedEventTypes, eventType]
    onEventTypeChange(newEventTypes)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {selectedEventTypes.length === 0 ? "Select event types..." : `${selectedEventTypes.length} selected`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search event types..." />
          <CommandEmpty>No event type found.</CommandEmpty>
          <CommandGroup>
            {eventTypes.map((eventType) => (
              <CommandItem key={eventType} onSelect={() => handleSelect(eventType)}>
                <Check
                  className={cn("mr-2 h-4 w-4", selectedEventTypes.includes(eventType) ? "opacity-100" : "opacity-0")}
                />
                {eventType}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
