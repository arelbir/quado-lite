import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  Shield,
  Workflow,
  BarChart3,
  Bell,
  Globe,
  Github,
  BookOpen,
  Rocket,
  Code2,
  Database,
  Layers,
  ArrowRight,
} from 'lucide-react';

export async function generateMetadata() {
  const t = await getTranslations('landing.hero');
  
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LandingPage() {
  const t = await getTranslations('landing');

  const features = [
    { icon: ClipboardCheck, title: t('features.list.0.title'), description: t('features.list.0.description') },
    { icon: AlertCircle, title: t('features.list.1.title'), description: t('features.list.1.description') },
    { icon: CheckCircle2, title: t('features.list.2.title'), description: t('features.list.2.description') },
    { icon: Shield, title: t('features.list.3.title'), description: t('features.list.3.description') },
    { icon: Workflow, title: t('features.list.4.title'), description: t('features.list.4.description') },
    { icon: BarChart3, title: t('features.list.5.title'), description: t('features.list.5.description') },
    { icon: Bell, title: t('features.list.6.title'), description: t('features.list.6.description') },
    { icon: Globe, title: t('features.list.7.title'), description: t('features.list.7.description') },
  ];

  const architectureLayers = [
    { icon: Code2, title: t('architecture.layers.0.title'), description: t('architecture.layers.0.description') },
    { icon: Layers, title: t('architecture.layers.1.title'), description: t('architecture.layers.1.description') },
    { icon: Shield, title: t('architecture.layers.2.title'), description: t('architecture.layers.2.description') },
    { icon: Database, title: t('architecture.layers.3.title'), description: t('architecture.layers.3.description') },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.5))]" />
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100">
              {t('hero.badge')}
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              {t('hero.title')}
            </h1>
            
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 italic">
              {t('hero.subtitle')}
            </p>
            
            <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-gray-300">
              {t('hero.description')}
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Link href="/deployment-docs">
                <Button size="lg" className="gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t('hero.cta.docs')}
                </Button>
              </Link>
              
              <Link href="https://github.com" target="_blank">
                <Button size="lg" variant="outline" className="gap-2">
                  <Github className="h-5 w-5" />
                  {t('hero.cta.github')}
                </Button>
              </Link>
              
              <Link href="/deployment-docs/tr/YAYINA-ALMA-OZET.md">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Rocket className="h-5 w-5" />
                  {t('hero.cta.start')}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 relative rounded-xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1644325349124-d1756b79dd42"
              alt="Digital transformation visualization"
              width={1200}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t('features.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 sm:py-32 bg-gray-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t('tech.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              {t('tech.subtitle')}
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  {t('tech.frontend.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {t.raw('tech.frontend.items').map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                  {t('tech.backend.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {t.raw('tech.backend.items').map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  {t('tech.other.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {t.raw('tech.other.items').map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 sm:py-32 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t('architecture.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              {t('architecture.subtitle')}
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="relative">
              {architectureLayers.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <div key={index} className="relative">
                    {index > 0 && (
                      <div className="absolute left-8 top-0 h-8 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500 -translate-y-8" />
                    )}
                    <Card className="mb-4 border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2">
                            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                          </div>
                          <CardTitle>{layer.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {layer.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Architecture Image */}
          <div className="mt-16 relative rounded-xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740"
              alt="Business technology workspace"
              width={1200}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <section className="py-24 sm:py-32 bg-gray-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t('deployment.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              {t('deployment.subtitle')}
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
            {t.raw('deployment.options').map((option: any, index: number) => (
              <Card key={index} className={option.tag ? 'border-2 border-blue-500' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{option.title}</CardTitle>
                    {option.tag && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        {option.tag}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('stats.title')}
            </h2>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
            {t.raw('stats.items').map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t('hero.cta.start')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              5 dakikada başlayın. Kapsamlı dokümantasyon ve deployment kılavuzları ile.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Link href="/deployment-docs/tr/YAYINA-ALMA-OZET.md">
                <Button size="lg" className="gap-2">
                  <Rocket className="h-5 w-5" />
                  Hızlı Başlangıç
                </Button>
              </Link>
              
              <Link href="/deployment-docs">
                <Button size="lg" variant="outline" className="gap-2">
                  <BookOpen className="h-5 w-5" />
                  Tüm Dokümantasyon
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('footer.docs')}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/docs/01-SYSTEM-ARCHITECTURE.md" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    System Architecture
                  </Link>
                </li>
                <li>
                  <Link href="/docs/02-RBAC-SYSTEM.md" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    RBAC System
                  </Link>
                </li>
                <li>
                  <Link href="/docs/03-WORKFLOW-ENGINE.md" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Workflow Engine
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('footer.deployment')}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/deployment-docs/tr/YAYINA-ALMA-OZET.md" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Hızlı Başlangıç (TR)
                  </Link>
                </li>
                <li>
                  <Link href="/deployment-docs/en/DEPLOYMENT-SUMMARY.md" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Quick Start (EN)
                  </Link>
                </li>
                <li>
                  <Link href="/deployment-docs/tr/PRODUCTION-KONTROL-LISTESI.md" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Production Checklist
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('footer.testing')}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/docs/05-TEST-STRATEGY.md" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Test Strategy
                  </Link>
                </li>
                <li>
                  <Link href="/deployment-docs/tr/ON-YAYINA-TEST.md" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Pre-Launch Tests
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                GitHub
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Repository
                  </a>
                </li>
                <li>
                  <a href="https://github.com/issues" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Issues
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('footer.description')} · {t('footer.license')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
