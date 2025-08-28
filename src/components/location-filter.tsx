"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const locations = [
  "NYC_001_A", "NYC_002_B", "NYC_003_C", "BRK_001_A", "QNS_001_A",
  "MAN_001_B", "BRX_001_C", "SI_001_A"
]

interface LocationFilterProps {
  selectedLocations: string[]
  onLocationChange: (locations: string[]) => void
}

export function LocationFilter({ selectedLocations, onLocationChange }: LocationFilterProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (location: string) => {
    const newLocations = selectedLocations.includes(location)
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location]
    onLocationChange(newLocations)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedLocations.length === 0 
            ? "Select locations..." 
            : `${selectedLocations.length} selected`
          }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search locations..." />
          <CommandEmpty>No location found.</CommandEmpty>
          <CommandGroup>
            {locations.map((location) => (
              <CommandItem
                key={location}
                onSelect={() => handleSelect(location)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedLocations.includes(location) ? "opacity-100" : "opacity-0"
                  )}
                />
                {location}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
