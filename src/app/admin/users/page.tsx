"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, UserCog, MoreVertical, CheckCircle2, Ban } from "lucide-react";
import Image from "next/image";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white h-16 border-b border-gray-200 flex items-center px-4 sm:px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-bold">Back to Dashboard</span>
        </Link>
      </header>

      <main className="flex-grow p-6 sm:p-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <UserCog size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Users & Roles</h1>
            <p className="text-sm text-gray-500">Manage registered artisans and cooperative members.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Artisan Profile</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Items Captured</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      No artisans found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.accountStatus === 'SUSPENDED' ? 'opacity-60' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden relative border border-gray-100">
                            <Image 
                              src={user.artisanProfile?.photoUrl || "/ikat_saree.jpg"} 
                              alt="profile" 
                              fill 
                              className="object-cover" 
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">
                              {user.artisanProfile?.craftType || "Unknown Craft"} • {user.artisanProfile?.location || "Unknown Location"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">UPI: {user.artisanProfile?.upiId || "N/A"}</p>
                      </td>
                      <td className="py-4 px-6 text-center text-sm font-bold text-gray-900">
                        {user._count?.craftItems || 0}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          user.accountStatus === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.accountStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-xs text-gray-400 italic">Managed by System</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
