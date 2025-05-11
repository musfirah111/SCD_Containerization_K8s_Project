import { Department } from '../../../types/admin';

interface DepartmentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  department: Department | null;
  title?: string;
  message?: string;
}

export function DepartmentConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  department, 
}: DepartmentConfirmationModalProps) {
  if (!isOpen) return null;

  const handleDelete = () => {
    if (!department?.isActive) {
      onConfirm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h3 className="text-lg font-semibold text-[#26937E] mb-2">Delete Department</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <span className="font-semibold">{department?.name}</span>?
        </p>
        {department?.isActive && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            Warning: This department is currently active and cannot be deleted.
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={department?.isActive}
            className={`px-4 py-2 rounded-md ${
              department?.isActive
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 