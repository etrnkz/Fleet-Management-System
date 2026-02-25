'use client';

import { useState } from 'react';

export interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
}

interface VehicleFormProps {
  initialData?: Partial<VehicleFormData>;
  onSubmit: (data: VehicleFormData) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

interface FormErrors {
  [key: string]: string;
}

export const VehicleForm = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
}: VehicleFormProps) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    make: initialData?.make || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    vin: initialData?.vin || '',
    licensePlate: initialData?.licensePlate || '',
    color: initialData?.color || '',
    mileage: initialData?.mileage || 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const currentYear = new Date().getFullYear();

    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (formData.year < 1900 || formData.year > currentYear + 1) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }

    if (!formData.vin.trim()) {
      newErrors.vin = 'VIN is required';
    } else if (formData.vin.length !== 17) {
      newErrors.vin = 'VIN must be 17 characters';
    }

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }

    if (formData.mileage < 0) {
      newErrors.mileage = 'Mileage cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof VehicleFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="make" className="block text-sm font-medium mb-1">
          Make *
        </label>
        <input
          id="make"
          type="text"
          value={formData.make}
          onChange={(e) => handleChange('make', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting}
        />
        {errors.make && <p className="text-red-500 text-sm mt-1">{errors.make}</p>}
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium mb-1">
          Model *
        </label>
        <input
          id="model"
          type="text"
          value={formData.model}
          onChange={(e) => handleChange('model', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting}
        />
        {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
      </div>

      <div>
        <label htmlFor="year" className="block text-sm font-medium mb-1">
          Year *
        </label>
        <input
          id="year"
          type="number"
          value={formData.year}
          onChange={(e) => handleChange('year', parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting}
        />
        {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
      </div>

      <div>
        <label htmlFor="vin" className="block text-sm font-medium mb-1">
          VIN *
        </label>
        <input
          id="vin"
          type="text"
          value={formData.vin}
          onChange={(e) => handleChange('vin', e.target.value.toUpperCase())}
          maxLength={17}
          className="w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting}
        />
        {errors.vin && <p className="text-red-500 text-sm mt-1">{errors.vin}</p>}
      </div>

      <div>
        <label htmlFor="licensePlate" className="block text-sm font-medium mb-1">
          License Plate *
        </label>
        <input
          id="licensePlate"
          type="text"
          value={formData.licensePlate}
          onChange={(e) => handleChange('licensePlate', e.target.value.toUpperCase())}
          className="w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting}
        />
        {errors.licensePlate && (
          <p className="text-red-500 text-sm mt-1">{errors.licensePlate}</p>
        )}
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium mb-1">
          Color *
        </label>
        <input
          id="color"
          type="text"
          value={formData.color}
          onChange={(e) => handleChange('color', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting}
        />
        {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color}</p>}
      </div>

      <div>
        <label htmlFor="mileage" className="block text-sm font-medium mb-1">
          Mileage *
        </label>
        <input
          id="mileage"
          type="number"
          value={formData.mileage}
          onChange={(e) => handleChange('mileage', parseInt(e.target.value))}
          min="0"
          className="w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting}
        />
        {errors.mileage && <p className="text-red-500 text-sm mt-1">{errors.mileage}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
