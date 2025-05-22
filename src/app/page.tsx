
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { summarizeDocument, type SummarizeDocumentOutput } from '@/ai/flows/summarize-document'; // Updated type
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Tags, ListChecks, Users, AlertCircle, UploadCloud } from 'lucide-react';

// No longer need ParsedSummarizeDocumentOutput, as SummarizeDocumentOutput is already structured.

export default function InsightfulReaderPage() {
  const [documentText, setDocumentText] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SummarizeDocumentOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check for plain text based file types
      if (file.type === 'text/plain' || file.type === 'text/markdown' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setDocumentText(text);
          toast({
            title: "File Loaded",
            description: `${file.name} has been loaded successfully.`,
          });
        };
        reader.onerror = () => {
          setError("Failed to read the file.");
          toast({
            title: "File Read Error",
            description: "Could not read the selected file.",
            variant: "destructive",
          });
        };
        reader.readAsText(file);
      } else {
        setFileName(null);
        setDocumentText("");
        event.target.value = ""; // Reset file input
        toast({
          title: "Invalid File Type",
          description: "Please upload a plain text file (e.g., .txt, .md). PDF and DOCX are not currently supported.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text or upload a file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // The result is now directly the structured SummarizeDocumentOutput
      const result: SummarizeDocumentOutput = await summarizeDocument({ documentText });
      setAnalysisResult(result);
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 selection:bg-accent selection:text-accent-foreground">
      <header className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Insightful Reader</h1>
        <p className="text-lg text-muted-foreground">
          Unlock insights from your documents. Paste text or upload a file to get summaries, keywords, important points, and character analyses powered by AI.
        </p>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Provide Your Document</CardTitle>
            <CardDescription>Choose to paste text directly or upload a text file (.txt, .md).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={inputType} onValueChange={(value) => setInputType(value as "text" | "file")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text Input</TabsTrigger>
                <TabsTrigger value="file">File Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-4">
                <Textarea
                  placeholder="Paste your document text here..."
                  value={documentText}
                  onChange={(e) => {
                    setDocumentText(e.target.value);
                    if (fileName) setFileName(null); // Clear filename if user types after uploading
                  }}
                  rows={10}
                  className="text-base"
                  aria-label="Document text input"
                />
              </TabsContent>
              <TabsContent value="file" className="mt-4 space-y-3">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".txt,.md,text/plain,text/markdown"
                  className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  aria-label="Document file input"
                />
                {fileName && <p className="text-sm text-muted-foreground">Loaded file: <span className="font-medium text-foreground">{fileName}</span></p>}
                 <p className="text-xs text-muted-foreground">
                  Supported files: .txt, .md. Complex formats like PDF/DOCX are not currently supported.
                </p>
              </TabsContent>
            </Tabs>
            
            <Button 
              onClick={handleAnalyze} 
              disabled={isLoading} 
              className="w-full md:w-auto text-lg py-3 px-6 mt-4"
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
                  {analysisResult.keyInformation?.keywords && analysisResult.keyInformation.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keyInformation.keywords.map((keyword, index) => (
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
                  {analysisResult.keyInformation?.importantPoints && analysisResult.keyInformation.importantPoints.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-base">
                      {analysisResult.keyInformation.importantPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No important points extracted.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {analysisResult.identifiedCharacters?.characters && analysisResult.identifiedCharacters.characters.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Users className="mr-3 h-6 w-6 text-primary" /> Characters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.identifiedCharacters.characters.map((character, index) => (
                    <div key={index} className="p-3 border rounded-md bg-card">
                      <p className="font-semibold text-base">{character.name}</p>
                      <p className="text-sm text-muted-foreground">{character.description}</p>
                    </div>
                  ))}
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
