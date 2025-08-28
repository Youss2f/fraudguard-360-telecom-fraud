"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, DollarSign, TrendingUp, Calendar, AlertTriangle, ChevronDown, ChevronUp, Banknote, Building } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { RechargePayment, FilterState } from "@/types/subscriber"

interface RechargePaymentCardProps {
  data: RechargePayment
  filters: FilterState
}

export function RechargePaymentCard({ data, filters }: RechargePaymentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit card":
        return <CreditCard className="h-4 w-4" />
      case "cash":
        return <Banknote className="h-4 w-4" />
      case "bank transfer":
        return <Building className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recharge & Payment
          </CardTitle>
          <div className="flex items-center gap-2">
            {data.stats.highValueRecharges > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {data.stats.highValueRecharges} High Value
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {data.stats.last7Days.count}
                </div>
                <div className="text-sm text-gray-600">Last 7 Days</div>
                <div className="text-xs text-gray-500">
                  ${data.stats.last7Days.amount}
                </div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {data.stats.last30Days.count}
                </div>
                <div className="text-sm text-gray-600">Last 30 Days</div>
                <div className="text-xs text-gray-500">
                  ${data.stats.last30Days.amount}
                </div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  ${data.stats.avgRechargeAmount.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Average Amount</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">
                  {data.stats.highValueRecharges}
                </div>
                <div className="text-sm text-gray-600">High Value</div>
              </div>
            </div>

            {/* High Value Alert */}
            {data.stats.highValueRecharges > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">High Value Recharges Detected</span>
                </div>
                <div className="text-sm text-yellow-700">
                  {data.stats.highValueRecharges} recharge(s) above $50 threshold detected. Monitor for unusual patterns.
                </div>
              </div>
            )}

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold">Total Spent (30 days)</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ${data.stats.last30Days.amount}
                </div>
                <div className="text-sm text-gray-600">
                  Across {data.stats.last30Days.count} transactions
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold">Recharge Frequency</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {(data.stats.last30Days.count / 30 * 7).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">
                  Average per week
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="methods" className="space-y-4">
            {/* Payment Methods Chart */}
            <div className="space-y-2">
              <h4 className="font-semibold">Payment Methods Distribution</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-48">
                  <ChartContainer
                    config={{
                      count: { label: "Count", color: "hsl(var(--chart-1))" }
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.paymentMethods}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ method, count }) => `${method}: ${count}`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {data.paymentMethods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <p className="text-center text-sm text-gray-600 mt-2">Transaction Count</p>
                </div>
                
                <div className="h-48">
                  <ChartContainer
                    config={{
                      totalAmount: { label: "Amount ($)", color: "hsl(var(--chart-2))" }
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.paymentMethods}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="method" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="totalAmount" fill="var(--color-totalAmount)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <p className="text-center text-sm text-gray-600 mt-2">Total Amount</p>
                </div>
              </div>
            </div>

            {/* Payment Methods Details */}
            <div className="space-y-2">
              <h4 className="font-semibold">Payment Method Details</h4>
              <div className="space-y-2">
                {data.paymentMethods.map((method) => (
                  <div key={method.method} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPaymentMethodIcon(method.method)}
                      <div>
                        <div className="font-medium">{method.method}</div>
                        <div className="text-sm text-gray-600">
                          {method.count} transactions
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">${method.totalAmount}</div>
                      <div className="text-sm text-gray-600">
                        Avg: ${(method.totalAmount / method.count).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Transaction History</h4>
                <Badge variant="outline">{data.rechargeHistory.length} records</Badge>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {data.rechargeHistory.map((transaction, index) => (
                  <div 
                    key={`${transaction.timestamp}-${transaction.amount}`}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      transaction.isHighValue 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(transaction.method)}
                        {transaction.isHighValue && (
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">${transaction.amount}</div>
                        <div className="text-sm text-gray-600">{transaction.method}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{transaction.location}</div>
                      {transaction.isHighValue && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          High Value
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
