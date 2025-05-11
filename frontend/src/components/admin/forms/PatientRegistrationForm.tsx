import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface PatientFormData {
  step: number;
  name: string;
  email: string;
  age: number;
  password: string;
  confirmPassword: string;
  phone: string;
  role: string;
  profilePicture?: File | null;
  address: string;
  gender: string; 
  phone_number: string;
  emergencyContact: EmergencyContact;
}

interface PatientRegistrationFormProps {
  onClose: () => void;
  onPatientAdded: () => void;
}

interface UserResponse {
  id: string;
}

interface UploadResponse {
  url: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  age?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  address?: string;
  gender?: string;
  phone_number?: string;
  profilePicture?: string;
  emergencyContact?: Partial<EmergencyContact>;
}

export function PatientRegistrationForm({ onClose, onPatientAdded }: PatientRegistrationFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    step: 1,
    name: '',
    email: '',
    age: 0,
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient',
    profilePicture: null,
    address: '',
    gender: '',
    phone_number: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'name':
        error = value.trim().length > 0 ? '' : 'Name is required.';
        break;
      case 'email':
        const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
        error = emailRegex.test(value) ? '' : 'Please enter a valid email.';
        break;
      case 'age':
        error = Number(value) > 0 ? '' : 'Please enter a valid age.';
        break;
      case 'gender':
        error = ['Male', 'Female', 'Other'].includes(value) ? '' : 'Please select a valid gender.';
        break;
      case 'password':
        error = value.length >= 8 ? '' : 'Password must be at least 8 characters.';
        break;
      case 'confirmPassword':
        error = value === formData.password ? '' : 'Passwords do not match.';
        break;
      case 'phone_number':
        const phoneRegex = /^(03[0-9]{2})[0-9]{7}$/;
        error = phoneRegex.test(value) ? '' : 'Please enter a valid phone number.';
        break;
      case 'address':
        error = value.trim().length > 0 ? '' : 'Address is required.';
        break;
      case 'emergencyContact':
        const contact = value as EmergencyContact;
        let contactErrors: Partial<EmergencyContact> = {};
        if (!contact.name) contactErrors.name = 'Emergency contact name is required.';
        if (!contact.phone) {
          contactErrors.phone = 'Emergency contact phone is required.';
        } else if (!/^(03[0-9]{2})[0-9]{7}$/.test(contact.phone)) {
          contactErrors.phone = 'Emergency contact phone is invalid.';
        }
        if (!contact.relationship) contactErrors.relationship = 'Emergency contact relationship is required.';
        setErrors(prev => ({ ...prev, emergencyContact: contactErrors }));
        error = '';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('emergencyContact.')) {
      const key = name.split('.')[1] as keyof EmergencyContact;
      const updatedEmergencyContact = { ...formData.emergencyContact, [key]: value };
      setFormData(prev => ({
        ...prev,
        emergencyContact: updatedEmergencyContact,
      }));
      validateField('emergencyContact', updatedEmergencyContact);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'age' ? Number(value) || 0 : value
      }));
      validateField(name, value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePicture: 'File size should not exceed 10MB' }));
      } else {
        setFormData(prev => ({ ...prev, profilePicture: file }));
        setErrors(prev => ({ ...prev, profilePicture: '' }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePicture: 'File size should not exceed 10MB' }));
      } else {
        setFormData(prev => ({ ...prev, profilePicture: file }));
        setErrors(prev => ({ ...prev, profilePicture: '' }));
      }
    }
  };

  const handleNext = () => {
    const { step, name, email, age, password, confirmPassword, phone_number, gender } = formData;
    
    if (step === 1) {
      validateField('name', name);
      validateField('email', email);
      validateField('age', age);
      validateField('password', password);
      validateField('confirmPassword', confirmPassword);
      validateField('phone_number', phone_number);
      validateField('gender', gender);

      if (Object.values(errors).some(error => error !== '')) {
        return;
      }
    }
   
    setFormData(prev => ({ ...prev, step: step + 1 }));
  };

  const handleSubmit = async () => {
    validateField('address', formData.address);
    validateField('emergencyContact', formData.emergencyContact);

    if (Object.values(errors).some(error => error !== '')) {
      return;
    }

    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        password: formData.password,
        phone_number: formData.phone_number,
        role: 'Patient'
      };
      
      const token = localStorage.getItem('authToken');
      const userResponse = await axios.post<UserResponse>(
        'http://localhost:5000/api/users/register',
        requestData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      let profilePictureUrl = 'images/default-profile-picture.jpg';
      if (formData.profilePicture) {
        const formDataWithFile = new FormData();
        formDataWithFile.append('profilePicture', formData.profilePicture);
        const uploadResponse = await axios.post<UploadResponse>('http://localhost:5000/api/upload', formDataWithFile, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        profilePictureUrl = uploadResponse.data.url;
      }

      const patientData = {
        user_id: userResponse.data.id,
        address: formData.address,
        emergency_contact: formData.emergencyContact,
        profile_picture: profilePictureUrl
      };

      await axios.post(
        'http://localhost:5000/api/patients',
        patientData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`
          } 
        }
      );

      onPatientAdded();
      onClose();
    } catch (error: any) {
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter full name"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="email@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter age"
          />
          {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter phone number"
          />
          {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Profile Picture</label>
        <div 
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  className="sr-only" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {formData.profilePicture && (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {formData.profilePicture.name}
          </p>
        )}
        {errors.profilePicture && <p className="text-red-500 text-sm">{errors.profilePicture}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter your full address"
        />
        {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
      </div>
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="emergencyContact.name"
              value={formData.emergencyContact.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Emergency contact name"
            />
            {errors.emergencyContact?.name && <p className="text-red-500 text-sm">{errors.emergencyContact.name}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="emergencyContact.phone"
              value={formData.emergencyContact.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Emergency contact number"
            />
            {errors.emergencyContact?.phone && <p className="text-red-500 text-sm">{errors.emergencyContact.phone}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Relationship</label>
          <input
            type="text"
            name="emergencyContact.relationship"
            value={formData.emergencyContact.relationship}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Parent, Spouse, Sibling"
          />
          {errors.emergencyContact?.relationship && <p className="text-red-500 text-sm">{errors.emergencyContact.relationship}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[90%] max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {formData.step === 1 ? 'Patient Registration' : 'Additional Information'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {formData.step === 1 ? renderStep1() : renderStep2()}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            {formData.step === 2 && (
              <button
                onClick={() => setFormData(prev => ({ ...prev, step: 1 }))}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              onClick={formData.step === 1 ? handleNext : handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {formData.step === 1 ? 'Next' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}