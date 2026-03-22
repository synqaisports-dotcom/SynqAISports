
import { Metadata } from "next";
import { TutorClientLayout } from "./tutor-client-layout";

export const metadata: Metadata = {
  title: "Tutor by SynqAi",
  description: "Portal Oficial de Familias - Red SynqAi Sports",
  manifest: "/tutor/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tutor by SynqAi"
  }
};

export default async function TutorLayout({ 
  children,
}: { 
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex justify-center font-body">
      <TutorClientLayout>{children}</TutorClientLayout>
    </div>
  );
}
