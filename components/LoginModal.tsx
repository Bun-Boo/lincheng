'use client';

import React, { useState, useEffect } from 'react';
import { Lock, User, UserPlus } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onRegister: (username: string, password: string) => Promise<boolean>;
}

export default function LoginModal({ isOpen, onLogin, onRegister }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  // Check if user exists on mount
  useEffect(() => {
    if (isOpen) {
      checkUserExists();
    }
  }, [isOpen]);

  const checkUserExists = async () => {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      setIsRegisterMode(!data.exists);
      setCheckingUser(false);
    } catch (error) {
      console.error('Error checking user:', error);
      setCheckingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegisterMode) {
      // Register mode
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }

      setIsLoading(true);
      try {
        const success = await onRegister(username.trim(), password);
        if (!success) {
          setPassword('');
          setConfirmPassword('');
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi đăng ký');
        setPassword('');
        setConfirmPassword('');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login mode
      setIsLoading(true);
      try {
        const success = await onLogin(username.trim(), password);
        if (!success) {
          setError('Tên đăng nhập hoặc mật khẩu không đúng');
          setPassword('');
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi đăng nhập');
        setPassword('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  if (checkingUser) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Lock className="text-white" size={32} />
            </div>
            <p className="text-gray-600">Đang kiểm tra...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {isRegisterMode ? (
              <UserPlus className="text-white" size={32} />
            ) : (
              <Lock className="text-white" size={32} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRegisterMode ? 'Đăng ký tài khoản' : 'Đăng nhập'}
          </h2>
          <p className="text-sm text-gray-600 mt-2">LinCheng Store</p>
          {isRegisterMode && (
            <p className="text-xs text-pink-600 mt-2 font-medium">
              Tạo tài khoản đầu tiên (chỉ được có 1 tài khoản)
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Nhập tên đăng nhập"
                required
                autoFocus
                minLength={3}
                className="w-full border rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Nhập mật khẩu"
                required
                minLength={4}
                className="w-full border rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Nhập lại mật khẩu"
                  required
                  minLength={4}
                  className="w-full border rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-500 text-white py-2.5 rounded-lg hover:bg-pink-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? (isRegisterMode ? 'Đang đăng ký...' : 'Đang đăng nhập...')
              : (isRegisterMode ? 'Đăng ký' : 'Đăng nhập')
            }
          </button>
        </form>
      </div>
    </div>
  );
}

