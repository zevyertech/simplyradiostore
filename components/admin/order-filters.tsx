'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export function OrderFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const debounce = setTimeout(() => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('page', '1')
      router.push(`/admin?${params.toString()}`)
    }, 300)

    return () => clearTimeout(debounce)
  }, [search, router])

  const clearFilters = () => {
    setSearch('')
    router.push('/admin')
  }

  const hasFilters = !!search

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by first name, last name, or reading type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
