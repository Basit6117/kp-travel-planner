'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Trash2, CheckCircle, Clock } from 'lucide-react';

export default function AdminMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
    if (status === 'authenticated') fetchMessages();
  }, [status]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRead = async (id: string) => {
    setUpdatingId(id);
    try {
      await fetch(`/api/admin/messages?id=${id}`, { method: 'PATCH' });
      fetchMessages();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message permanently?')) return;
    setUpdatingId(id);
    try {
      await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
      fetchMessages();
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Contact Messages</h1>
        <p className="text-slate-400 text-sm mt-1">{messages.length} messages received from users</p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-500">
          <Mail className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          <p className="font-medium text-slate-400 mb-1">No messages yet</p>
          <p className="text-sm">Submissions from the Contact Us form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`bg-slate-900 border ${
                msg.read ? 'border-slate-800/80 opacity-75' : 'border-emerald-500/30'
              } rounded-2xl p-6 transition-all`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-white text-base">{msg.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        msg.read
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {msg.read ? 'Read' : 'New'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 mt-0.5">{msg.email}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 flex items-center mr-2">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => toggleRead(msg._id)}
                    disabled={updatingId === msg._id}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{msg.read ? 'Mark Unread' : 'Mark Read'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(msg._id)}
                    disabled={updatingId === msg._id}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
