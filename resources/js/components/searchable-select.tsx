import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import React, { useState, useMemo, useRef, useEffect } from 'react'

export interface SearchableSelectOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No option found.',
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => option.value === value)

  const filteredOptions = useMemo(() => {
    if (!searchValue) return options
    return options.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearchValue('')
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          'w-full justify-between h-10 px-3 py-2 text-sm transition-all duration-200',
          'border-border bg-background hover:bg-accent/50 hover:border-accent-foreground/20',
          'focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-ring',
          !selectedOption && 'text-muted-foreground',
          open && 'ring-2 ring-ring ring-offset-2 border-ring',
          className
        )}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        {selectedOption ? (
          <div className="flex items-center gap-2 min-w-0">
            {selectedOption.icon && (
              <selectedOption.icon className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{selectedOption.label}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className={cn(
          "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
          open && "rotate-180"
        )} />
      </Button>
      
      {open && (
        <div className={cn(
          "absolute top-full left-0 right-0 z-50 mt-2",
          "border border-border rounded-lg bg-popover shadow-xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "backdrop-blur-sm bg-popover/95"
        )}>
          {/* Search Input */}
          <div className="relative px-3 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-muted/30 border border-border/50 rounded-md 
                         placeholder:text-muted-foreground/60 
                         focus:bg-background focus:border-ring focus:ring-1 focus:ring-ring/20
                         transition-all duration-200 ease-in-out
                         hover:bg-muted/50 hover:border-border"
                autoFocus
              />
            </div>
          </div>
          
          {/* Options List */}
          <div 
            className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            style={{ 
              maxHeight: '200px',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-sm text-muted-foreground mb-1">No results found</div>
                <div className="text-xs text-muted-foreground/70">{emptyMessage}</div>
              </div>
            ) : (
              <div className="p-2">
                {filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-sm",
                      "transition-all duration-150 ease-in-out",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                      "active:scale-[0.98] active:bg-accent/80",
                      value === option.value && "bg-accent text-accent-foreground font-medium",
                      "group"
                    )}
                    onClick={() => {
                      onValueChange?.(option.value === value ? '' : option.value)
                      setOpen(false)
                      setSearchValue('')
                    }}
                    style={{
                      animationDelay: `${index * 20}ms`
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-3 h-4 w-4 shrink-0 transition-all duration-200',
                        value === option.value 
                          ? 'opacity-100 scale-100 text-primary' 
                          : 'opacity-0 scale-75'
                      )}
                    />
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {option.icon && (
                        <option.icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {value === option.value && (
                      <div className="ml-2 h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
