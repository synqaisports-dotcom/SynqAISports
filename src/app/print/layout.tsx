import '@/app/print/print.css';

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="print-page-root min-h-screen bg-gray-200 py-8 print:bg-white print:py-0">
      {children}
    </div>
  );
}
