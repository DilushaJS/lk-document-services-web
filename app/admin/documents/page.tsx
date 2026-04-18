import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import SearchInput from '@/components/admin/SearchInput'
import SortFilterBar from '@/components/admin/SortFilterBar'
import Link from 'next/link'

export const revalidate = 0

const ITEMS_PER_PAGE = 10

function filterAndSortDocuments(data: any[], searchTerm: string, sort: string, filters: string[]): any[] {
  let result = data

  // Apply search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    result = result.filter((doc) => {
      const clientName = `${doc.clients?.first_name || ''} ${doc.clients?.last_name || ''}`.toLowerCase()
      const email = (doc.clients?.email || '').toLowerCase()
      const fileName = (doc.file_name || '').toLowerCase()
      const docType = (doc.document_type || '').toLowerCase()
      return clientName.includes(term) || email.includes(term) || fileName.includes(term) || docType.includes(term)
    })
  }

  // Apply document type filter
  if (filters.length > 0) {
    result = result.filter((doc) => {
      return filters.some((filter) => {
        const [category, value] = filter.split(':')
        if (category === 'type') return doc.document_type === value
        return false
      })
    })
  }

  // Apply sorting
  if (sort === 'date-newest') {
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sort === 'date-oldest') {
    result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  } else if (sort === 'size-largest') {
    result.sort((a, b) => (b.file_size || 0) - (a.file_size || 0))
  } else if (sort === 'size-smallest') {
    result.sort((a, b) => (a.file_size || 0) - (b.file_size || 0))
  } else if (sort === 'name-asc') {
    result.sort((a, b) => (a.file_name || '').localeCompare(b.file_name || ''))
  } else if (sort === 'name-desc') {
    result.sort((a, b) => (b.file_name || '').localeCompare(a.file_name || ''))
  }

  return result
}

export default async function DocumentsPage({
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
  const { data: allDocuments } = await supabase
    .from('documents')
    .select('*, clients(first_name, last_name, email)')

  // Filter and sort data
  const processedDocuments = filterAndSortDocuments(allDocuments || [], search, sort, filterArray)
  const totalCount = processedDocuments.length

  // Paginate filtered data
  const documents = processedDocuments.slice(offset, offset + ITEMS_PER_PAGE)

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
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground mt-2">
          All uploaded files from clients.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
        <SearchInput />
        <SortFilterBar
          sortOptions={[
            { label: 'Newest First', value: 'date-newest' },
            { label: 'Oldest First', value: 'date-oldest' },
            { label: 'File Name (A-Z)', value: 'name-asc' },
            { label: 'File Name (Z-A)', value: 'name-desc' },
            { label: 'Size (Largest)', value: 'size-largest' },
            { label: 'Size (Smallest)', value: 'size-smallest' },
          ]}
          filterOptions={{
            type: [
              { label: 'ID', value: 'id' },
              { label: 'Proof of Address', value: 'proof_of_address' },
              { label: 'Business License', value: 'business_license' },
              { label: 'Power of Attorney', value: 'power_of_attorney' },
              { label: 'Birth Certificate', value: 'birth_certificate' },
              { label: 'Marriage Certificate', value: 'marriage_certificate' },
              { label: 'Divorce Decree', value: 'divorce_decree' },
              { label: 'Other', value: 'other' },
            ],
          }}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(documents ?? []).length > 0 ? (
                (documents ?? []).map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="font-medium">{doc.file_name}</div>
                      <div className="text-sm text-muted-foreground">{doc.mime_type}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {doc.clients?.first_name} {doc.clients?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{doc.clients?.email}</div>
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {doc.document_type?.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(doc.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/submissions/${doc.submission_id}`} className="text-sm hover:font-medium">
                        View →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    {search ? 'No documents match your search.' : 'No documents uploaded yet.'}
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