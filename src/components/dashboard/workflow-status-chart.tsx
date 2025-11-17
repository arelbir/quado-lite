"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

const data = [
  { name: "Beklemede", count: 12, color: "#fbbf24" },
  { name: "Devam Ediyor", count: 25, color: "#3b82f6" },
  { name: "Tamamlandı", count: 48, color: "#10b981" },
  { name: "Reddedildi", count: 3, color: "#ef4444" },
];

export function WorkflowStatusChart() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>İş Akışı Durumu</CardTitle>
        <CardDescription>Mevcut iş akışlarının dağılımı</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} />
            <YAxis stroke="#888888" fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]} name="Sayı" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
