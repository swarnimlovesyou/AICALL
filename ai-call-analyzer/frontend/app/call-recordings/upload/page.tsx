"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, FileAudio, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { getApi, api, mockApi } from "@/lib/api"

// Agent type definition
interface Agent {
  id: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
  department: string;
}

export default function UploadCallPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const apiClient = getApi()
  const useMockApi = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL

  const [title, setTitle] = useState("")
  const [agentId, setAgentId] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)

  // Fetch agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true)
        let agentsData;
        
        if (useMockApi) {
          agentsData = await mockApi.getAgents();
        } else {
          agentsData = await api.get<Agent[]>("/api/agents/");
        }
        
        setAgents(agentsData)
      } catch (error) {
        console.error("Error fetching agents:", error)
        toast({
          title: "Error loading agents",
          description: "Could not load the agent list. Please refresh and try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingAgents(false)
      }
    }

    fetchAgents()
  }, [toast, useMockApi])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type.includes("audio")) {
        setFile(droppedFile)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file.",
          variant: "destructive",
        })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an audio file to upload.",
        variant: "destructive",
      })
      return
    }

    if (!title || !agentId || !customerPhone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 200)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append("title", title)
      formData.append("agent", agentId)
      formData.append("customer_phone", customerPhone)
      formData.append("file", file)

      // Use our API utility to upload the file
      if (useMockApi) {
        await mockApi.uploadCallRecording(formData);
      } else {
        await api.upload("/api/call-recordings/", formData);
      }

      setUploadProgress(100)

      toast({
        title: "Upload successful",
        description: "Your call recording has been uploaded and is being processed.",
      })

      // Redirect to call recordings page after a short delay
      setTimeout(() => {
        router.push("/call-recordings")
      }, 1500)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/call-recordings" className="mr-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-serif font-bold">Upload Call Recording</h2>
      </div>

      <Card className="border-gold/30 bg-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Call Details</CardTitle>
            <CardDescription>Upload a new call recording for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Call Title</Label>
              <Input
                id="title"
                placeholder="E.g., Customer Complaint - Billing Issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-gold/30 bg-black/50 focus:border-gold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent">Agent</Label>
              <Select value={agentId} onValueChange={setAgentId} disabled={loadingAgents}>
                <SelectTrigger id="agent" className="border-gold/30 bg-black/50 focus:border-gold">
                  <SelectValue placeholder={loadingAgents ? "Loading agents..." : "Select an agent"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingAgents ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading agents...</span>
                    </div>
                  ) : (
                    agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.user.first_name} {agent.user.last_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">Customer Phone</Label>
              <Input
                id="customer-phone"
                placeholder="E.g., 555-123-4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="border-gold/30 bg-black/50 focus:border-gold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Call Recording File</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDragging ? "border-gold bg-gold/5" : "border-gold/30"
                } transition-colors`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex items-center justify-between bg-gold/10 rounded-md p-3">
                    <div className="flex items-center">
                      <FileAudio className="h-8 w-8 text-gold mr-3" />
                      <div className="text-left">
                        <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="h-8 w-8 text-muted-foreground hover:text-gold"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Drag and drop your audio file here, or{" "}
                        <label className="text-gold hover:underline cursor-pointer">
                          browse
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Supports MP3, WAV, M4A (max 50MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gold/10 rounded-full h-2">
                  <div
                    className="bg-gold h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              className="border-gold/30 text-white hover:bg-gold/10 hover:text-gold"
              onClick={() => router.push("/call-recordings")}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-gold hover:bg-gold/90 text-black" disabled={isUploading || !file}>
              {isUploading ? "Uploading..." : "Upload Call"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
