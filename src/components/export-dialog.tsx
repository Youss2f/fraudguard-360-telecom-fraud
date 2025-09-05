"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react"
import { SubscriberData } from "@/types/subscriber"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriberData: SubscriberData
  searchQuery: string
}

export function ExportDialog({ open, onOpenChange, subscriberData, searchQuery }: ExportDialogProps) {
  const [selectedSections, setSelectedSections] = useState({
    overview: true,
    overallActivity: true,
    localCallActivity: true,
    smsActivity: true,
    internationalCallActivity: true,
    dataUsage: true,
    dealerAssociation: true,
    rechargePayment: true,
  })
  const [isExporting, setIsExporting] = useState(false)

  const sections = [
    { key: "overview", label: "Subscriber Overview" },
    { key: "overallActivity", label: "Overall Activity" },
    { key: "localCallActivity", label: "Local Call Activity" },
    { key: "smsActivity", label: "SMS Activity" },
    { key: "internationalCallActivity", label: "International Calls" },
    { key: "dataUsage", label: "Data Usage" },
    { key: "dealerAssociation", label: "Dealer Association" },
    { key: "rechargePayment", label: "Recharge & Payment" },
  ]

  const handleSectionToggle = (sectionKey: string) => {
    setSelectedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey as keyof typeof prev],
    }))
  }

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedSections).every(Boolean)
    const newState = sections.reduce(
      (acc, section) => ({
        ...acc,
        [section.key]: !allSelected,
      }),
      {} as typeof selectedSections
    )
    setSelectedSections(newState)
  }

  const exportToCsv = async () => {
    setIsExporting(true)

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create CSV content
    let csvContent = `Subscriber 360° Profile Report - ${searchQuery}\n`
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`

    if (selectedSections.overview) {
      csvContent += `SUBSCRIBER OVERVIEW\n`
      csvContent += `MSISDN,${subscriberData.overview.msisdn}\n`
      csvContent += `IMSI,${subscriberData.overview.imsi}\n`
      csvContent += `Current IMEI,${subscriberData.overview.currentImei}\n`
      csvContent += `Status,${subscriberData.overview.status}\n`
      csvContent += `Activation Date,${subscriberData.overview.activationDate}\n\n`
    }

    if (selectedSections.localCallActivity) {
      csvContent += `LOCAL CALL ACTIVITY\n`
      csvContent += `Timestamp,Type,Number,Duration,Cell Site,IMEI\n`
      subscriberData.localCallActivity.callLogs.forEach((call) => {
        csvContent += `${call.timestamp},${call.type},${call.number},${call.duration},${call.cellSite},${call.imei}\n`
      })
      csvContent += `\n`
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `subscriber-profile-${searchQuery}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    setIsExporting(false)
    onOpenChange(false)
  }

  const exportToPdf = async () => {
    setIsExporting(true)

    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // In a real implementation, you would use a library like jsPDF or html2pdf
    alert("PDF export functionality would be implemented here using libraries like jsPDF or html2pdf")

    setIsExporting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Subscriber Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Select Sections to Export</Label>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {Object.values(selectedSections).every(Boolean) ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sections.map((section) => (
                <div key={section.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.key}
                    checked={selectedSections[section.key as keyof typeof selectedSections]}
                    onCheckedChange={() => handleSectionToggle(section.key)}
                  />
                  <Label htmlFor={section.key} className="text-sm font-normal cursor-pointer">
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Export Format</Label>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={exportToCsv}
                disabled={isExporting || !Object.values(selectedSections).some(Boolean)}
                className="flex items-center gap-2"
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                Export CSV
              </Button>

              <Button
                variant="outline"
                onClick={exportToPdf}
                disabled={isExporting || !Object.values(selectedSections).some(Boolean)}
                className="flex items-center gap-2"
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Export PDF
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>• CSV format includes raw data for analysis</p>
            <p>• PDF format includes formatted report with charts</p>
            <p>• Exports include only selected sections</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
