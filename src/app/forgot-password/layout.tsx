import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Admin Password',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
