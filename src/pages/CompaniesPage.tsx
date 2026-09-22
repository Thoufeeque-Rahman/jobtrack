import { useState } from 'react'
import { Plus, Search, Building2, ExternalLink, Pencil, Trash2, Globe } from 'lucide-react'
import { useCompanies } from '@/features/companies/useCompanies'
import { CompanyFormDialog } from '@/features/companies/CompanyFormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Company, CompanyInput } from '@/types/database'

export default function CompaniesPage() {
  const { companies, loading, error, createCompany, updateCompany, deleteCompany } = useCompanies()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Company | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.industry?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  const handleCreate = (input: CompanyInput) => createCompany(input)
  const handleUpdate = (input: CompanyInput) => {
    if (!editing) return Promise.resolve(false)
    return updateCompany(editing.id, input)
  }

  const openEdit = (company: Company) => {
    setEditing(company)
    setDialogOpen(true)
  }

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    await deleteCompany(deletingId)
    setDeletingId(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Companies</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? '…' : `${companies.length} ${companies.length === 1 ? 'company' : 'companies'}`}
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus />
          Add company
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && companies.length === 0 && (
        <div className="text-center py-20">
          <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-medium text-sm">No companies yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Add companies you're applying to or interested in.
          </p>
          <Button onClick={openCreate} size="sm">
            <Plus />
            Add your first company
          </Button>
        </div>
      )}

      {!loading && !error && companies.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">No companies match "{search}"</p>
        </div>
      )}

      {/* List */}
      {!loading && filtered.length > 0 && (
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {filtered.map((company) => (
            <div
              key={company.id}
              className="flex items-center gap-4 px-4 py-3.5 bg-card hover:bg-accent/40 transition-colors group"
            >
              {/* Icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                <Building2 className="h-4 w-4" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{company.name}</span>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={`Open ${company.name} website`}
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {(company.industry ?? company.notes) && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {[company.industry, company.notes].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Open website"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(company)}
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Edit company"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(company.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  aria-label="Delete company"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <CompanyFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditing(null)
        }}
        company={editing}
        onSubmit={editing ? handleUpdate : handleCreate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete company?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the company record. Linked opportunities and contacts will not be deleted,
              but they'll lose the company association.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
