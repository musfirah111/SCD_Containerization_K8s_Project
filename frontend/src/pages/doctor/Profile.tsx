import React, { useState, useEffect } from 'react';
import { User } from '../../types/doctor/user';
import { Layout } from '../../components/doctor/Layout';
import axios from 'axios';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found');
        }

        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5000/api/users/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data);
        setOriginalUser(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setIsLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      const phoneRegex = /^(03[0-9]{2})[0-9]{7}$/;
      if (value && !phoneRegex.test(value)) {
        setPhoneError('Please enter a valid Pakistani phone number (e.g., 03XXXXXXXXX)');
      } else {
        setPhoneError(null);
      }
    }

    setUser(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/users/user/${userId}`,
        {
          name: user.name,
          age: user.age,
          gender: user.gender,
          phone_number: user.phoneNumber
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIsEditing(false);
      setOriginalUser(response.data);

      // Update the user name in localStorage
      localStorage.setItem('userName', response.data.name);

      // Dispatch the event with the updated user data
      window.dispatchEvent(new CustomEvent('userProfileUpdated', {
        detail: response.data
      }));

      alert('Profile updated successfully');
    } catch (err: any) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setUser(originalUser);
    }
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#D2EBE7] p-6 flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#D2EBE7] p-6 flex items-center justify-center">
          <div className="text-lg text-red-500">{error || 'Failed to load profile'}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#D2EBE7] pt-2 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile</h1>

          <div className="bg-white rounded-lg p-6 shadow-sm transition-all duration-200">
            {/* Profile Header */}
            <div className="flex items-start gap-6 mb-6 border-b border-gray-100 pb-4">
              <img
                src={user.avatar || '/default-avatar.png'}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-medium">{user.name}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
            </div>

            {/* Personal Information Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-medium">Personal Information</h3>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-md"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={user?.name ?? ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2.5 border border-gray-200 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={user.email || ''}
                      disabled={true} // Email should not be editable
                      className="w-full p-2.5 border border-gray-200 rounded-md bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={user?.age ?? ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2.5 border border-gray-200 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={user.gender || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2.5 border border-gray-200 rounded-md"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={user.phoneNumber || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full p-2.5 border ${phoneError ? 'border-red-500' : 'border-gray-200'} rounded-md`}
                    />
                    {phoneError && (
                      <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#0B8FAC] text-white rounded-md hover:bg-[#0A7A9B]"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}