import { toast } from "@/components/ui/use-toast"

// Get the API URL from environment variables with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Types
type RequestOptions = {
  method?: string
  headers?: Record<string, string>
  body?: any
  requiresAuth?: boolean
  isFormData?: boolean
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

// Main API request function
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", headers = {}, body, requiresAuth = true, isFormData = false } = options

  // Prepare URL
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`

  // Prepare headers
  const requestHeaders: Record<string, string> = { ...headers }

  // Add content type header if not form data
  if (!isFormData) {
    requestHeaders["Content-Type"] = "application/json"
  }

  // Add auth token if required
  if (requiresAuth) {
    const token = getAuthToken()
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`
    } else {
      // Redirect to login if no token is found
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      throw new Error("Authentication required")
    }
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: "include",
  }

  // Add body if provided
  if (body) {
    requestOptions.body = isFormData ? body : JSON.stringify(body)
  }

  try {
    const response = await fetch(url, requestOptions)

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.detail || `Request failed with status: ${response.status}`

      // Show toast notification for errors
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      throw new Error(errorMessage)
    }

    // Parse JSON response
    const data = await response.json()
    return data as T
  } catch (error) {
    console.error("API request error:", error)

    // Show toast notification for network errors
    if (error instanceof Error && error.message !== "Authentication required") {
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please check your connection.",
        variant: "destructive",
      })
    }

    throw error
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method'>) => 
    apiRequest<T>(endpoint, { ...options, method: 'POST', body: data }),
    
  put: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method'>) => 
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body: data }),
    
  patch: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method'>) => 
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: data }),
    
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) => 
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
    
  // Special method for form data uploads
  upload: <T>(endpoint: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'body' | 'isFormData'>) => 
    apiRequest<T>(endpoint, { ...options, method: 'POST', body: formData, isFormData: true }),
};

// Mock API for development
export const mockApi = {
  // Mock login
  login: async (username: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (username === 'demo' && password === 'password') {
      return {
        token: 'mock-jwt-token-for-development',
        user: {
          id: 1,
          username: 'demo',
          first_name: 'John',
          last_name: 'Smith'
        }
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  // Add more mock API methods as needed
  getAgents: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 1,
        user: {
          username: "john_agent",
          first_name: "John",
          last_name: "Smith"
        },
        employee_id: "EMP12345",
        department: "Claims",
        hire_date: "2023-01-15",
        avg_coverage_score: 8.5,
        total_calls_handled: 120
      },
      // More agents...
    ];
  },
  
  // Mock call recordings
  getCallRecordings: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 1,
        title: "Customer Complaint - Billing Issue",
        agent: "John Smith",
        customer_phone: "555-123-4567",
        duration_seconds: 345,
        uploaded_at: "2025-03-24T10:30:00Z",
        status: "completed",
        sentiment: "negative"
      },
      // More recordings...
    ];
  },
  
  // Mock upload call recording
  uploadCallRecording: async (formData: FormData) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const title = formData.get('title') as string;
    return {
      id: 999,
      title: title,
      status: "processing"
    };
  }
};

// Helper to determine which API to use
export const getApi = () => {
  const useMockApi = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;
  return useMockApi ? mockApi : api;
};
