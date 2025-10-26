'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Mail, Phone, Globe, MapPin, FileText, ArrowLeft, Edit } from "lucide-react";

export default function CompanyDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      router.push('/admin/organization/companies');
      return;
    }

    fetch(`/api/companies/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Company not found');
        return res.json();
      })
      .then(data => {
        setCompany(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Company Not Found</h1>
          <Button className="mt-4" asChild>
            <Link href="/admin/organization/companies">Back to Companies</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          <p className="text-muted-foreground">Company Details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/organization/companies">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/organization/companies?edit=${id}`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Badge className={company.isActive ? "bg-green-100 text-green-800" : ""} variant={company.isActive ? "default" : "secondary"}>
            {company.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <p className="text-base font-medium">{company.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Code</label>
              <p className="text-base font-medium">{company.code}</p>
            </div>
            {company.legalName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Legal Name</label>
                <p className="text-base">{company.legalName}</p>
              </div>
            )}
            {company.taxNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tax Number</label>
                <p className="text-base font-mono">{company.taxNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                  {company.email}
                </a>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${company.phone}`} className="hover:underline">
                  {company.phone}
                </a>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {company.website}
                </a>
              </div>
            )}
            {(company.city || company.country) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{[company.city, company.country].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {company.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Address</label>
                <p className="text-sm">{company.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        {company.description && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{company.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Branches */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Branches
            </CardTitle>
            <CardDescription>{company.branches?.length || 0} branch(es)</CardDescription>
          </CardHeader>
          <CardContent>
            {company.branches && company.branches.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {company.branches.map((branch: any) => (
                  <Card key={branch.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-sm text-muted-foreground">{branch.code}</p>
                          {branch.city && <p className="text-xs text-muted-foreground mt-1">{branch.city}</p>}
                        </div>
                        <Badge variant={branch.isActive ? "default" : "secondary"} className="text-xs">
                          {branch.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No branches found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
