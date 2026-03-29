import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { LoginForm } from './LoginForm';

export default function LoginPage({ searchParams }: { searchParams?: { reason?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.08),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,1),_rgba(244,244,245,1))] px-4 py-12">
      <Card className="w-full max-w-md border-foreground/10 shadow-xl">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <CardDescription>
            Sign in to manage portfolio content, publishing state, and media.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm sessionExpired={searchParams?.reason === 'session_expired'} />
        </CardContent>
      </Card>
    </div>
  );
}
