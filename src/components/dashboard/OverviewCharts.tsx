"use client"

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { MonthlyCollectionTrend, WasteCategoryMetric } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface OverviewChartsProps {
  monthlyTrends: MonthlyCollectionTrend[]
  categoryMetrics: WasteCategoryMetric[]
}

export function OverviewCharts({
  monthlyTrends,
  categoryMetrics,
}: OverviewChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 2 Cols: Monthly Trend Area Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Tren Pengumpulan Sampah (6 Bulan Terakhir)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Volume sampah terpilah (Kg) berdasarkan kategori per bulan
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
              Organik
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Anorganik
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              B3
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrends}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorOrganik" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAnorganik" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorB3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickFormatter={(val) => `${val} kg`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val ?? 0} Kg`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="Organik"
                  stroke="#16A34A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOrganik)"
                />
                <Area
                  type="monotone"
                  dataKey="Anorganik"
                  stroke="#0284C7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAnorganik)"
                />
                <Area
                  type="monotone"
                  dataKey="B3"
                  stroke="#DC2626"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorB3)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 1 Col: Category Distribution Pie / Donut */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-900">
            Komposisi Kategori Sampah
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Persentase total tonase terpilah saat ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-50 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryMetrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="total_weight_kg"
                  nameKey="category"
                >
                  {categoryMetrics.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val ?? 0} Kg`, 'Berat']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown Metric Rows */}
          <div className="mt-4 space-y-2.5">
            {categoryMetrics.map((metric) => (
              <div
                key={metric.category}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: metric.color }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {metric.category}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {metric.pickup_count} Penjemputan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">
                    {metric.total_weight_kg.toLocaleString('id-ID')} Kg
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    {metric.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

