import { SignageSubnav } from '@/components/portal/signage/SignageSubnav';
import { PageContainer } from '@/components/portal/PageContainer';

export default function SignageLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer>
      <div className="mb-4">
        <SignageSubnav />
      </div>
      {children}
    </PageContainer>
  );
}
