"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { summarizeDocument, type SummarizeDocumentOutput } from '@/ai/flows/summarize-document';
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Tags, ListChecks, Users, AlertCircle } from 'lucide-react';

type ParsedSummarizeDocumentOutput = {
  summary: string;
  keywords: string[];
  importantPoints: string[];
  characters?: string[];
};

export default function InsightfulReaderPage() {
  const [documentText, setDocumentText] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<ParsedSummarizeDocumentOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Client-side hydration guard
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result: SummarizeDocumentOutput = await summarizeDocument({ documentText });
      
      const parsedResult: ParsedSummarizeDocumentOutput = {
        summary: result.summary,
        keywords: result.keywords ? result.keywords.split(/,|\n/).map(k => k.trim()).filter(k => k) : [],
        importantPoints: result.importantPoints ? result.importantPoints.split('\n').map(p => p.trim()).filter(p => p) : [],
        characters: result.characters ? result.characters.split('\n').map(c => c.trim()).filter(c => c) : undefined,
      };
      setAnalysisResult(parsedResult);
    } catch (e) {
      console.error("Analysis error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null; // Or a loading spinner, but null is fine to avoid hydration mismatch warning for now
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 selection:bg-accent selection:text-accent-foreground">
      <header className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Insightful Reader</h1>
        <p className="text-lg text-muted-foreground">
          Unlock insights from your documents. Get summaries, keywords, important points, and character analyses powered by AI.
        </p>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Enter Your Document Text</CardTitle>
            <CardDescription>Paste the text you want to analyze below. The more text you provide, the better the insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your document text here..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              rows={10}
              className="text-base"
              aria-label="Document text input"
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={isLoading} 
              className="w-full md:w-auto text-lg py-3 px-6"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                </>
              ) : (
                "Analyze Document"
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive bg-destructive/10 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                Analysis Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive-foreground">{error}</p>
            </CardContent>
          </Card>
        )}

        {analysisResult && !isLoading && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <FileText className="mr-3 h-6 w-6 text-primary" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed">{analysisResult.summary || "No summary available."}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Tags className="mr-3 h-6 w-6 text-primary" /> Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResult.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1">{keyword}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No keywords extracted.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <ListChecks className="mr-3 h-6 w-6 text-primary" /> Important Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResult.importantPoints.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-base">
                      {analysisResult.importantPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No important points extracted.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {analysisResult.characters && analysisResult.characters.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Users className="mr-3 h-6 w-6 text-primary" /> Characters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-base">
                    {analysisResult.characters.map((character, index) => (
                      <li key={index} className="p-2 border-b last:border-b-0">{character}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
      <footer className="w-full max-w-5xl mt-12 pt-8 border-t text-center">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Insightful Reader. All rights reserved.</p>
      </footer>
    </div>
  );
}
