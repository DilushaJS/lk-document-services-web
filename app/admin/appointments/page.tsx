import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import SearchInput from '@/components/admin/SearchInput'
import SortFilterBar from '@/components/admin/SortFilterBar'
import Link from 'next/link'

export const revalidate = 0

const ITEMS_PER_PAGE = 10

const STATUS_BADGE_CONFIG: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { variant: 'outline' },
  confirmed: { variant: 'default' },
  rescheduled: { variant: 'secondary' },
  completed: { variant: 'default' },
  cancelled: { variant: 'destructive' },
}

const SERVICE_LABELS: Record<string, string> = {
  notary_mobile: 'Mobile Notary',
  notary_home: 'Notary (Home)',
  rent_ejectment: 'Rent / Ejectment',
  intellectual_property: 'IP Services',
  immigration: 'Immigration',
  trademark: 'Trademark',
  sri_lankan_documents: 'Sri Lankan Documents',
}

function filterAndSortAppointments(data: any[], searchTerm: string, sort: string, filters: string[]): any[] {
  let result = data

  // Apply search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    result = result.filter((apt) => {
      const clientName = `${apt.clients?.first_name || ''} ${apt.clients?.last_name || ''}`.toLowerCase()
      const email = (apt.clients?.email || '').toLowerCase()
      const service = (SERVICE_LABELS[apt.service_type] || apt.service_type || '').toLowerCase()
      const status = (apt.status || '').toLowerCase()
      return clientName.includes(term) || email.includes(term) || service.includes(term) || status.includes(term)
    })
  }

  // Apply status and service filters
  if (filters.length > 0) {
    result = result.filter((apt) => {
      return filters.some((filter) => {
        const [category, value] = filter.split(':')
        if (category === 'status') return apt.status === value
        if (category === 'service') return apt.service_type === value
        return false
      })
    })
  }

  // Apply sorting
  if (sort === 'date-soonest') {
    result.sort((a, b) => new Date(a.requested_date).getTime() - new Date(b.requested_date).getTime())
  } else if (sort === 'date-latest') {
    result.sort((a, b) => new Date(b.requested_date).getTime() - new Date(a.requested_date).getTime())
  } else if (sort === 'name-asc') {
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
  }

  return result
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sort?: string; filter?: string | string[] }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const search = params.search || ''
  const sort = params.sort || 'date-soonest'
  const filterArray = Array.isArray(params.filter) ? params.filter : params.filter ? [params.filter] : []
  const offset = (page - 1) * ITEMS_PER_PAGE

  const supabase = createAdminClient()
  
  // Get all data
  const { data: allAppointments } = await supabase
    .from('appointments')
    .select('*, clients(first_name, last_name, email, phone)')

  // Filter and sort data
  const processedAppointments = filterAndSortAppointments(allAppointments || [], search, sort, filterArray)
  const totalCount = processedAppointments.length

  // Paginate filtered data
  const appointments = processedAppointments.slice(offset, offset + ITEMS_PER_PAGE)

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
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-sm text-muted-foreground mt-2">
          All appointment requests. Confirm or reschedule from here.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
        <SearchInput />
        <SortFilterBar
          sortOptions={[
            { label: 'Date - Soonest First', value: 'date-soonest' },
            { label: 'Date - Latest First', value: 'date-latest' },
            { label: 'Client Name (A-Z)', value: 'name-asc' },
            { label: 'Client Name (Z-A)', value: 'name-desc' },
          ]}
          filterOptions={{
            status: [
              { label: 'Pending', value: 'pending' },
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Rescheduled', value: 'rescheduled' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' },
            ],
            service: [
              { label: 'Mobile Notary', value: 'notary_mobile' },
              { label: 'Notary (Home)', value: 'notary_home' },
              { label: 'Rent / Ejectment', value: 'rent_ejectment' },
              { label: 'IP Services', value: 'intellectual_property' },
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
                <TableHead>Requested Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(appointments ?? []).length > 0 ? (
                (appointments ?? []).map((apt: any) => (
                  <TableRow key={apt.id}>
                    <TableCell>
                      <div className="font-medium">
                        {apt.clients?.first_name} {apt.clients?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{apt.clients?.phone}</div>
                    </TableCell>
                    <TableCell>{SERVICE_LABELS[apt.service_type] ?? apt.service_type}</TableCell>
                    <TableCell>{formatDate(apt.requested_date)}</TableCell>
                    <TableCell>{apt.confirmed_time ?? apt.requested_time}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {apt.location_address ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_CONFIG[apt.status]?.variant || 'outline'}>
                        {apt.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    {search ? 'No appointments match your search.' : 'No appointments yet.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={buildPaginationUrl(page - 1)} />
              </PaginationItem>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isCurrentPage = pageNum === page
              const isVisible =
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= page - 2 && pageNum <= page + 2)

              if (!isVisible) {
                if (pageNum === page - 3) {
                  return (
                    <PaginationItem key="ellipsis-before">
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                if (pageNum === page + 3) {
                  return (
                    <PaginationItem key="ellipsis-after">
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              }

              return (
                <PaginationItem key={pageNum} className={isCurrentPage ? 'pointer-events-none' : ''}>
                  <PaginationLink
                    href={buildPaginationUrl(pageNum)}
                    isActive={isCurrentPage}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={buildPaginationUrl(page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}