import { PortalSidebar } from "@/components/features/portal-sidebar"

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <PortalSidebar />
      <main className="flex-1 min-w-0 p-6 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  )
}
