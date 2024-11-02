"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@/components/ui/table';
import Layout from '@/components/Layout';

const apiStats = [
  { method: 'PUT', endpoint: '/API/v1/customers/id', requests: 79 },
  { method: 'GET', endpoint: '/API/v1/customers/id', requests: 145 },
];

const userStats = [
  { username: 'Jaohn23', email: 'john@john.xyz', token: 'jsdfjtr#524$', totalRequests: 143 },
  { username: 'tom45', email: 'tom@tom.io', token: 'uytewyu$e', totalRequests: 12 },
];

const AdminDashboard: React.FC = () => {
  return (
    <Layout>
      <div className="w-full max-w-2xl">
        <Card className="bg-white shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold">Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center">Welcome, Admin!</p>

            <h2 className="text-lg font-semibold mt-4">API Endpoint Stats</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Method</TableHeaderCell>
                  <TableHeaderCell>Endpoint</TableHeaderCell>
                  <TableHeaderCell>Requests</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiStats.map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell>{stat.method}</TableCell>
                    <TableCell>{stat.endpoint}</TableCell>
                    <TableCell>{stat.requests}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <h2 className="text-lg font-semibold mt-4">User API Consumption Stats</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Username</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Token</TableHeaderCell>
                  <TableHeaderCell>Total Requests</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userStats.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.token}</TableCell>
                    <TableCell>{user.totalRequests}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;