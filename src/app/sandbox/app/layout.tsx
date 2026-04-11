import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#050812",
};

export const metadata: Metadata = {
  title: "Sandbox · SynqAi",
  description: "Sandbox completo (logueado) dentro de la micro-app /sandbox",
  manifest: "/sandbox/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SynqAi Sandbox",
  },
};

/** Segment layouts bajo `(shell)` y `board/` aportan auth, banner y shell. Evitar doble `SandboxAppClientWrapper` aquí. */
export default async function SandboxAppLayout(props: { children: React.ReactNode }) {
  return props.children;
}

