import { User } from '@/types';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
  loading?: boolean;
}

export default function DeleteConfirmationDialog({ 
  open, 
  onClose, 
  onConfirm, 
  user, 
  loading = false 
}: DeleteConfirmationDialogProps) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-[20px] shadow-lg w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-[#FF6B6B] bg-opacity-10 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-[#FF6B6B]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#000000] mb-3">Delete User</h2>
          <p className="text-[#6D6D6D] mb-2">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-[#000000]">{user.full_name}</span>?
          </p>
          <p className="text-sm text-[#A3A3A3]">
            This action cannot be undone. All user data will be permanently removed.
          </p>
        </div>

        <div className="bg-[#F9F5F4] rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E0E0E0] rounded-full flex items-center justify-center">
              {user.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt={user.full_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <svg className="w-5 h-5 text-[#000000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-[#000000]">{user.full_name}</p>
              <p className="text-sm text-[#6D6D6D]">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {user.is_admin ? 'Admin' : 'Carer'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.approved ? 'bg-[#4ECDC4] bg-opacity-10 text-[#4ECDC4]' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.approved ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-[#F0F0F0] text-[#000000] rounded-lg hover:bg-[#E5E5E5] transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors font-medium disabled:bg-[#A3A3A3]"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
} 