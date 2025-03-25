"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, BarChart3, Phone, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getApi, api, mockApi } from "@/lib/api"

// Define Agent type
interface Agent {
  id: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
  employee_id: string;
  department: string;
  hire_date: string;
  avg_coverage_score: number;
  total_calls_handled: number;
}

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const useMockApi = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true)

        // Use the API utility to fetch agents
        let agentsData;
        if (useMockApi) {
          // Use mock data in development
          agentsData = await mockApi.getAgents();
        } else {
          // Use real API in production
          agentsData = await api.get<Agent[]>("/api/agents/");
        }
        setAgents(agentsData)
      } catch (error) {
        console.error("Error fetching agents:", error)
        // Keep using mock data if there's an error
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgents()
  }, [useMockApi])

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
  const filteredAgents = agents.filter((agent) => {
    // Search filter
    const fullName = `${agent.user.first_name} ${agent.user.last_name}`.toLowerCase()
    const matchesSearch =
      searchQuery === "" ||
      fullName.includes(searchQuery.toLowerCase()) ||
      agent.employee_id.toLowerCase().includes(searchQuery.toLowerCase())

    // Department filter
    const matchesDepartment =
      departmentFilter === "all" || agent.department.toLowerCase() === departmentFilter.toLowerCase()

    return matchesSearch && matchesDepartment
  })

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-500"
    if (score >= 8) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-serif font-bold">Agents</h2>
      </div>

      <Card className="border-gold/30 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif">Filters</CardTitle>
          <CardDescription>Search and filter agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or employee ID..."
                className="pl-8 border-gold/30 bg-black/50 focus:border-gold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-40">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="border-gold/30 bg-black/50 focus:border-gold">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Department" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="claims">Claims</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="customer service">Customer Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin mr-2 text-gold" />
          <span className="text-lg">Loading agents...</span>
        </div>
      ) : (
        <Card className="border-gold/30 bg-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gold/30 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Avg. Score</TableHead>
                  <TableHead>Total Calls</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id} className="border-gold/30 hover:bg-gold/5">
                    <TableCell className="font-medium">
                      <Link href={`/agents/${agent.id}`} className="hover:text-gold">
                        {agent.user.first_name} {agent.user.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>{agent.employee_id}</TableCell>
                    <TableCell>{agent.department}</TableCell>
                    <TableCell>{formatDate(agent.hire_date)}</TableCell>
                    <TableCell>
                      <span className={getScoreColor(agent.avg_coverage_score)}>
                        {agent.avg_coverage_score.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>{agent.total_calls_handled}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/agents/${agent.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-gold"
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span className="sr-only">View Performance</span>
                          </Button>
                        </Link>
                        <Link href={`/agents/${agent.id}/calls`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-gold"
                          >
                            <Phone className="h-4 w-4" />
                            <span className="sr-only">View Calls</span>
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAgents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No agents found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
