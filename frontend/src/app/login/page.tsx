"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userCredentials = { email: 'john@john.com', password: '123' };
    const adminCredentials = { email: 'admin@admin.com', password: '111' };

    if (email === adminCredentials.email && password === adminCredentials.password) {
      router.push('/admin');
    } else if (email === userCredentials.email && password === userCredentials.password) {
      router.push('/dashboard');
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold">Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                <Input
                  type="email"
                  id="email"
                  placeholder="admin@admin.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gray-800 text-white hover:bg-gray-900">
                Login
              </Button>
            </form>
            <div className="flex justify-between text-sm mt-4">
              <a href="#" className="text-gray-700 hover:text-gray-900" onClick={() => alert("Sign-Up feature is not implemented yet.")}>
                Sign Up
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900" onClick={() => alert("Forgot Password feature is not implemented yet.")}>
                Forgot Password?
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LoginPage;