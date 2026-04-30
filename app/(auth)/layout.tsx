export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f7fb] px-4 py-10">
      <div className="w-full max-w-[610px]">{children}</div>
    </div>
  );
}
