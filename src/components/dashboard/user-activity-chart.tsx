"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { name: "Pzt", users: 12, active: 8 },
  { name: "Sal", users: 19, active: 15 },
  { name: "Çar", users: 15, active: 12 },
  { name: "Per", users: 25, active: 20 },
  { name: "Cum", users: 22, active: 18 },
  { name: "Cmt", users: 8, active: 5 },
  { name: "Paz", users: 5, active: 3 },
];

export function UserActivityChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Kullanıcı Aktivitesi</CardTitle>
        <CardDescription>Son 7 günün kullanıcı aktivitesi</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} />
            <YAxis stroke="#888888" fontSize={12} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorUsers)"
              name="Toplam Kullanıcı"
            />
            <Area
              type="monotone"
              dataKey="active"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorActive)"
              name="Aktif Kullanıcı"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
