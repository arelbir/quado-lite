"use client";

import { useState } from "react";
import { createColumns, type Company } from "./columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableFilterField } from "@/types/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompanyDialog } from "@/features/organization/components/company-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteCompany } from "@/features/organization/actions/organization-actions";

interface CompaniesTableClientProps {
  companies: Company[];
}

export function CompaniesTableClient({ companies }: CompaniesTableClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setDialogOpen(true);
  };

  const handleDelete = (company: Company) => {
    setDeletingCompany(company);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCompany) return;

    const result = await deleteCompany(deletingCompany.id);
    
    if (result.success) {
      toast.success("Company deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingCompany(null);
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to delete company");
    }
  };

  const columns = createColumns(handleEdit, handleDelete);
  const filterFields: DataTableFilterField<Company>[] = [
    {
      label: "Search",
      value: "name" as keyof Company,
      placeholder: "Search companies...",
    },
    {
      label: "Status",
      value: "isActive" as keyof Company,
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
  ];

  const { table } = useDataTable({
    data: companies,
    columns,
    pageCount: -1, // Client-side pagination
    filterFields,
    defaultPerPage: 10,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DataTableToolbar table={table} filterFields={filterFields} />
        <Button
          onClick={() => {
            setEditingCompany(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Company
        </Button>
      </div>
      <DataTable
        table={table}
        title="Companies"
        description="Manage your organization's companies"
      />

      {/* Company Dialog */}
      <CompanyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        company={editingCompany}
        onSuccess={() => window.location.reload()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCompany?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
