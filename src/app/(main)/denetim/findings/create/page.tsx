'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const formSchema = z.object({
  title: z.string().min(3, "En az 3 karakter gerekli"),
  description: z.string().min(10, "En az 10 karakter gerekli"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  auditId: z.string().min(1, 'Audit ID zorunludur'),
  questionId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateFindingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auditId = searchParams.get('auditId');
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const t = useTranslations('finding');
  const tCommon = useTranslations('common');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: 'MEDIUM',
      auditId: auditId || '',
      questionId: '',
    },
  });

  useEffect(() => {
    if (!auditId) {
      router.push('/denetim/findings');
      return;
    }

    // Fetch audit info
    fetch(`/api/audits/${auditId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setAudit(data))
      .catch(() => {});

    // Fetch audit questions
    fetch(`/api/audit-questions?auditId=${auditId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setQuestions(Array.isArray(data) ? data : []))
      .catch(() => setQuestions([]));
  }, [auditId, router]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await fetch('/api/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string };
        throw new Error(error.error || t('messages.notFound'));
      }

      const result = await response.json() as { data: { id: string } };
      toast.success(t('messages.created'));
      router.push(`/denetim/findings/${result.data.id}`);
    } catch (error: any) {
      toast.error(error.message || tCommon('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!auditId || !audit) {
    return (
      <div className="flex-1 p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">{tCommon('messages.notFound')}</h1>
        <Button className="mt-4" asChild>
          <Link href="/denetim/findings">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {tCommon('actions.back')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/denetim/audits/audit-detail?id=${auditId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {tCommon('actions.back')}
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('create')}</h1>
          <p className="text-muted-foreground">
            {t('fields.audit')}: <span className="font-medium">{audit.title}</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t('sections.details')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.title')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('placeholders.enterDetails')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.description')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('placeholders.enterDescription')} 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.severity')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={tCommon('actions.select')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{t('severity.low')}</Badge>
                            <span>{t('severity.low')} {tCommon('labels.importance')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <div className="flex items-center gap-2">
                            <Badge variant="default">{t('severity.medium')}</Badge>
                            <span>{t('severity.medium')} {tCommon('labels.importance')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HIGH">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">{t('severity.high')}</Badge>
                            <span>{t('severity.high')} {tCommon('labels.importance')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {questions.length > 0 && (
                <FormField
                  control={form.control}
                  name="questionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tCommon('labels.relatedQuestion')} ({tCommon('labels.optional')})</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={tCommon('placeholders.selectQuestion')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">{tCommon('labels.noQuestionSelected')}</SelectItem>
                          {questions.map((question) => (
                            <SelectItem key={question.id} value={question.id}>
                              {question.question}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? tCommon('states.creating') : t('create')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  asChild
                >
                  <Link href={`/denetim/audits/audit-detail?id=${auditId}`}>
                    {tCommon('actions.cancel')}
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
