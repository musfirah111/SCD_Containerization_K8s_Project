import React, { useState, useEffect } from 'react';
import { X, Upload, ArrowRight } from 'lucide-react';
import axios from 'axios';

interface DoctorFormData {
  step: number;
  userId: string | null;
  name: string;
  email: string;
  age: string;
  gender: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: string;
  profilePicture: File | null;
  profilePictureUrl: string;
  specialization: string;
  qualification: string;
  department: string;
  shift: string;
  workingHours: string;
  availabilityStatus: string;
  experience: string;
  consultationFee: string;
}

interface ErrorMessages {
  email: string;
  phone: string;
}

interface DoctorRegistrationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Department {
  _id: string;
  name: string;
  description: string;
  active_status: boolean;
}

export function DoctorRegistrationForm({ onClose, onSuccess }: DoctorRegistrationFormProps) {
  const [formData, setFormData] = useState<DoctorFormData>({
    step: 1,
    userId: null,
    name: '',
    email: '',
    age: '',
    gender: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'doctor',
    profilePicture: null,
    profilePictureUrl: '',
    specialization: '',
    qualification: '',
    department: '',
    shift: '',
    workingHours: '',
    availabilityStatus: 'available',
    experience: '',
    consultationFee: '',
  });

  const [errors, setErrors] = useState<ErrorMessages>({
    email: '',
    phone: ''
  });

  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/departments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadProfilePicture = async (file: File) => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        'http://localhost:5000/api/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.url;
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      throw new Error('Failed to upload profile picture');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setFormData(prev => ({ ...prev, profilePicture: file }));
        const imageUrl = await uploadProfilePicture(file);
        setFormData(prev => ({ ...prev, profilePictureUrl: imageUrl }));
      } catch (error) {
        //alert('Failed to upload profile picture. Please try again.');
      }
    }
  };

  const validateStep1 = () => {
    const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const phonePattern = /^(03[0-9]{2})[0-9]{7}$/;
    let isValid = true;

    setErrors({ email: '', phone: '' });

    if (!emailPattern.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      isValid = false;
    }

    if (!phonePattern.test(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number (03XX-XXXXXXX)' }));
      isValid = false;
    }

    return isValid;
  };

  const createUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone_number: formData.phone,
        role: 'Doctor',
        profile_picture: formData.profilePictureUrl
      };

      console.log('Sending user data:', userData);

      const response = await axios.post(
        'http://localhost:5000/api/users/register',
        userData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data) {
        throw new Error('No data received from server');
      }

      console.log('Server response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleNext = async () => {
    if (formData.step === 1) {
      if (!validateStep1()) {
        return;
      }

      try {
        const userData = await createUser();
        console.log('User data received:', userData.id);
        if (!userData?.id) {
          throw new Error('User ID not received from server');
        }
        setFormData(prev => ({ ...prev, step: prev.step + 1, userId: userData.id }));
      } catch (error: any) {
        console.error('Error creating user:', error);
        //alert(error.message || 'Failed to create user. Please try again.');
        return;
      }
    }
  };

  const createDoctor = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/doctors',
        {
          user_id: userId,
          specialization: formData.specialization,
          qualification: formData.qualification,
          department_id: formData.department,
          shift: formData.shift,
          working_hours: formData.workingHours,
          availability_status: formData.availabilityStatus === 'available',
          experience: parseInt(formData.experience),
          consultation_fee: parseInt(formData.consultationFee),
          description: `Dr. ${formData.name}'s practice`
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating doctor:', error);
      throw new Error(error.response?.data?.message || 'Failed to create doctor');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.userId) {
        throw new Error('User ID is missing');
      }
      const doctorData = await createDoctor(formData.userId);
      //alert('Doctor registered successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error registering doctor:', error);
      alert('Failed to register doctor. Please try again.');
    }
  };

  const inputClasses = "mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2";

  const renderProfilePictureUpload = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
        <div className="space-y-2 text-center">
          {formData.profilePictureUrl ? (
            <div className="flex flex-col items-center">
              <img
                src={formData.profilePictureUrl}
                alt="Profile preview"
                className="w-24 h-24 object-cover rounded-full mb-2"
              />
              <button
                onClick={() => setFormData(prev => ({ ...prev, profilePicture: null, profilePictureUrl: '' }))}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload a file</span>
                  <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClasses}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClasses}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>

      {renderProfilePictureUpload()}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={inputClasses}
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
          <select
            name="shift"
            value={formData.shift}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select Shift</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
          <input
            type="text"
            name="workingHours"
            value={formData.workingHours}
            onChange={handleChange}
            placeholder="e.g., 9:00 AM - 5:00 PM"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
          <select
            name="availabilityStatus"
            value={formData.availabilityStatus}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="on-leave">On Leave</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Enter years of experience"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (PKR)</label>
          <input
            type="number"
            name="consultationFee"
            value={formData.consultationFee}
            onChange={handleChange}
            placeholder="Enter consultation fee"
            className={inputClasses}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-h-[85vh] overflow-y-auto flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {formData.step === 1 ? 'Doctor Registration' : 'Professional Information'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {formData.step === 1 ? renderStep1() : renderStep2()}

      <div className="mt-8 flex justify-end space-x-3 sticky bottom-0 bg-white py-4 border-t">
        {formData.step === 1 ? (
          <button
            onClick={handleNext}
            className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

