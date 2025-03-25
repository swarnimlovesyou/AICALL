"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Phone,
  User,
  Calendar,
  Building,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Download,
  ChevronRight,
} from "lucide-react"

// Mock data for agent details
const mockAgent = {
  id: 1,
  user: {
    username: "john_agent",
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@example.com",
  },
  employee_id: "EMP12345",
  department: "Claims",
  hire_date: "2023-01-15",
  avg_coverage_score: 8.5,
  total_calls_handled: 120,
  performance: {
    sentiment_scores: {
      positive: 65,
      neutral: 25,
      negative: 10,
    },
    compliance_rate: 92,
    avg_call_duration: 345, // seconds
    key_strengths: ["Customer empathy", "Technical knowledge", "Problem resolution"],
    improvement_areas: ["Call efficiency", "Disclosure statements", "Upselling opportunities"],
  },
}

// Mock data for recent calls
const mockRecentCalls = [
  {
    id: 1,
    title: "Customer Complaint - Billing Issue",
    customer_phone: "555-123-4567",
    duration_seconds: 345,
    date: "2025-03-24",
    sentiment: "negative",
  },
  {
    id: 2,
    title: "Policy Renewal Discussion",
    customer_phone: "555-234-5678",
    duration_seconds: 492,
    date: "2025-03-22",
    sentiment: "positive",
  },
  {
    id: 3,
    title: "Claim Status Inquiry",
    customer_phone: "555-345-6789",
    duration_seconds: 207,
    date: "2025-03-20",
    sentiment: "neutral",
  },
  {
    id: 4,
    title: "Coverage Explanation",
    customer_phone: "555-456-7890",
    duration_seconds: 603,
    date: "2025-03-18",
    sentiment: "positive",
  },
  {
    id: 5,
    title: "Dispute Resolution",
    customer_phone: "555-567-8901",
    duration_seconds: 438,
    date: "2025-03-15",
    sentiment: "negative",
  },
]

// Mock data for performance trends
const mockPerformanceTrends = {
  coverage_scores: [8.2, 8.3, 8.4, 8.5, 8.7, 8.5, 8.6, 8.5],
  compliance_rates: [88, 90, 91, 92, 94, 93, 92, 92],
  call_durations: [380, 360, 350, 345, 340, 330, 345, 345],
  dates: ["Mar 1", "Mar 5", "Mar 10", "Mar 15", "Mar 20", "Mar 25", "Mar 30", "Apr 5"],
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  // Format duration from seconds to mm:ss
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get sentiment color
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

  // Get sentiment icon
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
      <div className="flex items-center">
        <Link href="/agents" className="mr-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-serif font-bold">
          {mockAgent.user.first_name} {mockAgent.user.last_name}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Performance Overview */}
          <Card className="border-gold/30 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">Performance Overview</CardTitle>
              <CardDescription>Key metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Coverage Score</h4>
                    <span className="text-sm font-medium">{mockAgent.avg_coverage_score.toFixed(1)}/10</span>
                  </div>
                  <Progress value={mockAgent.avg_coverage_score * 10} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {mockAgent.avg_coverage_score >= 8.5 ? (
                      <span className="text-green-500 flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Above average
                      </span>
                    ) : (
                      <span className="text-yellow-500 flex items-center">
                        <BarChart3 className="mr-1 h-3 w-3" />
                        Average
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Compliance Rate</h4>
                    <span className="text-sm font-medium">{mockAgent.performance.compliance_rate}%</span>
                  </div>
                  <Progress value={mockAgent.performance.compliance_rate} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {mockAgent.performance.compliance_rate >= 90 ? (
                      <span className="text-green-500 flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Good compliance
                      </span>
                    ) : (
                      <span className="text-yellow-500 flex items-center">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Needs improvement
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Avg. Call Duration</h4>
                    <span className="text-sm font-medium">
                      {formatDuration(mockAgent.performance.avg_call_duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {mockAgent.performance.avg_call_duration <= 360 ? "Efficient" : "Slightly long"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-3">Sentiment Distribution</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs flex items-center text-green-500">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Positive
                        </span>
                        <span className="text-xs">{mockAgent.performance.sentiment_scores.positive}%</span>
                      </div>
                      <Progress
                        value={mockAgent.performance.sentiment_scores.positive}
                        className="h-1.5 bg-green-500/20"
                      >
                        <div className="h-full bg-green-500" />
                      </Progress>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs flex items-center text-yellow-500">
                          <BarChart3 className="mr-1 h-3 w-3" />
                          Neutral
                        </span>
                        <span className="text-xs">{mockAgent.performance.sentiment_scores.neutral}%</span>
                      </div>
                      <Progress
                        value={mockAgent.performance.sentiment_scores.neutral}
                        className="h-1.5 bg-yellow-500/20"
                      >
                        <div className="h-full bg-yellow-500" />
                      </Progress>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs flex items-center text-red-500">
                          <TrendingDown className="mr-1 h-3 w-3" />
                          Negative
                        </span>
                        <span className="text-xs">{mockAgent.performance.sentiment_scores.negative}%</span>
                      </div>
                      <Progress value={mockAgent.performance.sentiment_scores.negative} className="h-1.5 bg-red-500/20">
                        <div className="h-full bg-red-500" />
                      </Progress>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Key Insights</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-medium text-green-500 mb-1">Strengths</h5>
                      <div className="flex flex-wrap gap-2">
                        {mockAgent.performance.key_strengths.map((strength, index) => (
                          <Badge key={index} className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-yellow-500 mb-1">Areas for Improvement</h5>
                      <div className="flex flex-wrap gap-2">
                        {mockAgent.performance.improvement_areas.map((area, index) => (
                          <Badge key={index} className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card className="border-gold/30 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-serif">Performance Trends</CardTitle>
                  <CardDescription>Historical performance data</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-black/50 rounded-md">
                <div className="text-center">
                  <BarChart3 className="h-10 w-10 text-gold mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Performance chart visualization would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Calls */}
          <Card className="border-gold/30 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-serif">Recent Calls</CardTitle>
                  <CardDescription>Latest analyzed call recordings</CardDescription>
                </div>
                <Link href={`/agents/${params.id}/calls`}>
                  <Button variant="link" className="text-gold p-0 h-auto">
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gold/10">
                {mockRecentCalls.map((call) => (
                  <Link
                    key={call.id}
                    href={`/call-recordings/${call.id}`}
                    className="flex items-center p-3 hover:bg-gold/5 transition-colors"
                  >
                    <div className="mr-4">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          call.sentiment === "positive"
                            ? "bg-green-500"
                            : call.sentiment === "negative"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{call.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {call.customer_phone} • {call.date}
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDuration(call.duration_seconds)}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Details Sidebar */}
        <div className="space-y-6">
          <Card className="border-gold/30 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">Agent Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <p className="font-medium">
                    {mockAgent.user.first_name} {mockAgent.user.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{mockAgent.user.email}</p>
                </div>
              </div>

              <div className="pt-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <Building className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="font-medium">{mockAgent.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employee ID</p>
                    <p className="font-medium">{mockAgent.employee_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hire Date</p>
                    <p className="font-medium">{formatDate(mockAgent.hire_date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Calls</p>
                    <p className="font-medium">{mockAgent.total_calls_handled}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold/30 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-gold hover:bg-gold/90 text-black">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              <Button variant="outline" className="w-full border-gold/30 text-white hover:bg-gold/10 hover:text-gold">
                Schedule Training
              </Button>
              <Button variant="outline" className="w-full border-gold/30 text-white hover:bg-gold/10 hover:text-gold">
                Send Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

