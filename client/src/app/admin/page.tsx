"use client";

import React, { useEffect, useState } from 'react';
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@/components/ui/table";

interface ApiStat {
  method: string;
  endpoint: string;
  requests: number;
}

interface UserStat {
  username: string;
  email: string;
  token: string;
  totalRequests: number;
}

const AdminDashboard: React.FC = () => {
  const [apiStats, setApiStats] = useState<ApiStat[]>([]);
  const [userStats, setUserStats] = useState<UserStat[]>([]);

  useEffect(() => {
    // Fetch data from the API
    const fetchApiData = async () => {
      try {
        const response = await fetch("https://potipress.com/flaskapp/process", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Assuming the response structure contains apiStats and userStats
          setApiStats(data.apiStats || []);
          setUserStats(data.userStats || []);
        } else {
          console.error("Failed to fetch data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchApiData();
  }, []);

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-2xl bg-white shadow-md rounded-lg">
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