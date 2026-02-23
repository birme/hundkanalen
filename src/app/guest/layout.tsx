export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="section-padding">
      <div className="container-narrow">
        {children}
      </div>
    </div>
  );
}
