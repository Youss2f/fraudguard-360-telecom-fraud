"use client"

import { useState } from "react"
import { Search, X, Plus, Save, History, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface SearchCriteria {
  id: string
  field: string
  operator: string
  value: string
  type: "text" | "number" | "date" | "boolean"
}

interface SavedSearch {
  id: string
  name: string
  criteria: SearchCriteria[]
  timestamp: string
}

interface AdvancedSearchProps {
  onSearch: (criteria: SearchCriteria[]) => void
  onClose: () => void
}

export function AdvancedSearch({ onSearch, onClose }: AdvancedSearchProps) {
  const [criteria, setCriteria] = useState<SearchCriteria[]>([
    { id: "1", field: "msisdn", operator: "equals", value: "", type: "text" },
  ])
  const [savedSearches] = useState<SavedSearch[]>([
    {
      id: "1",
      name: "High Risk International Callers",
      criteria: [
        { id: "1", field: "international_calls", operator: "greater_than", value: "10", type: "number" },
        { id: "2", field: "risk_score", operator: "greater_than", value: "60", type: "number" },
      ],
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Bulk SMS Senders",
      criteria: [
        { id: "1", field: "sms_sent", operator: "greater_than", value: "1000", type: "number" },
        { id: "2", field: "bulk_sms_detected", operator: "equals", value: "true", type: "boolean" },
      ],
      timestamp: "2024-01-14T15:45:00Z",
    },
  ])
  const { toast } = useToast()

  const fieldOptions = [
    { value: "msisdn", label: "MSISDN", type: "text" },
    { value: "imsi", label: "IMSI", type: "text" },
    { value: "imei", label: "IMEI", type: "text" },
    { value: "risk_score", label: "Risk Score", type: "number" },
    { value: "international_calls", label: "International Calls", type: "number" },
    { value: "sms_sent", label: "SMS Sent", type: "number" },
    { value: "data_usage", label: "Data Usage (GB)", type: "number" },
    { value: "activation_date", label: "Activation Date", type: "date" },
    { value: "last_activity", label: "Last Activity", type: "date" },
    { value: "bulk_sms_detected", label: "Bulk SMS Detected", type: "boolean" },
    { value: "roaming_status", label: "Roaming Status", type: "boolean" },
  ]

  const operatorOptions = {
    text: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
      { value: "starts_with", label: "Starts with" },
      { value: "ends_with", label: "Ends with" },
    ],
    number: [
      { value: "equals", label: "Equals" },
      { value: "greater_than", label: "Greater than" },
      { value: "less_than", label: "Less than" },
      { value: "between", label: "Between" },
    ],
    date: [
      { value: "equals", label: "On date" },
      { value: "after", label: "After" },
      { value: "before", label: "Before" },
      { value: "between", label: "Between" },
    ],
    boolean: [{ value: "equals", label: "Is" }],
  }

  const addCriteria = () => {
    const newCriteria: SearchCriteria = {
      id: Date.now().toString(),
      field: "msisdn",
      operator: "equals",
      value: "",
      type: "text",
    }
    setCriteria([...criteria, newCriteria])
  }

  const removeCriteria = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id))
  }

  const updateCriteria = (id: string, updates: Partial<SearchCriteria>) => {
    setCriteria(criteria.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const handleFieldChange = (id: string, field: string) => {
    const fieldOption = fieldOptions.find((f) => f.value === field)
    if (fieldOption) {
      updateCriteria(id, {
        field,
        type: fieldOption.type as any,
        operator: operatorOptions[fieldOption.type as keyof typeof operatorOptions][0].value,
        value: "",
      })
    }
  }

  const handleSearch = () => {
    const validCriteria = criteria.filter((c) => c.value.trim() !== "")
    if (validCriteria.length === 0) {
      toast({
        title: "Search Error",
        description: "Please add at least one search criteria",
        variant: "destructive",
      })
      return
    }
    onSearch(validCriteria)
  }

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setCriteria(savedSearch.criteria)
    toast({
      title: "Search Loaded",
      description: `Loaded "${savedSearch.name}" search criteria`,
    })
  }

  const saveCurrentSearch = () => {
    // In a real app, this would save to backend
    toast({
      title: "Search Saved",
      description: "Your search criteria has been saved successfully",
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search Builder
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Saved Searches */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gray-500" />
            <Label className="text-sm font-medium">Saved Searches</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((search) => (
              <Button
                key={search.id}
                variant="outline"
                size="sm"
                onClick={() => loadSavedSearch(search)}
                className="text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                {search.name}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Search Criteria */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Search Criteria</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={saveCurrentSearch}>
                <Save className="h-3 w-3 mr-1" />
                Save Search
              </Button>
              <Button variant="outline" size="sm" onClick={addCriteria}>
                <Plus className="h-3 w-3 mr-1" />
                Add Criteria
              </Button>
            </div>
          </div>

          {criteria.map((criterion, index) => (
            <div key={criterion.id} className="space-y-3">
              {index > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    AND
                  </Badge>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Field</Label>
                  <Select value={criterion.field} onValueChange={(value) => handleFieldChange(criterion.id, value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Operator</Label>
                  <Select
                    value={criterion.operator}
                    onValueChange={(value) => updateCriteria(criterion.id, { operator: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorOptions[criterion.type].map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Value</Label>
                  {criterion.type === "boolean" ? (
                    <Select value={criterion.value} onValueChange={(value) => updateCriteria(criterion.id, { value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={criterion.value}
                      onChange={(e) => updateCriteria(criterion.id, { value: e.target.value })}
                      placeholder={`Enter ${criterion.type} value...`}
                      type={criterion.type === "number" ? "number" : "text"}
                    />
                  )}
                </div>

                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCriteria(criterion.id)}
                    disabled={criteria.length === 1}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-500 to-cyan-500">
            <Search className="h-4 w-4 mr-2" />
            Execute Search
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
