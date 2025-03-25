"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, Search, Filter, TrendingUp, TrendingDown, BarChart3, Clock, Download } from "lucide-react"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

// Define types for call recordings
type CallRecording = {
  id: number
  title: string
  agent: string
  customer_phone: string
  duration_seconds: number
  uploaded_at: string
  status: string
  sentiment: string
}

export default function CallRecordingsPage() {
  const [recordings, setRecordings] = useState<CallRecording[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sentimentFilter, setSentimentFilter] = useState("all")

  // Fetch call recordings from API
  useEffect(() => {
    const fetchCallRecordings = async () => {
      try {
        setLoading(true)
        const data = await api.get<CallRecording[]>('/api/call-recordings/')
        setRecordings(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch call recordings:", err)
        setError("Failed to load call recordings. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchCallRecordings()
  }, [])

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

  // Apply filters
  const filteredRecordings = recordings.filter((recording) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.agent.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === "all" || recording.status === statusFilter

    // Sentiment filter
    const matchesSentiment = sentimentFilter === "all" || recording.sentiment === sentimentFilter

    return matchesSearch && matchesStatus && matchesSentiment
  })

  // Get sentiment icon
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "neutral":
        return <BarChart3 className="h-4 w-4 text-yellow-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-serif font-bold">Call Recordings</h2>
        <div className="mt-4 sm:mt-0">
          <Link href="/call-recordings/upload">
            <Button className="bg-gold hover:bg-gold/90 text-black">
              <Upload className="mr-2 h-4 w-4" />
              Upload Call
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-gold/30 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif">Filters</CardTitle>
          <CardDescription>Search and filter call recordings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or agent..."
                className="pl-8 border-gold/30 bg-black/50 focus:border-gold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gold/30 bg-black/50 focus:border-gold">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                  <SelectTrigger className="border-gold/30 bg-black/50 focus:border-gold">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Sentiment" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiments</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gold/30 bg-card">
        <CardContent className="p-0">
          {error && (
            <div className="p-4 text-center text-red-500">
              {error}
              <Button 
                variant="link" 
                className="ml-2 text-gold" 
                onClick={() => {
                  setLoading(true)
                  setError(null)
                  api.get<CallRecording[]>('/api/call-recordings/')
                    .then(data => setRecordings(data))
                    .catch(err => setError("Failed to load call recordings. Please try again."))
                    .finally(() => setLoading(false))
                }}
              >
                Retry
              </Button>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gold/30 hover:bg-transparent">
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={`loading-${index}`} className="border-gold/30">
                      <TableCell>
                        <Skeleton className="h-5 w-[250px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[50px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[70px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[70px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredRecordings.map((recording) => (
                    <TableRow key={recording.id} className="border-gold/30 hover:bg-gold/5">
                      <TableCell className="font-medium">
                        <Link href={`/call-recordings/${recording.id}`} className="hover:text-gold">
                          {recording.title}
                        </Link>
                      </TableCell>
                      <TableCell>{recording.agent}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          {formatDuration(recording.duration_seconds)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(recording.uploaded_at)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            recording.status === "completed"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {recording.status === "completed" ? "Completed" : "In Progress"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getSentimentIcon(recording.sentiment)}
                          <span className="ml-1 capitalize">{recording.sentiment}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/call-recordings/${recording.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-gold">
                              <BarChart3 className="h-4 w-4" />
                              <span className="sr-only">View Analysis</span>
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-gold">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!loading && filteredRecordings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No call recordings found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
