"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { PinWheel } from "./loaders/pinwheel";

/**
 * Component to test lead detection HTTP endpoints
 */
export default function LeadDetectionTester() {
  const [chatId, setChatId] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Trigger analysis for a specific chat
   */
  const analyzeChatById = async () => {
    if (!chatId) {
      setError("Please enter a chat ID");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch("/api/convex/analyze-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze chat");
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Export all qualified leads
   */
  const exportLeads = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const url = new URL("/api/convex/export-leads", window.location.origin);
      if (apiKey) {
        url.searchParams.append("apiKey", apiKey);
      }
      
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to export leads");
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Lead Detection Tester</CardTitle>
        <CardDescription>
          Test the Convex HTTP endpoints for lead detection and export
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="analyze">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">Analyze Chat</TabsTrigger>
            <TabsTrigger value="export">Export Leads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analyze" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chatId">Chat ID</Label>
              <Input
                id="chatId"
                placeholder="Enter Convex chat ID"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the Convex ID of the chat to analyze for lead potential
              </p>
            </div>
            
            <Button 
              onClick={analyzeChatById} 
              disabled={loading || !chatId}
              className="w-full"
            >
              {loading ? <PinWheel className="mr-2" /> : null}
              Analyze Chat
            </Button>
          </TabsContent>
          
          <TabsContent value="export" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (Optional)</Label>
              <Input
                id="apiKey"
                placeholder="Enter API key if required"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If the export endpoint requires an API key, enter it here
              </p>
            </div>
            
            <Button 
              onClick={exportLeads} 
              disabled={loading}
              className="w-full"
            >
              {loading ? <PinWheel className="mr-2" /> : null}
              Export Qualified Leads
            </Button>
          </TabsContent>
        </Tabs>
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
            {error}
          </div>
        )}
        
        {result && (
          <div className="mt-4 space-y-2">
            <Label>Result</Label>
            <Textarea
              readOnly
              value={JSON.stringify(result, null, 2)}
              className="font-mono h-64"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        Note: This component requires proper Convex and Inngest setup to work correctly.
      </CardFooter>
    </Card>
  );
} 