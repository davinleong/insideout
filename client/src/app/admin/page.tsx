"use client";

import React, { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        // Adjust the endpoint to the correct one that retrieves API stats
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        if (response.ok) {
          const data = await response.json();
          setApiStats(data.apiStats || []);
          setUserStats(data.userStats || []);
        } else {
          setError("Failed to fetch data.");
          console.error("Failed to fetch data:", response.statusText);
        }
      } catch (error) {
        setError("An error occurred while fetching data.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchApiData();
  }, []);

  return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-2xl bg-white shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold">Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <p className="text-center">Loading data...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <>
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
                    {apiStats.length ? (
                      apiStats.map((stat, index) => (
                        <TableRow key={index}>
                          <TableCell>{stat.method}</TableCell>
                          <TableCell>{stat.endpoint}</TableCell>
                          <TableCell>{stat.requests}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <td colSpan={3} className="text-center">
                          No API stats available.
                        </td>
                      </TableRow>
                    )}
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
                    {userStats.length ? (
                      userStats.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.token}</TableCell>
                          <TableCell>{user.totalRequests}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <td colSpan={4} className="text-center">
                          No user stats available.
                        </td>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default AdminDashboard;