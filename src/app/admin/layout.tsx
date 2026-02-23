import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  if (session.user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
