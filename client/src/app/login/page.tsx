"use client";

import React, { useEffect, useState } from 'react';
import messages from "@/constants/messages";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        // Retrieve the token from cookies (httpOnly cookie)
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='))
          ?.split('=')[1];

        if (!token) {
          setError(messages.auth.notAuthenticated);
          return;
        }

        // Fetch API stats
        const apiStatsResponse = await fetch(`${process.env.API_URL}/api_count`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
        });

        if (apiStatsResponse.ok) {
          const apiStatsData = await apiStatsResponse.json();
          setApiStats(apiStatsData); 
        } else {
          setError(messages.fetch.apiStatsError);
          console.error(messages.fetch.apiStatsError, apiStatsResponse.statusText);
        }

        // Fetch user stats
        const userStatsResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_DATABASE}/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (userStatsResponse.ok) {
          const userStatsData = await userStatsResponse.json();
          setUserStats(userStatsData);
        } else {
          setError(messages.fetch.userStatsError);
          console.error(messages.fetch.userStatsError, userStatsResponse.statusText);
        }

      } catch (error) {
        setError(messages.fetch.unknownError);
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
          <CardTitle className="text-center text-xl font-bold">{messages.dashboard.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <p className="text-center">{messages.loading}</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <>
              <h2 className="text-lg font-semibold mt-4">{messages.dashboard.apiStatsTitle}</h2>
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
                        {messages.table.noApiStats}
                      </td>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <h2 className="text-lg font-semibold mt-4">{messages.dashboard.userStatsTitle}</h2>
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
                        {messages.table.noUserStats}
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