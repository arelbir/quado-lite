import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn, FadeInStagger, FadeInChild } from '@/components/animations/fade-in';
import { ScrollToTop } from '@/components/scroll-to-top';
import {
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
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
  Star,
  Zap,
  Lock,
  Users,
} from 'lucide-react';

export async function generateMetadata() {
  const t = await getTranslations('landing.hero');
  
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1644325349124-d1756b79dd42',
          width: 1200,
          height: 600,
          alt: 'Enterprise Audit Management System',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['https://images.unsplash.com/photo-1644325349124-d1756b79dd42'],
    },
  };
}

export default async function LandingPage() {
  const t = await getTranslations('landing');

  const features = [
    { icon: ClipboardCheck, title: t('features.list.0.title'), description: t('features.list.0.description'), color: 'text-blue-600' },
    { icon: AlertCircle, title: t('features.list.1.title'), description: t('features.list.1.description'), color: 'text-orange-600' },
    { icon: CheckCircle2, title: t('features.list.2.title'), description: t('features.list.2.description'), color: 'text-green-600' },
    { icon: Shield, title: t('features.list.3.title'), description: t('features.list.3.description'), color: 'text-purple-600' },
    { icon: Workflow, title: t('features.list.4.title'), description: t('features.list.4.description'), color: 'text-indigo-600' },
    { icon: BarChart3, title: t('features.list.5.title'), description: t('features.list.5.description'), color: 'text-cyan-600' },
    { icon: Bell, title: t('features.list.6.title'), description: t('features.list.6.description'), color: 'text-pink-600' },
    { icon: Globe, title: t('features.list.7.title'), description: t('features.list.7.description'), color: 'text-teal-600' },
  ];

  const architectureLayers = [
    { icon: Code2, title: t('architecture.layers.0.title'), description: t('architecture.layers.0.description') },
    { icon: Layers, title: t('architecture.layers.1.title'), description: t('architecture.layers.1.description') },
    { icon: Shield, title: t('architecture.layers.2.title'), description: t('architecture.layers.2.description') },
    { icon: Database, title: t('architecture.layers.3.title'), description: t('architecture.layers.3.description') },
  ];

  const highlights = [
    { icon: Zap, title: 'High Performance', description: 'Next.js 15 Server Components' },
    { icon: Lock, title: 'Enterprise Security', description: '4-Layer RBAC System' },
    { icon: Star, title: 'Production Ready', description: '50,000+ Lines of Code' },
    { icon: Users, title: 'Team Collaboration', description: 'Multi-user Workflow Engine' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.5))]" />
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <FadeIn>
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 animate-pulse">
                ✅ {t('hero.badge')}
              </Badge>
              
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
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
                  <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                    <BookOpen className="h-5 w-5" />
                    {t('hero.cta.docs')}
                  </Button>
                </Link>
                
                <Link href="https://github.com/yourusername/denetim-uygulamasi" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                    <Github className="h-5 w-5" />
                    {t('hero.cta.github')}
                  </Button>
                </Link>
                
                <Link href="/deployment-docs/tr/YAYINA-ALMA-OZET.md">
                  <Button size="lg" variant="secondary" className="gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                    <Rocket className="h-5 w-5" />
                    {t('hero.cta.start')}
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <div className="mt-16 relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-900/10">
              <Image
                src="https://images.unsplash.com/photo-1644325349124-d1756b79dd42"
                alt="Digital transformation"
                width={1200}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>
          </FadeIn>
          
          <FadeInStagger className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <FadeInChild key={index}>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                      {highlight.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      {highlight.description}
                    </p>
                  </div>
                </FadeInChild>
              );
            })}
          </FadeInStagger>
        </div>
      </section>

      {/* Features Section - Continued in next part */}
      <section id="features" className="py-24 sm:py-32 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                {t('features.title')}
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                {t('features.subtitle')}
              </p>
            </div>
          </FadeIn>
          
          <FadeInStagger className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <FadeInChild key={index}>
                  <Card className="border-2 hover:border-blue-500 dark:hover:border-blue-400 transition-all hover:shadow-lg transform hover:scale-105">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2">
                          <Icon className={`h-6 w-6 ${feature.color}`} />
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
                </FadeInChild>
              );
            })}
          </FadeInStagger>
        </div>
      </section>

      <ScrollToTop />
    </div>
  );
}
