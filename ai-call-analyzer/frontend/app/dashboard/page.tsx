"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  PhoneCall,
  Clock,
  AlertTriangle,
  ChevronRight,
  Upload,
  Loader2,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { api, mockApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

// Types
type PerformanceData = {
  callsAnalyzed: number
  avgSentiment: number
  complianceRate: number
  keyIssues: number
  trend: "up" | "down" | "neutral"
}

type CallRecording = {
  id: number
  title: string
  agent: string
  duration_seconds?: number
  duration?: string
  sentiment: string
  status: string
  date?: string
  uploaded_at: string
}

type Agent = {
  id: number
  user: {
    first_name: string
    last_name: string
  }
  department: string
  avg_coverage_score: number
  total_calls_handled: number
}

type KeyIssue = {
  issue: string
  count: number
  change: number
}

// Fallback data in case API calls fail
const fallbackPerformanceData = {
  daily: {
    callsAnalyzed: 0,
    avgSentiment: 0,
    complianceRate: 0,
    keyIssues: 0,
    trend: "neutral" as const,
  },
  weekly: {
    callsAnalyzed: 0,
    avgSentiment: 0,
    complianceRate: 0,
    keyIssues: 0,
    trend: "neutral" as const,
  },
  monthly: {
    callsAnalyzed: 0,
    avgSentiment: 0,
    complianceRate: 0,
    keyIssues: 0,
    trend: "neutral" as const,
  },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState("daily")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const useMockApi = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL
  
  // State for API data
  const [performanceData, setPerformanceData] = useState<Record<string, PerformanceData>>(fallbackPerformanceData)
  const [recentCalls, setRecentCalls] = useState<CallRecording[]>([])
  const [topAgents, setTopAgents] = useState<Agent[]>([])
  const [keyIssues, setKeyIssues] = useState<KeyIssue[]>([])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      
      try {
        if (useMockApi) {
          // Use mock data for development
          setPerformanceData(fallbackPerformanceData)
          setRecentCalls([
            {
              id: 1,
              title: "Customer Complaint - Billing Issue",
              agent: "John Smith",
              duration_seconds: 345,
              duration: "5:45",
              sentiment: "negative",
              status: "completed",
              date: "2025-03-20",
              uploaded_at: "2025-03-20T10:30:00Z"
            },
            {
              id: 2,
              title: "Policy Renewal Discussion",
              agent: "Sarah Johnson",
              duration_seconds: 420,
              duration: "7:00",
              sentiment: "positive",
              status: "completed",
              date: "2025-03-21",
              uploaded_at: "2025-03-21T14:15:00Z"
            }
          ]);
          
          setTopAgents([
            {
              id: 1,
              user: {
                first_name: "John",
                last_name: "Smith"
              },
              department: "Claims",
              avg_coverage_score: 9.2,
              total_calls_handled: 120
            },
            {
              id: 2,
              user: {
                first_name: "Sarah",
                last_name: "Johnson"
              },
              department: "Sales",
              avg_coverage_score: 8.7,
              total_calls_handled: 185
            }
          ]);
          
          setKeyIssues([
            { issue: "Missing disclosure statements", count: 12, change: 2 },
            { issue: "Incorrect policy information", count: 8, change: -3 },
            { issue: "Insufficient explanation of terms", count: 6, change: 0 }
          ]);
        } else {
          // Fetch performance metrics
          const metricsResponse = await api.get<Record<string, PerformanceData>>('/api/metrics/performance/')
          setPerformanceData(metricsResponse || fallbackPerformanceData)
          
          // Fetch recent call recordings
          const callsResponse = await api.get<CallRecording[]>('/api/call-recordings/?limit=5')
          
          // Process the call recordings data
          const processedCalls = callsResponse.map(call => ({
            ...call,
            // Format the date from ISO string
            date: new Date(call.uploaded_at).toISOString().split('T')[0],
            // Format the duration from seconds to mm:ss
            duration: call.duration_seconds 
              ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')}` 
              : "0:00"
          }))
          
          setRecentCalls(processedCalls)
          
          // Fetch top agents
          const agentsResponse = await api.get<Agent[]>('/api/agents/leaderboard/?limit=3')
          setTopAgents(agentsResponse)
          
          // Fetch key issues
          const issuesResponse = await api.get<KeyIssue[]>('/api/call-analyses/key-issues/')
          setKeyIssues(issuesResponse)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error loading dashboard data",
          description: "Could not load some dashboard data. Using fallback values.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [toast, useMockApi])

  const currentPerformanceData = performanceData[timeframe] || fallbackPerformanceData[timeframe as keyof typeof fallbackPerformanceData]

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-500"
      case "negative":
        return "text-red-500"
      default:
        return "text-yellow-500"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4" />
      case "negative":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-serif font-bold">
          Welcome back, <span className="gold-gradient">{user?.first_name || 'User'}</span>
        </h2>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link href="/call-recordings/upload">
            <Button className="bg-gold hover:bg-gold/90 text-black">
              <Upload className="mr-2 h-4 w-4" />
              Upload Call
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-gold mb-2" />
            <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Performance metrics */}
          <Tabs defaultValue="daily" className="space-y-4" onValueChange={setTimeframe}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif font-medium">Performance Overview</h3>
              <TabsList className="bg-black border border-gold/30">
                <TabsTrigger value="daily" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  Daily
                </TabsTrigger>
                <TabsTrigger value="weekly" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  Monthly
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-gold/30 bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Calls Analyzed</CardTitle>
                  <PhoneCall className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentPerformanceData.callsAnalyzed}</div>
                  <p className="text-xs text-muted-foreground">
                    {currentPerformanceData.trend === "up" ? (
                      <span className="text-green-500 flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        +5.2% from previous
                      </span>
                    ) : currentPerformanceData.trend === "down" ? (
                      <span className="text-red-500 flex items-center">
                        <TrendingDown className="mr-1 h-3 w-3" />
                        -3.1% from previous
                      </span>
                    ) : (
                      <span className="text-yellow-500 flex items-center">
                        <BarChart3 className="mr-1 h-3 w-3" />
                        No change from previous
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gold/30 bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Sentiment</CardTitle>
                  <Users className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(currentPerformanceData.avgSentiment * 100).toFixed(0)}%</div>
                  <Progress
                    value={currentPerformanceData.avgSentiment * 100}
                    className="h-2 mt-2 bg-white/10"
                  />
                </CardContent>
              </Card>

              <Card className="border-gold/30 bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentPerformanceData.complianceRate}%</div>
                  <Progress
                    value={currentPerformanceData.complianceRate}
                    className={`h-2 mt-2 bg-white/10 ${
                      currentPerformanceData.complianceRate >= 90
                        ? "text-green-500"
                        : currentPerformanceData.complianceRate >= 75
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  />
                </CardContent>
              </Card>

              <Card className="border-gold/30 bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Key Issues</CardTitle>
                  <Clock className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentPerformanceData.keyIssues}</div>
                  <p className="text-xs text-muted-foreground">
                    {currentPerformanceData.trend === "down" ? (
                      <span className="text-green-500 flex items-center">
                        <TrendingDown className="mr-1 h-3 w-3" />
                        Reduced from previous
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Increased from previous
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          </Tabs>

          {/* Recent calls section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif font-medium">Recent Call Recordings</h3>
              <Link href="/call-recordings" className="text-gold hover:underline text-sm flex items-center">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gold/30">
                    <th className="text-left px-2 py-3 text-sm font-medium">Title</th>
                    <th className="text-left px-2 py-3 text-sm font-medium">Agent</th>
                    <th className="text-left px-2 py-3 text-sm font-medium">Duration</th>
                    <th className="text-left px-2 py-3 text-sm font-medium">Sentiment</th>
                    <th className="text-left px-2 py-3 text-sm font-medium">Status</th>
                    <th className="text-left px-2 py-3 text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted-foreground">
                        No call recordings found. Upload your first call to get started.
                      </td>
                    </tr>
                  ) : (
                    recentCalls.map((call) => (
                      <tr key={call.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-2 py-3">
                          <Link href={`/call-recordings/${call.id}`} className="hover:text-gold">
                            {call.title}
                          </Link>
                        </td>
                        <td className="px-2 py-3">{call.agent}</td>
                        <td className="px-2 py-3">{call.duration}</td>
                        <td className="px-2 py-3">
                          <span className={`flex items-center ${getSentimentColor(call.sentiment)}`}>
                            {getSentimentIcon(call.sentiment)}
                            <span className="ml-1 capitalize">{call.sentiment}</span>
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              call.status === "completed"
                                ? "bg-green-500/20 text-green-500"
                                : call.status === "processing"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {call.status === "completed"
                              ? "Completed"
                              : call.status === "processing"
                              ? "Processing"
                              : "Failed"}
                          </span>
                        </td>
                        <td className="px-2 py-3">{call.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top agents section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif font-medium">Top Performing Agents</h3>
              <Link href="/agents" className="text-gold hover:underline text-sm flex items-center">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {topAgents.map((agent) => (
                <Card key={agent.id} className="border-gold/30 bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{agent.user.first_name} {agent.user.last_name}</CardTitle>
                    <CardDescription>{agent.department}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Score</span>
                        <span className="font-medium">{agent.avg_coverage_score.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Calls Handled</span>
                        <span className="font-medium">{agent.total_calls_handled}</span>
                      </div>
                      <div className="pt-2">
                        <Link href={`/agents/${agent.id}`}>
                          <Button variant="outline" className="w-full border-gold/30 hover:bg-gold/10 hover:text-gold">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {topAgents.length === 0 && (
                <div className="md:col-span-3 text-center py-6 text-muted-foreground">
                  No agent data available.
                </div>
              )}
            </div>
          </div>

          {/* Key issues section */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-medium">Key Compliance Issues</h3>

            <div>
              {keyIssues.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No compliance issues identified.
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gold/30">
                      <th className="text-left px-4 py-3 text-sm font-medium">Issue</th>
                      <th className="text-right px-4 py-3 text-sm font-medium">Count</th>
                      <th className="text-right px-4 py-3 text-sm font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keyIssues.map((issue, index) => (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-4 py-3">{issue.issue}</td>
                        <td className="px-4 py-3 text-right">{issue.count}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={
                              issue.change > 0
                                ? "text-red-500 flex items-center justify-end"
                                : issue.change < 0
                                ? "text-green-500 flex items-center justify-end"
                                : "text-yellow-500 flex items-center justify-end"
                            }
                          >
                            {issue.change > 0 ? (
                              <>
                                <TrendingUp className="mr-1 h-4 w-4" />+{issue.change}
                              </>
                            ) : issue.change < 0 ? (
                              <>
                                <TrendingDown className="mr-1 h-4 w-4" />
                                {issue.change}
                              </>
                            ) : (
                              <>
                                <BarChart3 className="mr-1 h-4 w-4" />0
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
