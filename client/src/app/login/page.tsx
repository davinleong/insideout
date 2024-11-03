//src/app/login/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import messages from "@/constants/messages";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@/components/ui/table";

interface UserStat {
  username: string;
  email: string;
  token: string;
  totalRequests: number;
}

const AdminDashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='))
          ?.split('=')[1];

        if (!token) {
          setError(messages.auth.notAuthenticated);
          return;
        }

        // Fetch all users
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error(messages.fetch.userStatsError);
        }

        const users = await userResponse.json();

        // Fetch API stats for each user
        const userStatsPromises = users.map(async (user: { id: string; email: string }) => {
          const userStatsResponse = await fetch(`${process.env.API_URL}/api_count?user_id=${user.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (userStatsResponse.ok) {
            const { api_count: totalRequests } = await userStatsResponse.json();
            return {
              email: user.email,
              token: token,
              totalRequests,
            };
          } else {
            console.error(`${messages.fetch.userStatsError} for user ID: ${user.id}`);
            return null;
          }
        });

        const resolvedUserStats = (await Promise.all(userStatsPromises)).filter(Boolean);
        setUserStats(resolvedUserStats as UserStat[]);

      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(messages.fetch.unknownError);
        }
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
              <h2 className="text-lg font-semibold mt-4">{messages.dashboard.userStatsTitle}</h2>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Token</TableHeaderCell>
                    <TableHeaderCell>Total Requests</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userStats.length ? (
                    userStats.map((user, index) => (
                      <TableRow key={index}>
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