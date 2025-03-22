"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { Id } from "@/convex/_generated/dataModel"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface InngestDetail {
  _id: Id<"inngestResults">
  _creationTime: number
  eventId: string
  correlationId?: string
  function: string
  result: Record<string, unknown>
  timestamp: number
}

interface DetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: InngestDetail | null
}

export function DetailDialog({ open, onOpenChange, data }: DetailDialogProps) {
  if (!data) return null

  const formattedTimestamp = new Date(data.timestamp).toLocaleString()
  const timeAgo = formatDistanceToNow(new Date(data.timestamp), { addSuffix: true })

  // Extract message for display if it exists
  const resultMessage = typeof data.result === 'object' && 
    data.result !== null && 
    'message' in data.result ? 
    String(data.result.message) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span>Inngest Function Details</span>
            <Badge variant="outline" className="ml-2">{data.function}</Badge>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span>{timeAgo}</span>
            {resultMessage && (
              <>
                <span>•</span>
                <span className="font-medium text-foreground">{resultMessage}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2" />

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Event ID</h3>
            <div className="font-mono text-xs break-all bg-muted p-2 rounded">{data.eventId}</div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Correlation ID</h3>
            {data.correlationId ? (
              <div className="font-mono text-xs break-all bg-muted p-2 rounded">{data.correlationId}</div>
            ) : (
              <div className="text-muted-foreground/50 italic">None</div>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Database ID</h3>
            <div className="font-mono text-xs break-all bg-muted p-2 rounded">{data._id}</div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Timestamp</h3>
            <div className="text-sm">{formattedTimestamp}</div>
          </div>
          <div className="space-y-2 col-span-2">
            <h3 className="font-medium text-sm text-muted-foreground">Result</h3>
            <pre className="text-xs font-mono bg-muted p-3 rounded overflow-auto max-h-80">
              {JSON.stringify(data.result, null, 2)}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 