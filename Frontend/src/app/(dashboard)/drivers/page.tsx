import { DriverList } from '@/components/features/DriverList';

export default function DriversPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
        <p className="text-gray-600 mt-2">Manage and view all drivers</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DriverList />
      </div>
    </div>
  );
}
