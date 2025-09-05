"use client"

import { useState } from "react"
import {
  FileText,
  Plus,
  Search,
  Calendar,
  User,
  AlertTriangle,
  Eye,
  Edit,
  MessageSquare,
  Paperclip,
  Share,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Case {
  id: string
  title: string
  description: string
  status: "open" | "in_progress" | "closed" | "escalated"
  priority: "low" | "medium" | "high" | "critical"
  assignee: string
  reporter: string
  createdAt: string
  updatedAt: string
  subscriberMsisdn: string
  riskScore: number
  tags: string[]
  evidence: Evidence[]
  comments: Comment[]
}

interface Evidence {
  id: string
  type: "screenshot" | "document" | "log" | "analysis"
  name: string
  description: string
  uploadedAt: string
  uploadedBy: string
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  type: "comment" | "status_change" | "assignment"
}

export function CaseManagement() {
  const [cases, setCases] = useState<Case[]>([
    {
      id: "CASE-001",
      title: "Suspicious International Call Pattern",
      description: "Subscriber +1234567890 showing unusual international calling behavior to high-risk countries",
      status: "open",
      priority: "high",
      assignee: "John Doe",
      reporter: "AI System",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T14:45:00Z",
      subscriberMsisdn: "+1234567890",
      riskScore: 85,
      tags: ["international", "high-risk", "ai-detected"],
      evidence: [
        {
          id: "E001",
          type: "analysis",
          name: "AI Risk Analysis Report",
          description: "Detailed AI analysis showing fraud patterns",
          uploadedAt: "2024-01-15T10:30:00Z",
          uploadedBy: "AI System",
        },
      ],
      comments: [
        {
          id: "C001",
          author: "John Doe",
          content: "Reviewing the international call patterns. Need to verify with compliance team.",
          timestamp: "2024-01-15T14:45:00Z",
          type: "comment",
        },
      ],
    },
    {
      id: "CASE-002",
      title: "Bulk SMS Activity Detected",
      description: "Multiple subscribers from same dealer showing coordinated SMS activity",
      status: "in_progress",
      priority: "medium",
      assignee: "Jane Smith",
      reporter: "Fraud Analyst",
      createdAt: "2024-01-14T09:15:00Z",
      updatedAt: "2024-01-15T11:20:00Z",
      subscriberMsisdn: "+1234567891",
      riskScore: 72,
      tags: ["bulk-sms", "dealer-fraud", "coordinated"],
      evidence: [],
      comments: [],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showNewCaseDialog, setShowNewCaseDialog] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "default"
      case "in_progress":
        return "secondary"
      case "closed":
        return "outline"
      case "escalated":
        return "destructive"
      default:
        return "default"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "default"
    }
  }

  const filteredCases = cases.filter((case_) => {
    const matchesSearch =
      case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.subscriberMsisdn.includes(searchTerm) ||
      case_.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || case_.status === statusFilter
    const matchesPriority = priorityFilter === "all" || case_.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const createNewCase = () => {
    // In a real app, this would create a new case
    toast({
      title: "Case Created",
      description: "New fraud investigation case has been created successfully",
    })
    setShowNewCaseDialog(false)
  }

  const updateCaseStatus = (caseId: string, newStatus: string) => {
    setCases(
      cases.map((case_) =>
        case_.id === caseId ? { ...case_, status: newStatus as any, updatedAt: new Date().toISOString() } : case_
      )
    )
    toast({
      title: "Case Updated",
      description: `Case ${caseId} status updated to ${newStatus}`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Case Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage fraud investigation cases and evidence</p>
        </div>

        <Dialog open={showNewCaseDialog} onOpenChange={setShowNewCaseDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Investigation Case</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Case Title</Label>
                  <Input placeholder="Enter case title..." />
                </div>
                <div className="space-y-2">
                  <Label>Subscriber MSISDN</Label>
                  <Input placeholder="+1234567890" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the suspected fraud activity..." rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Doe</SelectItem>
                      <SelectItem value="jane">Jane Smith</SelectItem>
                      <SelectItem value="mike">Mike Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowNewCaseDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createNewCase}>Create Case</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCases.map((case_) => (
          <Card key={case_.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{case_.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{case_.id}</span>
                    <span>•</span>
                    <span>{case_.subscriberMsisdn}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant={getStatusColor(case_.status)} className="text-xs">
                    {case_.status.replace("_", " ")}
                  </Badge>
                  <Badge variant={getPriorityColor(case_.priority)} className="text-xs">
                    {case_.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{case_.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{case_.assignee}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(case_.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Risk: {case_.riskScore}%</span>
                </div>

                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setSelectedCase(case_)}>
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Share className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {case_.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {case_.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{case_.tags.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Case Detail Dialog */}
      {selectedCase && (
        <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl">{selectedCase.title}</DialogTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusColor(selectedCase.status)}>{selectedCase.status.replace("_", " ")}</Badge>
                    <Badge variant={getPriorityColor(selectedCase.priority)}>{selectedCase.priority}</Badge>
                    <span className="text-sm text-gray-500">{selectedCase.id}</span>
                  </div>
                </div>
                <Select value={selectedCase.status} onValueChange={(value) => updateCaseStatus(selectedCase.id, value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DialogHeader>

            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="evidence">Evidence ({selectedCase.evidence.length})</TabsTrigger>
                <TabsTrigger value="comments">Comments ({selectedCase.comments.length})</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Subscriber</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCase.subscriberMsisdn}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Risk Score</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCase.riskScore}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Assignee</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCase.assignee}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Reporter</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCase.reporter}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedCase.description}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCase.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Evidence & Attachments</h4>
                  <Button size="sm">
                    <Paperclip className="h-3 w-3 mr-1" />
                    Add Evidence
                  </Button>
                </div>

                {selectedCase.evidence.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No evidence uploaded yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCase.evidence.map((evidence) => (
                      <div key={evidence.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{evidence.name}</p>
                            <p className="text-xs text-gray-500">{evidence.description}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(evidence.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Comments & Updates</h4>
                  <Button size="sm">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Add Comment
                  </Button>
                </div>

                {selectedCase.comments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No comments yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedCase.comments.map((comment) => (
                      <div key={comment.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{comment.author}</span>
                          <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <h4 className="font-medium">Case Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Case Created</p>
                      <p className="text-xs text-gray-500">{new Date(selectedCase.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Status Updated</p>
                      <p className="text-xs text-gray-500">{new Date(selectedCase.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
