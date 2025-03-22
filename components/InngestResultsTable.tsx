"use client"

import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Id } from "@/convex/_generated/dataModel"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DetailDialog } from "@/components/ui/dialog-detail"
import { Info, Wifi, WifiOff, AlertCircle } from "lucide-react"
import { useInngestRealtime } from "@/hooks/useInngestRealtime"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Type for the Inngest result data
type InngestResult = {
  _id: Id<"inngestResults">
  _creationTime: number
  eventId: string
  correlationId?: string
  function: string
  result: Record<string, unknown>
  timestamp: number
}

export default function InngestResultsTable() {
  // State for the detail dialog
  const [selectedResult, setSelectedResult] = useState<InngestResult | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Track the current active correlation ID for realtime updates
  const [activeCorrelationId, setActiveCorrelationId] = useState<string | null>(null)
  
  // Use our realtime hook for live updates
  const { results, isConnected, error } = useInngestRealtime(activeCorrelationId, 100)

  // Function to handle row click
  const handleRowClick = (result: InngestResult) => {
    setSelectedResult(result)
    setIsDialogOpen(true)
  }

  // Define columns for the data table
  const columns: ColumnDef<InngestResult>[] = [
    {
      accessorKey: "function",
      header: () => <div className="font-semibold">Function</div>,
      cell: ({ row }) => <div className="font-medium">{row.original.function}</div>,
    },
    {
      accessorKey: "timestamp",
      header: () => <div className="font-semibold">Time</div>,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.timestamp), { addSuffix: true })}
        </div>
      ),
    },
    {
      accessorKey: "eventId",
      header: () => <div className="font-semibold">Event ID</div>,
      cell: ({ row }) => (
        <div className="font-mono text-xs text-muted-foreground truncate max-w-40" title={row.original.eventId}>
          {row.original.eventId}
        </div>
      ),
    },
    {
      accessorKey: "correlationId",
      header: () => <div className="font-semibold">Correlation ID</div>,
      cell: ({ row }) => (
        row.original.correlationId ? (
          <div className="flex items-center gap-2">
            <div className="font-mono text-xs text-muted-foreground truncate max-w-40" title={row.original.correlationId}>
              {row.original.correlationId}
            </div>
            {activeCorrelationId === row.original.correlationId ? (
              <Badge variant="outline" className="px-1 py-0 h-4 text-[10px] cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                setActiveCorrelationId(null);
              }}>
                Live
              </Badge>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (row.original.correlationId) {
                    setActiveCorrelationId(row.original.correlationId);
                  }
                }}
              >
                <Wifi size={12} className="text-muted-foreground" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground/50 text-xs">-</div>
        )
      ),
    },
    {
      accessorKey: "result",
      header: () => <div className="font-semibold">Result</div>,
      cell: ({ row }) => {
        const result = row.original.result
        const messageText = typeof result === 'object' && result !== null && 'message' in result
          ? String(result.message)
          : JSON.stringify(result).substring(0, 30) + "..."
        return (
          <div className="max-w-40 truncate" title={JSON.stringify(result)}>
            {messageText}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">Function Results</CardTitle>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="outline" className="flex items-center gap-1 py-1 bg-emerald-100/10 text-emerald-500 dark:text-emerald-400 border-emerald-200/20">
                  <Wifi size={12} />
                  <span>Realtime Connected</span>
                </Badge>
              ) : activeCorrelationId ? (
                <Badge variant="outline" className="flex items-center gap-1 py-1 bg-amber-100/10 text-amber-500 dark:text-amber-400 border-amber-200/20">
                  <WifiOff size={12} />
                  <span>Connection Error</span>
                </Badge>
              ) : null}
            </div>
          </div>
          <CardDescription className="flex items-center gap-1 text-sm text-muted-foreground">
            <Info size={14} className="inline-block" />
            <span>Click on any row to view details, or click the wifi icon to enable live updates</span>
          </CardDescription>
          
          {/* Show error alert if there's a connection error */}
          {error && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={results} 
            defaultSorting={[{ id: "timestamp", desc: true }]}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <DetailDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        data={selectedResult}
      />
    </>
  )
} 