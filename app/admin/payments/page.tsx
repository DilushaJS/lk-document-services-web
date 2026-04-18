import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateTime, formatCurrency } from '@/lib/utils'
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

const STATUS_BADGE_CONFIG: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { variant: 'outline' },
  paid: { variant: 'default' },
  failed: { variant: 'destructive' },
  refunded: { variant: 'secondary' },
}

function filterAndSortPayments(data: any[], searchTerm: string, sort: string, filters: string[]): any[] {
  let result = data

  // Apply search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    result = result.filter((payment) => {
      const clientName = `${payment.clients?.first_name || ''} ${payment.clients?.last_name || ''}`.toLowerCase()
      const email = (payment.clients?.email || '').toLowerCase()
      const status = (payment.status || '').toLowerCase()
      return clientName.includes(term) || email.includes(term) || status.includes(term)
    })
  }

  // Apply status filter
  if (filters.length > 0) {
    result = result.filter((payment) => {
      return filters.some((filter) => {
        const [category, value] = filter.split(':')
        if (category === 'status') return payment.status === value
        return false
      })
    })
  }

  // Apply sorting
  if (sort === 'amount-high') {
    result.sort((a, b) => Number(b.amount) - Number(a.amount))
  } else if (sort === 'amount-low') {
    result.sort((a, b) => Number(a.amount) - Number(b.amount))
  } else if (sort === 'date-newest') {
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sort === 'date-oldest') {
    result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
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

export default async function PaymentsPage({
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
  const { data: allPayments } = await supabase
    .from('payments')
    .select('*, clients(first_name, last_name, email)')

  // Filter and sort data
  const processedPayments = filterAndSortPayments(allPayments || [], search, sort, filterArray)
  const totalCount = processedPayments.length

  // Paginate filtered data
  const payments = processedPayments.slice(offset, offset + ITEMS_PER_PAGE)

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE)

  // Calculate total collected from all filtered payments
  const total = processedPayments
    .filter((p: any) => p.status === 'paid')
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

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
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-2">All Stripe transactions.</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-right">
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Total Collected</div>
            <div className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(total)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
        <SearchInput />
        <SortFilterBar
          sortOptions={[
            { label: 'Newest First', value: 'date-newest' },
            { label: 'Oldest First', value: 'date-oldest' },
            { label: 'Amount (High to Low)', value: 'amount-high' },
            { label: 'Amount (Low to High)', value: 'amount-low' },
            { label: 'Client Name (A-Z)', value: 'name-asc' },
            { label: 'Client Name (Z-A)', value: 'name-desc' },
          ]}
          filterOptions={{
            status: [
              { label: 'Pending', value: 'pending' },
              { label: 'Paid', value: 'paid' },
              { label: 'Failed', value: 'failed' },
              { label: 'Refunded', value: 'refunded' },
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
                <TableHead>Amount</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Submission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payments ?? []).length > 0 ? (
                (payments ?? []).map((pay: any) => (
                  <TableRow key={pay.id}>
                    <TableCell>
                      <div className="font-medium">
                        {pay.clients?.first_name} {pay.clients?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{pay.clients?.email}</div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(pay.amount)}</TableCell>
                    <TableCell className="capitalize">{pay.provider}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_CONFIG[pay.status]?.variant || 'outline'}>
                        {pay.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(pay.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/submissions/${pay.submission_id}`} className="text-sm hover:font-medium">
                        View →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    {search ? 'No payments match your search.' : 'No payments yet.'}
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