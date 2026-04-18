import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import SearchInput from '@/components/admin/SearchInput'
import SortFilterBar from '@/components/admin/SortFilterBar'
import Link from 'next/link'

export const revalidate = 0

const ITEMS_PER_PAGE = 10

const SERVICE_LABELS: Record<string, string> = {
  business_registration: 'Business Registration',
  notary_mobile: 'Mobile Notary',
  notary_home: 'Notary (Home)',
  rent_ejectment: 'Rent / Ejectment',
  immigration: 'Immigration',
  trademark: 'Trademark',
  sri_lankan_documents: 'Sri Lankan Documents',
}

const STATUS_BADGE_CONFIG: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { variant: 'outline' },
  reviewing: { variant: 'secondary' },
  in_progress: { variant: 'secondary' },
  completed: { variant: 'default' },
  cancelled: { variant: 'destructive' },
}

function filterAndSortSubmissions(data: any[], searchTerm: string, sort: string, filters: string[]): any[] {
  let result = data

  // Apply search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    result = result.filter((sub) => {
      const clientName = `${sub.clients?.first_name || ''} ${sub.clients?.last_name || ''}`.toLowerCase()
      const email = (sub.clients?.email || '').toLowerCase()
      const service = (SERVICE_LABELS[sub.service_type] || sub.service_type || '').toLowerCase()
      const status = (sub.status || '').toLowerCase()
      return clientName.includes(term) || email.includes(term) || service.includes(term) || status.includes(term)
    })
  }

  // Apply status and service filters
  if (filters.length > 0) {
    result = result.filter((sub) => {
      return filters.some((filter) => {
        const [category, value] = filter.split(':')
        if (category === 'status') return sub.status === value
        if (category === 'service') return sub.service_type === value
        return false
      })
    })
  }

  // Apply sorting
  if (sort === 'name-asc') {
    result.sort((a, b) => {
      const nameA = `${a.clients?.first_name} ${a.clients?.last_name}`
      const nameB = `${b.clients?.first_name} ${b.clients?.last_name}`
      return nameA.localeCompare(nameB)
    })
  } else if (sort === 'name-desc') {
    result.sort((a, b) => {
      const nameA = `${a.clients?.first_name} ${a.clients?.last_name}`
      const nameB = `${b.clients?.first_name} ${b.clients?.last_name}`
      return nameB.localeCompare(nameA)
    })
  } else if (sort === 'date-newest') {
    result.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
  } else if (sort === 'date-oldest') {
    result.sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
  }

  return result
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sort?: string; filter?: string | string[] }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const search = params.search || ''
  const sort = params.sort || 'date-newest'
  const filterArray = Array.isArray(params.filter) ? params.filter : params.filter ? [params.filter] : []
  const offset = (page - 1) * ITEMS_PER_PAGE

  const supabase = createAdminClient()

  // Get all data
  const { data: allSubmissions } = await supabase
    .from('submissions')
    .select('*, clients(first_name, last_name, email, phone)')

  // Filter and sort data
  const processedSubmissions = filterAndSortSubmissions(allSubmissions || [], search, sort, filterArray)
  const totalCount = processedSubmissions.length

  // Paginate filtered data
  const submissions = processedSubmissions.slice(offset, offset + ITEMS_PER_PAGE)

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE)

  const buildPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (sort) params.set('sort', sort)
    filterArray.forEach((f) => params.append('filter', f))
    params.set('page', pageNum.toString())
    return `?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
        <p className="text-sm text-muted-foreground mt-2">
          All service requests from clients.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
        <SearchInput />
        <SortFilterBar
          sortOptions={[
            { label: 'Newest First', value: 'date-newest' },
            { label: 'Oldest First', value: 'date-oldest' },
            { label: 'Client Name (A-Z)', value: 'name-asc' },
            { label: 'Client Name (Z-A)', value: 'name-desc' },
          ]}
          filterOptions={{
            status: [
              { label: 'Pending', value: 'pending' },
              { label: 'Reviewing', value: 'reviewing' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' },
            ],
            service: [
              { label: 'Business Registration', value: 'business_registration' },
              { label: 'Mobile Notary', value: 'notary_mobile' },
              { label: 'Notary (Home)', value: 'notary_home' },
              { label: 'Rent / Ejectment', value: 'rent_ejectment' },
              { label: 'Immigration', value: 'immigration' },
              { label: 'Trademark', value: 'trademark' },
              { label: 'Sri Lankan Documents', value: 'sri_lankan_documents' },
            ],
          }}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(submissions ?? []).length > 0 ? (
                (submissions ?? []).map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="font-medium">
                        {sub.clients?.first_name} {sub.clients?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{sub.clients?.phone}</div>
                    </TableCell>
                    <TableCell>{SERVICE_LABELS[sub.service_type] ?? sub.service_type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sub.package ? sub.package.charAt(0).toUpperCase() + sub.package.slice(1) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_CONFIG[sub.status]?.variant || 'outline'}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(sub.submitted_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/submissions/${sub.id}`} className="text-sm hover:font-medium">
                        View →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    {search ? 'No submissions match your search.' : 'No submissions yet.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={buildPaginationUrl(page - 1)} />
                </PaginationItem>
              )}

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = i + 1
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href={buildPaginationUrl(pageNum)}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {totalPages > 5 && page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext href={buildPaginationUrl(page + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}