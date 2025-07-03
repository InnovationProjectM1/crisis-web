"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { apiService } from "@/lib/api";

interface TestResult {
  name: string;
  status: "success" | "error" | "loading";
  data?: string;
  error?: string;
}

export function ApiTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults: TestResult[] = [];

    // Test getTweets
    try {
      const tweets = await apiService.getTweets();
      testResults.push({
        name: "Get Tweets",
        status: "success",
        data: `${tweets.length} tweets loaded`,
      });
    } catch (error) {
      testResults.push({
        name: "Get Tweets",
        status: "error",
        error: (error as Error).message,
      });
    }

    // Test getTweetStatistics
    try {
      const stats = await apiService.getTweetStatistics();
      testResults.push({
        name: "Get Tweet Statistics",
        status: "success",
        data: `Total: ${stats.total}, Classified: ${stats.classified}, Unclassified: ${stats.unclassified}`,
      });
    } catch (error) {
      testResults.push({
        name: "Get Tweet Statistics",
        status: "error",
        error: (error as Error).message,
      });
    }

    // Test getGroupStatistics
    try {
      const groupStats = await apiService.getGroupStatistics();
      testResults.push({
        name: "Get Group Statistics",
        status: "success",
        data: `${groupStats.length} groups found`,
      });
    } catch (error) {
      testResults.push({
        name: "Get Group Statistics",
        status: "error",
        error: (error as Error).message,
      });
    }

    // Test getSeverityStatistics
    try {
      const severityStats = await apiService.getSeverityStatistics();
      testResults.push({
        name: "Get severity Statistics",
        status: "success",
        data: `${severityStats.length} severity levels found`,
      });
    } catch (error) {
      testResults.push({
        name: "Get Severity Statistics",
        status: "error",
        error: (error as Error).message,
      });
    }

    // Test getTrendData
    try {
      const trendData = await apiService.getTrendData("24h");
      testResults.push({
        name: "Get Trend Data (24h)",
        status: "success",
        data: `${trendData.length} data points generated`,
      });
    } catch (error) {
      testResults.push({
        name: "Get Trend Data (24h)",
        status: "error",
        error: (error as Error).message,
      });
    }

    // Test getRegionData
    try {
      const regionData = await apiService.getRegionData();
      testResults.push({
        name: "Get Region Data",
        status: "success",
        data: `${regionData.length} regions found`,
      });
    } catch (error) {
      testResults.push({
        name: "Get Region Data",
        status: "error",
        error: (error as Error).message,
      });
    }

    // Test getHeatmapData
    try {
      const heatmapData = await apiService.getHeatmapData();
      testResults.push({
        name: "Get Heatmap Data",
        status: "success",
        data: `${heatmapData.regions.length} heatmap regions found`,
      });
    } catch (error) {
      testResults.push({
        name: "Get Heatmap Data",
        status: "error",
        error: (error as Error).message,
      });
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "loading":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "loading":
        return <Badge variant="outline">Loading</Badge>;
      default:
        return null;
    }
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            API Test Dashboard
          </h1>
          <p className="text-muted-foreground">
            Test all API endpoints to ensure proper functionality
          </p>
        </div>
        <Button onClick={runTests} disabled={loading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Testing..." : "Run Tests"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {successCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {errorCount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <CardTitle className="text-base">{result.name}</CardTitle>
                </div>
                {getStatusBadge(result.status)}
              </div>
            </CardHeader>
            <CardContent>
              {result.status === "success" && result.data && (
                <p className="text-sm text-muted-foreground">{result.data}</p>
              )}
              {result.status === "error" && result.error && (
                <p className="text-sm text-red-500">{result.error}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">
              Click &#34;Run Tests&#34; to start testing the API
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
