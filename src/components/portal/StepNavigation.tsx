import Link from 'next/link';

type StepLink = {
  href: string;
  label: string;
};

export default function StepNavigation({ prev, next }: { prev?: StepLink; next?: StepLink }) {
  return (
    <nav className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-center gap-2 text-sm font-medium text-forest-700 hover:text-forest-900 transition-colors py-3 pr-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {prev.label}
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="flex items-center gap-2 text-sm font-medium text-white bg-forest-700 hover:bg-forest-800 transition-colors rounded-lg px-5 py-3"
        >
          {next.label}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
