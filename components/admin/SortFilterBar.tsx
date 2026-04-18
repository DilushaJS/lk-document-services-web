'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FilterIcon } from 'lucide-react'

interface FilterOption {
  label: string
  value: string
}

interface SortOption {
  label: string
  value: string
}

interface SortFilterBarProps {
  sortOptions: SortOption[]
  filterOptions?: {
    [key: string]: FilterOption[]
  }
}

export default function SortFilterBar({ sortOptions, filterOptions }: SortFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get('sort') || sortOptions[0]?.value || ''
  const currentFilters = searchParams.getAll('filter')

  const handleSortChange = (value: string | null) => {
    if (!value) return
    const params = new URLSearchParams(searchParams)
    params.set('sort', value)
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const handleFilterToggle = (category: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    const allFilters = params.getAll('filter')
    const filterKey = `${category}:${value}`

    if (allFilters.includes(filterKey)) {
      params.delete('filter')
      allFilters
        .filter((f) => f !== filterKey)
        .forEach((f) => params.append('filter', f))
    } else {
      params.append('filter', filterKey)
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-3 items-center">
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filterOptions && Object.keys(filterOptions).length > 0 && (
        <Popover>
          <PopoverTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
            <FilterIcon className="h-4 w-4" />
            Filters
            {currentFilters.length > 0 && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
                {currentFilters.length}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-4">
              {Object.entries(filterOptions).map(([category, options]) => (
                <div key={category} className="space-y-2">
                  <Label className="text-sm font-medium capitalize">{category}</Label>
                  <div className="space-y-2">
                    {options.map((option) => {
                      const filterKey = `${category}:${option.value}`
                      const isChecked = currentFilters.includes(filterKey)
                      return (
                        <div key={option.value} className="flex items-center gap-2">
                          <Checkbox
                            id={filterKey}
                            checked={isChecked}
                            onCheckedChange={() =>
                              handleFilterToggle(category, option.value)
                            }
                          />
                          <label
                            htmlFor={filterKey}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {option.label}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
