import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import SearchInput from '@/components/admin/SearchInput'
import SortFilterBar from '@/components/admin/SortFilterBar'
import Link from 'next/link'

export const revalidate = 0

const ITEMS_PER_PAGE = 10

async function getRecentLoginAttempts() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('admin_login_attempts')
    .select('*')
    .order('attempted_at', { ascending: false })
    .limit(10)
  return data ?? []
}

async function getStats() {
  const supabase = createAdminClient()

  const [submissions, appointments, messages, payments] = await Promise.all([
    supabase.from('submissions').select('*', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('appointments').select('*', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('contact_messages').select('*', { count: 'exact' }).eq('is_read', false),
    supabase.from('payments').select('*', { count: 'exact' }).eq('status', 'pending'),
  ])

  return {
    pending_submissions: submissions.count ?? 0,
    pending_appointments: appointments.count ?? 0,
    unread_messages: messages.count ?? 0,
    pending_payments: payments.count ?? 0,
  }
}

async function getRecentSubmissions(page: number = 1, search: string = '', sort: string = 'date-newest', filters: string[] = []) {
  const supabase = createAdminClient()
  const offset = (page - 1) * ITEMS_PER_PAGE
  
  const { data: allSubmissions } = await supabase
    .from('submissions')
    .select(`*, clients(first_name, last_name, email, phone)`)
  
  // Filter and sort submissions
  const filtered = filterAndSortSubmissions(allSubmissions || [], search, sort, filters)
  const count = filtered.length
  const data = filtered.slice(offset, offset + ITEMS_PER_PAGE)
  
  return {
    data,
    count
  }
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

  // Apply filters
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
  if (sort === 'date-oldest') {
    result.sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
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
  } else {
    // Default: date-newest
    result.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
  }

  return result
}

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sort?: string; filter?: string | string[] }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const search = params.search || ''
  const sort = params.sort || 'date-newest'
  const filterArray = Array.isArray(params.filter) ? params.filter : params.filter ? [params.filter] : []
  
  const [stats, submissions, loginAttempts] = await Promise.all([
    getStats(),
    getRecentSubmissions(page, search, sort, filterArray),
    getRecentLoginAttempts(),
  ])
  const totalPages = Math.ceil(submissions.count / ITEMS_PER_PAGE)

  const buildPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (sort) params.set('sort', sort)
    filterArray.forEach((f) => params.append('filter', f))
    params.set('page', pageNum.toString())
    return `?${params.toString()}`
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Welcome back. Here is what needs your attention.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/submissions">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{stats.pending_submissions}</div>
              <p className="text-sm text-muted-foreground mt-2">Pending Submissions</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/appointments">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{stats.pending_appointments}</div>
              <p className="text-sm text-muted-foreground mt-2">Pending Appointments</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/submissions">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{stats.unread_messages}</div>
              <p className="text-sm text-muted-foreground mt-2">Unread Messages</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/payments">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{stats.pending_payments}</div>
              <p className="text-sm text-muted-foreground mt-2">Pending Payments</p>
            </CardContent>
          </Card>
        </Link>
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

      {/* Recent Submissions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest service requests from clients</CardDescription>
          </div>
          <Link href="/admin/submissions" className="text-sm text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.data.length > 0 ? (
                submissions.data.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="font-medium">
                        {sub.clients?.first_name} {sub.clients?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{sub.clients?.email}</div>
                    </TableCell>
                    <TableCell>{SERVICE_LABELS[sub.service_type] ?? sub.service_type}</TableCell>
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
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    {search ? 'No submissions match your search.' : 'No recent submissions'}
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

      {/* Login attempts */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #ede6d8', marginTop: '24px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #ede6d8' }}>
          <h2 style={{ fontFamily: 'serif', fontSize: '18px' }}>Recent Login Attempts</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f7f3' }}>
              {['Status', 'IP Address', 'Time', 'User Agent'].map((h) => (
                <th key={h} style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#8a9bb0',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loginAttempts.map((attempt: any, i: number) => (
              <tr key={attempt.id} style={{ borderTop: i > 0 ? '1px solid #f0ebe0' : 'none' }}>
                <td style={{ padding: '12px 24px' }}>
                  <span style={{
                    background: attempt.success ? '#d5f5e3' : '#fde8e6',
                    color: attempt.success ? '#1e8449' : '#922b21',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}>
                    {attempt.success ? 'Success' : 'Failed'}
                  </span>
                </td>
                <td style={{ padding: '12px 24px', fontSize: '13px', fontFamily: 'monospace' }}>
                  {attempt.ip_address}
                </td>
                <td style={{ padding: '12px 24px', fontSize: '13px', color: '#8a9bb0' }}>
                  {formatDateTime(attempt.attempted_at)}
                </td>
                <td style={{ padding: '12px 24px', fontSize: '12px', color: '#8a9bb0', maxWidth: '200px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attempt.user_agent}
                </td>
              </tr>
            ))}
            {loginAttempts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#8a9bb0', fontSize: '14px' }}>
                  No login attempts recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}