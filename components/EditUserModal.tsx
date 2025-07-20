import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User | null;
}

export default function EditUserModal({ open, onClose, onUserUpdated, user }: EditUserModalProps) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    date_of_birth: '',
    role: 'support_worker',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user && open) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        emergency_contact: user.emergency_contact || '',
        emergency_phone: user.emergency_phone || '',
        date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
        role: user.role || 'support_worker',
      });
      setErrors({});
    }
  }, [user, open]);

  if (!open || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.username) newErrors.username = 'Username is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.first_name) newErrors.first_name = 'First name is required';
    if (!form.last_name) newErrors.last_name = 'Last name is required';
    if (!form.phone) newErrors.phone = 'Phone is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setLoading(true);
    try {
      const updateData = {
        ...form,
        date_of_birth: form.date_of_birth || null,
      };
      await apiClient.updateUser(user.id, updateData);
      toast.success('User updated successfully!');
      onUserUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-[20px] shadow-lg w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#000000]">Edit User</h2>
          <button
            onClick={onClose}
            className="text-[#6D6D6D] hover:text-[#000000] transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent transition-colors"
                disabled={loading}
                placeholder="Enter username"
              />
              {errors.username && <p className="text-[#FF6B6B] text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent transition-colors"
                disabled={loading}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-[#FF6B6B] text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">First Name</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent transition-colors"
                disabled={loading}
                placeholder="Enter first name"
              />
              {errors.first_name && <p className="text-[#FF6B6B] text-sm mt-1">{errors.first_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">Last Name</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent transition-colors"
                disabled={loading}
                placeholder="Enter last name"
              />
              {errors.last_name && <p className="text-[#FF6B6B] text-sm mt-1">{errors.last_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">Phone</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent transition-colors"
                disabled={loading}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-[#FF6B6B] text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent transition-colors"
                disabled={loading}
              >
                <option value="support_worker">Support Worker</option>
                <option value="practitioner">Practitioner</option>
                <option value="family">Family</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">Date of Birth</label>
              <input
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">Emergency Phone</label>
              <input
                name="emergency_phone"
                type="tel"
                value={form.emergency_phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent transition-colors"
                disabled={loading}
                placeholder="Enter emergency phone"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent transition-colors"
                disabled={loading}
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">Emergency Contact</label>
              <input
                name="emergency_contact"
                value={form.emergency_contact}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent transition-colors"
                disabled={loading}
                placeholder="Enter emergency contact name"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-[#E0E0E0]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-[#F0F0F0] text-[#000000] rounded-lg hover:bg-[#E5E5E5] transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3DB9B2] active:bg-[#37A29F] transition-colors font-medium disabled:bg-[#A3A3A3]"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 