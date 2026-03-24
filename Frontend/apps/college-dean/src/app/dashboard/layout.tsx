import DeanSidebarWithModal from "../../components/DeanSidebarWithModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <DeanSidebarWithModal />
      <div className="ml-64 flex-1 min-h-screen bg-gray-50">
        {children}
      </div>
    </div>
  );
}
