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
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 md:pt-6">
        {children}
      </div>
    </div>
  );
}
