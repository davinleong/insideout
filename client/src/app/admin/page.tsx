"use client";

import React, { useEffect, useState } from "react";
import messages from "@/constants/messages";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

interface ApiStat {
  method: string;
  endpoint: string;
  requests: number;
}

interface UserStat {
  username: string;
  email: string;
  totalRequests: number;
}

const AdminDashboard: React.FC = () => {
  const [apiStats, setApiStats] = useState<ApiStat[]>([]);
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Authenticate admin user
        const authResponse = await fetch(
          `${process.env.NEXT_PUBLIC_USER_DATABASE}/verify-token`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!authResponse.ok) {
          throw new Error("Authentication failed. Please log in.");
        }

        const authData = await authResponse.json();
        if (authData.info.role !== "admin") {
          router.replace("/login");
          return;
        }

        // Fetch API call and user data
        const [apiCallsResponse, usersResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_USER_DATABASE}/api-calls`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${process.env.NEXT_PUBLIC_USER_DATABASE}/users`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        if (!apiCallsResponse.ok || !usersResponse.ok) {
          throw new Error("Failed to fetch data.");
        }

        const apiCalls = await apiCallsResponse.json();
        const users = await usersResponse.json();

        // Aggregate API stats by method and endpoint
        const apiStatsMap = new Map<string, ApiStat>();
        apiCalls.forEach((call: { http_method: string; endpoint: string }) => {
          const key = `${call.http_method} ${call.endpoint}`;
          if (apiStatsMap.has(key)) {
            const stat = apiStatsMap.get(key)!;
            stat.requests += 1;
          } else {
            apiStatsMap.set(key, {
              method: call.http_method,
              endpoint: call.endpoint,
              requests: 1,
            });
          }
        });

        const sortedApiStats = Array.from(apiStatsMap.values()).sort((a, b) => {
          if (a.endpoint === b.endpoint) {
            return a.method.localeCompare(b.method);
          }
          return a.endpoint.localeCompare(b.endpoint);
        });
        setApiStats(sortedApiStats);

        // Aggregate user stats
        const userStatsMap = new Map<string, number>();
        apiCalls.forEach((call: { user_id: string }) => {
          if (userStatsMap.has(call.user_id)) {
            userStatsMap.set(call.user_id, userStatsMap.get(call.user_id)! + 1);
          } else {
            userStatsMap.set(call.user_id, 1);
          }
        });

        const userStatsArray: UserStat[] = users.map(
            (user: { id: string; email: string; username?: string }) => ({
            username: user.username || `User ID: ${user.id}`,
            email: user.email,
            totalRequests: userStatsMap.get(user.id) || 0,
          })
        );

        setUserStats(userStatsArray);
      } catch (error: any) {
        setError(error.message || "An error occurred.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-4xl bg-white shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            {messages.dashboard.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <p className="text-center">{messages.loading}</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <>
              {/* API Stats Table */}
              <h2 className="text-lg font-semibold mt-4">
                {messages.dashboard.apiStatsTitle}
              </h2>
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
                      <TableCell className="text-center">
                        {messages.table.noApiStats}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* User Stats Table */}
              <h2 className="text-lg font-semibold mt-4">
                {messages.dashboard.userStatsTitle}
              </h2>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Username</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Total Requests</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userStats.length ? (
                    userStats.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.totalRequests}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-center">
                        {messages.table.noUserStats}
                      </TableCell>
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