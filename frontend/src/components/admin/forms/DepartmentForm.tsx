import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface DepartmentFormData {
  name: string;
  description: string;
  active_status: boolean;
}

interface ValidationErrors {
  name?: string;
  description?: string;
}

interface DepartmentFormProps {
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export function DepartmentForm({ onClose, onSubmitSuccess }: DepartmentFormProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    description: '',
    active_status: true,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateDepartmentName = (name: string): string | undefined => {
    if (!name) {
      return 'Department name is required';
    }
    if (name.length > 30) {
      return 'Department name cannot exceed 30 characters';
    }
    if (/^\d+$/.test(name)) {
      return 'Department name cannot contain only numbers';
    }
    if (!/^[a-zA-Z\s-]+$/.test(name)) {
      return 'Department name can only contain letters, spaces, and hyphens';
    }
    return undefined;
  };

  const validateDescription = (description: string): string | undefined => {
    if (description) {
      const wordCount = description.trim().split(/\s+/).length;
      if (wordCount > 30) {
        return 'Description cannot exceed 30 words';
      }
    }
    return undefined;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Validate fields as user types
    if (name === 'name') {
      const error = validateDepartmentName(value);
      if (error) {
        setErrors(prev => ({
          ...prev,
          name: error
        }));
      }
    } else if (name === 'description') {
      const error = validateDescription(value);
      if (error) {
        setErrors(prev => ({
          ...prev,
          description: error
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const nameError = validateDepartmentName(formData.name);
    const descriptionError = validateDescription(formData.description);

    if (nameError || descriptionError) {
      setErrors({
        name: nameError,
        description: descriptionError
      });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        'http://localhost:5000/api/departments',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onClose();
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Error creating department:', err);
      setErrors({
        name: err.response?.data?.message || 'Failed to create department'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Add Department</h2>
        <button 
          type="button" 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.name 
                ? 'border-red-300' 
                : 'border-gray-300'
            }`}
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.description 
                ? 'border-red-300' 
                : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {`${formData.description.trim().split(/\s+/).filter(Boolean).length}/30 words`}
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="active_status"
            checked={formData.active_status}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Active Status
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={!!(errors.name || errors.description)}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
            ${errors.name || errors.description
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
        >
          Submit
        </button>
      </div>
    </form>
  );
} 