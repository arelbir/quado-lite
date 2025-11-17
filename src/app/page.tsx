import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect root to landing page
  redirect('/landing');
}
