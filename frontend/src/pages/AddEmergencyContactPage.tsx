import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

export default function AddEmergencyContactPage() {
  const navigate = useNavigate();
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/profile');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#D2EBE7] pb-6">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Emergency Contact</h1>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-600 text-sm mb-2">Contact Name</label>
                <input
                  type="text"
                  value={emergencyContact.name}
                  onChange={(e) => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">Contact Phone</label>
                <input
                  type="text"
                  value={emergencyContact.phone}
                  onChange={(e) => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2">Relationship</label>
                <input
                  type="text"
                  value={emergencyContact.relationship}
                  onChange={(e) => setEmergencyContact(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#097a93] transition-colors"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 