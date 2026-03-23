import { Metadata } from "next";
import { PromoClientWrapper } from "./promo-client-wrapper";

export const metadata: Metadata = {
  title: "Sandbox by SynqAi",
  description: "Entorno Táctico Local y Gestión Sandbox",
  manifest: "/dashboard/promo/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SynqAi Sandbox"
  },
  icons: {
    apple: [
      { url: 'https://placehold.co/192x192/04070c/3b82f6?text=Sandbox', sizes: '192x192', type: 'image/png' },
    ],
  }
};

export default async function PromoSandboxLayout(props: { 
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const children = props.children;

  return (
    <PromoClientWrapper>
      {children}
    </PromoClientWrapper>
  );
}
