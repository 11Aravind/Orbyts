import React, { useEffect, useState } from 'react';
import { apiService } from '../../utils/apiService';
import { Plus, KeyRound, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminWaiters() {
    const [waiters, setWaiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');

    // State for Admin resetting a waiter's password
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedWaiter, setSelectedWaiter] = useState(null);
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [resetError, setResetError] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const loadWaiters = async () => {
        setLoading(true);
        const data = await apiService.getWaiters();
        const staffOnly = (data || []).filter(w => w.role !== 'SYSTEM' && w.id !== 'push_subscriptions_store');
        setWaiters(staffOnly);
        setLoading(false);
    };

    useEffect(() => {
        loadWaiters();
    }, []);

    const handleCreateWaiter = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!name || !email) {
            setFormError('Name and Email are required.');
            return;
        }

        const newWaiter = {
            name,
            email,
            username: username || email.split('@')[0],
            password: password || 'password123',
            google_email: email,
            status: 'ACTIVE'
        };

        await apiService.saveWaiter(newWaiter);
        setShowAddModal(false);
        setName('');
        setEmail('');
        setUsername('');
        setPassword('');
        loadWaiters();
        toast.success(`Waiter ${newWaiter.name} added successfully!`);
    };

    const handleToggleStatus = async (waiterId) => {
        await apiService.toggleWaiterStatus(waiterId);
        loadWaiters();
    };

    const handleResetWaiterPassword = async (e) => {
        e.preventDefault();
        setResetError('');

        if (!resetNewPassword || resetNewPassword.length < 6) {
            setResetError('New password must be at least 6 characters long.');
            return;
        }
        if (resetNewPassword !== resetConfirmPassword) {
            setResetError('Passwords do not match.');
            return;
        }

        setIsResetting(true);
        try {
            const res = await apiService.adminResetWaiterPassword({
                waiterId: selectedWaiter.id,
                newPassword: resetNewPassword
            });

            if (res.success) {
                toast.success(`Password for ${selectedWaiter.name} updated successfully!`);
                setShowResetModal(false);
                setSelectedWaiter(null);
                setResetNewPassword('');
                setResetConfirmPassword('');
            } else {
                setResetError(res.error || 'Failed to reset password.');
            }
        } catch (err) {
            setResetError(err.message || 'An error occurred.');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        Waiter Accounts Management
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                        Authorize, invite, and manage access privileges for restaurant waiters
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#114536] hover:bg-[#0c382b] text-white font-bold rounded-2xl text-xs shadow-md transition-all shrink-0 cursor-pointer"
                >
                    <Plus className="w-4 h-4 text-emerald-200" />
                    <span>Invite New Waiter</span>
                </button>
            </div>

            {/* Waiters Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Authorized Waiter Staff ({waiters.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-bold">
                        Loading waiter accounts...
                    </div>
                ) : waiters.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs font-bold">
                        No waiter accounts found. Click "Invite New Waiter" above to add staff.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="p-4 pl-6">Staff Member</th>
                                    <th className="p-4">Username / Login</th>
                                    <th className="p-4">Account Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                                {waiters.map((w) => {
                                    const isDisabled = w.status === 'DISABLED';
                                    return (
                                        <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                                        {w.name?.charAt(0) || 'W'}
                                                    </div>
                                                    <div>
                                                        <span className="font-extrabold text-slate-900 block">{w.name}</span>
                                                        <span className="text-[11px] text-slate-500">{w.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 font-bold">
                                                    {w.username || w.email}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${isDisabled
                                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isDisabled ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                                                    {isDisabled ? 'DISABLED' : 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedWaiter(w);
                                                            setResetNewPassword('');
                                                            setResetConfirmPassword('');
                                                            setResetError('');
                                                            setShowResetModal(true);
                                                        }}
                                                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                                                        title="Reset this waiter's password"
                                                    >
                                                        <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                                                        <span>Reset Password</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleToggleStatus(w.id)}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isDisabled
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                                            }`}
                                                    >
                                                        {isDisabled ? 'Enable Access' : 'Disable Waiter'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Waiter Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="text-base font-black text-slate-900">Invite & Authorize Waiter</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateWaiter} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Alex Johnson"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Staff Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="alex@innbite.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Username & Password
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                                    />
                                    <input
                                        type="text"
                                        placeholder="password123"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-[#114536] hover:bg-[#0c382b] text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                                >
                                    Authorize & Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Admin Reset Waiter Password Modal */}
            {showResetModal && selectedWaiter && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                    <KeyRound className="w-4 h-4 text-amber-600" />
                                    Reset Waiter Password
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Set a new password for <span className="font-bold text-slate-800">{selectedWaiter.name}</span> ({selectedWaiter.username || selectedWaiter.email})
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowResetModal(false);
                                    setSelectedWaiter(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {resetError && (
                            <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl">
                                {resetError}
                            </div>
                        )}

                        <form onSubmit={handleResetWaiterPassword} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    New Password (Min 6 chars)
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="Enter new password"
                                    value={resetNewPassword}
                                    onChange={(e) => setResetNewPassword(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="Re-enter new password"
                                    value={resetConfirmPassword}
                                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowResetModal(false);
                                        setSelectedWaiter(null);
                                    }}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isResetting}
                                    className="flex-1 py-3 bg-[#114536] hover:bg-[#0c382b] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                                    <span>{isResetting ? 'Saving...' : 'Set Password'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}