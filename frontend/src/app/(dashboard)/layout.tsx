// Each role's layout handles its own auth check.
// This group layout just renders children.
export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
