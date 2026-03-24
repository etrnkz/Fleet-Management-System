import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  sublabel: string;
  color: string;
}

export default function StatsCard({ icon: Icon, label, value, sublabel, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-gray-500 text-sm font-medium">{label}</span>
      </div>
      <div>
        <p className="text-4xl font-bold text-gray-900">{value.toString().padStart(2, '0')}</p>
        <p className="text-gray-500 text-sm mt-1">{sublabel}</p>
      </div>
    </div>
  );
}
