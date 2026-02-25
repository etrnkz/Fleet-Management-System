"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
    {
        name: "Jan",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Feb",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Mar",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Apr",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "May",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Jun",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Jul",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Aug",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Sep",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Oct",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Nov",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
    {
        name: "Dec",
        total: Math.floor(Math.random() * 5000) + 1000,
    },
]

export function OverviewChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                    contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        backgroundColor: 'hsl(var(--card))',
                        color: 'hsl(var(--card-foreground))'
                    }}
                    formatter={(value) => [`${value} ETB`, 'Revenue']}
                />
                <Bar
                    dataKey="total"
                    fill="hsl(217 91% 60%)"
                    radius={[8, 8, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
