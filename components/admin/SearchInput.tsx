'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'

export default function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.get('search') || ''
  const [search, setSearch] = useState(currentSearch)

  const handleSearch = (value: string) => {
    setSearch(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    // Reset to page 1 when searching
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="w-full md:w-64">
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-10"
      />
    </div>
  )
}
