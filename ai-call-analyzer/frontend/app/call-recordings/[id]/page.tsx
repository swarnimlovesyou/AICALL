"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Phone,
  User,
  Calendar,
} from "lucide-react"

// Define types for call recording and analysis
type CallRecording = {
  id: number
  title: string
  agent: {
    id: number
    name: string
    department: string
  }
  customer_phone: string
  duration_seconds: number
  uploaded_at: string
  status: string
  file_url: string
}

type CallAnalysis = {
  id: number
  call_recording_id: number
  agent_id: number
  transcription_text: string
  agent_text: string
  customer_text: string
  sentiment: string
  key_issues: string[]
  coverage_score: number
  confidence_score: number
  compliance_check: {
    identity_verification: boolean
    disclosure_statements: boolean
    call_recording_notice: boolean
    data_protection: boolean
  }
  created_at: string
}

export default function CallRecordingDetailPage({ params }: { params: { id: string } }) {
  const [callRecording, setCallRecording] = useState<CallRecording | null>(null)
  const [callAnalysis, setCallAnalysis] = useState<CallAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeTab, setActiveTab] = useState("transcription")
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch call recording and analysis data
  useEffect(() => {
    const fetchCallData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch call recording details
        const recordingData = await api.get<CallRecording>(`/api/call-recordings/${params.id}/`)
        setCallRecording(recordingData)

        // Fetch call analysis data
        const analysisData = await api.get<CallAnalysis>(`/api/call-analyses/recording/${params.id}/`)
        setCallAnalysis(analysisData)

        if (recordingData.duration_seconds) {
          setDuration(recordingData.duration_seconds)
        }
      } catch (err) {
        console.error("Failed to fetch call data:", err)
        setError("Failed to load call data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchCallData()
  }, [params.id])

  // Format duration from seconds to mm:ss
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get sentiment icon and color
  const getSentimentInfo = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return {
          icon: <TrendingUp className="h-5 w-5" />,
          color: "text-green-500",
          bgColor: "bg-green-500/20",
        }
      case "negative":
        return {
          icon: <TrendingDown className="h-5 w-5" />,
          color: "text-red-500",
          bgColor: "bg-red-500/20",
        }
      default:
        return {
          icon: <BarChart3 className="h-5 w-5" />,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/20",
        }
    }
  }

  const sentimentInfo = callAnalysis ? getSentimentInfo(callAnalysis.sentiment) : getSentimentInfo("neutral")

  // Handle audio player functionality
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }

    audioRef.current.muted = isMuted
  }, [isPlaying, isMuted])

  // Update current time
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // Handle audio end
  const handleAudioEnd = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  // Handle seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return
    
    const progressBar = e.currentTarget
    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    
    setCurrentTime(newTime)
    audioRef.current.currentTime = newTime
  }

  // Handle retry
  const handleRetry = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch call recording details
      const recordingData = await api.get<CallRecording>(`/api/call-recordings/${params.id}/`)
      setCallRecording(recordingData)

      // Fetch call analysis data
      const analysisData = await api.get<CallAnalysis>(`/api/call-analyses/recording/${params.id}/`)
      setCallAnalysis(analysisData)

      if (recordingData.duration_seconds) {
        setDuration(recordingData.duration_seconds)
      }
    } catch (err) {
      console.error("Failed to fetch call data:", err)
      setError("Failed to load call data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/call-recordings" className="mr-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-gold">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Skeleton className="h-8 w-[300px]" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-gold/30 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif">Call Recording</CardTitle>
                <CardDescription>Listen to the original call audio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>

            <Card className="border-gold/30 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif">Call Analysis</CardTitle>
                <CardDescription>AI-generated analysis of the call</CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gold/30 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif">Call Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>

            <Card className="border-gold/30 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/call-recordings" className="mr-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-gold">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-serif font-bold">Call Recording Details</h2>
        </div>

        <Card className="border-gold/30 bg-card">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="text-xl font-serif">Error Loading Call Data</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={handleRetry} className="bg-gold hover:bg-gold/90 text-black">Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!callRecording || !callAnalysis) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/call-recordings" className="mr-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-gold">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-serif font-bold">Call Recording Not Found</h2>
        </div>

        <Card className="border-gold/30 bg-card">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
              <h3 className="text-xl font-serif">Call Recording Not Found</h3>
              <p className="text-muted-foreground">The requested call recording could not be found.</p>
              <Link href="/call-recordings">
                <Button className="bg-gold hover:bg-gold/90 text-black">Return to Call Recordings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {callRecording.file_url && (
        <audio
          ref={audioRef}
          src={callRecording.file_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration)
            }
          }}
          onEnded={handleAudioEnd}
          style={{ display: 'none' }}
        />
      )}

      <div className="flex items-center">
        <Link href="/call-recordings" className="mr-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-serif font-bold">{callRecording.title}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Audio Player */}
          <Card className="border-gold/30 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">Call Recording</CardTitle>
              <CardDescription>Listen to the original call audio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-black/50 rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-gold/20 text-gold hover:bg-gold/30"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <div>
                      <span className="text-sm">{formatDuration(currentTime)}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span className="text-sm text-muted-foreground">{formatDuration(duration)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-gold"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>

                <div 
                  className="relative w-full h-2 bg-gold/10 rounded-full overflow-hidden cursor-pointer" 
                  onClick={handleSeek}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-gold transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gold/30 text-gold hover:bg-gold/10"
                  onClick={() => {
                    if (callRecording.file_url) {
                      window.open(callRecording.file_url, '_blank')
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Audio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Tabs */}
          <Card className="border-gold/30 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">Call Analysis</CardTitle>
              <CardDescription>AI-generated analysis of the call</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="transcription" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-black border border-gold/30 w-full justify-start">
                  <TabsTrigger
                    value="transcription"
                    className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
                  >
                    Transcription
                  </TabsTrigger>
                  <TabsTrigger
                    value="sentiment"
                    className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
                  >
                    Sentiment
                  </TabsTrigger>
                  <TabsTrigger
                    value="compliance"
                    className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
                  >
                    Compliance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transcription" className="space-y-4">
                  <div className="bg-black/50 rounded-md p-4 max-h-[400px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{callAnalysis.transcription_text}</pre>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gold/30 text-gold hover:bg-gold/10"
                      onClick={() => {
                        // Create a blob with the transcript and download it
                        const blob = new Blob([callAnalysis.transcription_text], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `transcript-${callRecording.id}.txt`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Transcript
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="sentiment" className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-full ${sentimentInfo.bgColor} flex items-center justify-center ${sentimentInfo.color}`}
                        >
                          {sentimentInfo.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">Overall Sentiment</h4>
                          <p className={`capitalize ${sentimentInfo.color}`}>{callAnalysis.sentiment}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Confidence Score</h4>
                        <div className="flex items-center gap-2">
                          <Progress value={callAnalysis.confidence_score * 100} className="h-2 flex-1" />
                          <span className="text-sm">{(callAnalysis.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Key Issues Identified</h4>
                      <div className="space-y-2">
                        {callAnalysis.key_issues.map((issue, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Agent Performance</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Coverage Score</span>
                          <span className="text-sm">{callAnalysis.coverage_score}/10</span>
                        </div>
                        <Progress value={callAnalysis.coverage_score * 10} className="h-2" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The agent addressed most customer concerns but could improve on explaining policy details more
                        clearly.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-black/50 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {callAnalysis.compliance_check.identity_verification ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <h4 className="font-medium">Identity Verification</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Agent properly verified customer identity with name and date of birth.
                      </p>
                    </div>

                    <div className="bg-black/50 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {callAnalysis.compliance_check.disclosure_statements ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <h4 className="font-medium">Disclosure Statements</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Agent failed to provide required disclosure statements about fees and policy changes.
                      </p>
                    </div>

                    <div className="bg-black/50 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {callAnalysis.compliance_check.call_recording_notice ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <h4 className="font-medium">Call Recording Notice</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Agent properly informed customer that call was being recorded.
                      </p>
                    </div>

                    <div className="bg-black/50 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {callAnalysis.compliance_check.data_protection ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <h4 className="font-medium">Data Protection</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Agent followed data protection protocols when handling customer information.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Compliance Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      The call was mostly compliant with company policies and regulatory requirements, but the agent
                      failed to provide required disclosure statements about fees and policy changes. Training
                      recommended on proper disclosure procedures.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Call Details Sidebar */}
        <div className="space-y-6">
          <Card className="border-gold/30 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">Call Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">{formatDuration(callRecording.duration_seconds)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{formatDate(callRecording.uploaded_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Agent</p>
                  <p className="font-medium">{callRecording.agent.name}</p>
                  <p className="text-xs text-muted-foreground">{callRecording.agent.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer Phone</p>
                  <p className="font-medium">{callRecording.customer_phone}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Status</p>
                <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                  {callRecording.status === "completed" ? "Completed" : "In Progress"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold/30 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-gold hover:bg-gold/90 text-black"
                onClick={() => {
                  // Generate and download PDF or report here
                  alert("This feature would generate a PDF report of the call analysis")
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gold/30 text-white hover:bg-gold/10 hover:text-gold"
                onClick={() => {
                  // Schedule training action here
                  alert("This would open a training scheduling interface")
                }}
              >
                Schedule Training
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gold/30 text-white hover:bg-gold/10 hover:text-gold"
                onClick={() => {
                  // Share analysis action here
                  alert("This would open a sharing interface")
                }}
              >
                Share Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
