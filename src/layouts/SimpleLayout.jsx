export default function SimpleLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      {children}
    </div>
  );
};