import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { type Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'

type InfiniteDataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export function InfiniteDataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  searchValue = '',
  onSearchChange,
}: InfiniteDataTableFacetedFilterProps<TData, TValue>) {
  const [open, setOpen] = useState(false)
  const [currentSearchValue, setCurrentSearchValue] = useState(searchValue)
  const listRef = useRef<HTMLDivElement>(null)
  
  const selectedValues = new Set(column?.getFilterValue() as string[])

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!currentSearchValue) return options
    return options.filter(option =>
      option.label.toLowerCase().includes(currentSearchValue.toLowerCase())
    )
  }, [options, currentSearchValue])

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setCurrentSearchValue(value)
    onSearchChange?.(value)
  }, [onSearchChange])

  // Handle scroll to load more
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
      onLoadMore?.()
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setCurrentSearchValue('')
      onSearchChange?.('')
    }
  }, [open, onSearchChange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircledIcon className='size-4' />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValues.size}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                {selectedValues.size > 2 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant='secondary'
                        key={option.value}
                        className='rounded-sm px-1 font-normal'
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <CommandInput 
            placeholder={title} 
            value={currentSearchValue}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <div
                ref={listRef}
                className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                onScroll={handleScroll}
              >
                {filteredOptions.map((option) => {
                  const isSelected = selectedValues.has(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        if (isSelected) {
                          selectedValues.delete(option.value)
                        } else {
                          selectedValues.add(option.value)
                        }
                        const filterValues = Array.from(selectedValues)
                        column?.setFilterValue(
                          filterValues.length ? filterValues : undefined
                        )
                      }}
                    >
                      <div
                        className={cn(
                          'border-primary flex size-4 items-center justify-center rounded-sm border',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <CheckIcon className={cn('text-background h-4 w-4')} />
                      </div>
                      {option.icon && (
                        <option.icon className='text-muted-foreground size-4' />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  )
                })}
                {/* Load More Indicator */}
                {hasNextPage && (
                  <div className="px-2 py-1 border-t border-border/30">
                    {isFetchingNextPage ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-sm text-muted-foreground hover:text-foreground"
                        onClick={onLoadMore}
                      >
                        Load more...
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className='justify-center text-center'
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
