export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout compartido para /login y /register (sin sidebar de dashboard).
  return <div>{children}</div>;
}
