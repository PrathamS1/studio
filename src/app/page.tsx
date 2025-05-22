
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { summarizeDocument, type SummarizeDocumentOutput } from '@/ai/flows/summarize-document';
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Tags, ListChecks, Users, AlertCircle } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';


if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;
}


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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsLoading(true);
      setError(null);
      setDocumentText(""); 

      try {
        let text = "";
        const fileType = file.type;
        const fName = file.name.toLowerCase();

        if (fileType === 'text/plain' || fName.endsWith('.txt') || fName.endsWith('.md')) {
          text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error("Failed to read the text file."));
            reader.readAsText(file);
          });
        } else if (fName.endsWith('.docx')) {
          const arrayBuffer = await file.arrayBuffer();
          const mammothResult = await mammoth.extractRawText({ arrayBuffer });
          text = mammothResult.value;
        } else if (fName.endsWith('.doc')) {
          const arrayBuffer = await file.arrayBuffer();
          try {
            const mammothResult = await mammoth.extractRawText({ arrayBuffer });
            text = mammothResult.value;
            if (!text.trim()) {
                toast({
                    title: "Empty or Unreadable .doc File",
                    description: "Could not extract significant text from the .doc file. For older .doc files, conversion to .docx or plain text might yield better results.",
                    variant: "default", 
                  });
            }
          } catch (docError) {
            console.warn("Mammoth .doc parsing error:", docError);
            toast({
              title: "Limited .doc Support",
              description: "Could not reliably extract text from this .doc file. Please try converting it to .docx or a plain text format (.txt, .md) for best results.",
              variant: "default",
            });
            text = ""; 
          }
        } else if (fileType === 'application/pdf' || fName.endsWith('.pdf')) {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item) => (item as TextItem).str).join(" ") + "\n";
          }
          text = fullText;
        } else {
          throw new Error("Unsupported file type. Please upload .txt, .md, .docx, .doc, or .pdf files.");
        }

        setDocumentText(text);
        toast({
          title: "File Processed",
          description: `${file.name} has been processed successfully. Ready to analyze.`,
        });
      } catch (e: any) {
        console.error("File processing error:", e);
        setError(e.message || "Failed to process the file.");
        toast({
          title: "File Process Error",
          description: e.message || "Could not process the selected file.",
          variant: "destructive",
        });
        setFileName(null); 
      } finally {
        setIsLoading(false);
      }
    }
  };


  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text or upload and process a file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result: SummarizeDocumentOutput = await summarizeDocument({ documentText });
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Document analysis finished successfully.",
      });
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background selection:bg-accent selection:text-accent-foreground">
      <header className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Insightful Reader</h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Unlock insights from your documents. Paste text or upload a file (.txt, .md, .docx, .pdf) to get summaries, keywords, important points, and character analyses powered by AI.
        </p>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Provide Your Document</CardTitle>
            <CardDescription>Choose to paste text directly or upload a supported file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={inputType} onValueChange={(value) => setInputType(value as "text" | "file")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="text-sm md:text-base">Text Input</TabsTrigger>
                <TabsTrigger value="file" className="text-sm md:text-base">File Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-6">
                <Textarea
                  placeholder="Paste your document text here..."
                  value={documentText}
                  onChange={(e) => {
                    setDocumentText(e.target.value);
                    if (fileName) setFileName(null); 
                  }}
                  rows={12}
                  className="text-base p-3 rounded-md"
                  aria-label="Document text input"
                />
              </TabsContent>
              <TabsContent value="file" className="mt-6 space-y-4">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".txt,.md,text/plain,text/markdown,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,application/pdf"
                  className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary-foreground hover:file:bg-primary/30 cursor-pointer"
                  aria-label="Document file input"
                />
                {fileName && <p className="text-sm text-muted-foreground">Selected file: <span className="font-medium text-foreground">{fileName}</span></p>}
                 <p className="text-xs text-muted-foreground">
                  Supported files: .txt, .md, .docx, .pdf. (.doc support is limited). Max file size 10MB.
                </p>
              </TabsContent>
            </Tabs>
            
            <Button 
              onClick={handleAnalyze} 
              disabled={isLoading || (inputType === 'file' && !documentText && !!fileName)}
              className="w-full md:w-auto text-lg py-3 px-8 mt-4 rounded-md shadow-md hover:shadow-lg transition-shadow"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                  {fileName && !documentText ? "Processing File..." : "Analyzing..."}
                </>
              ) : (
                "Analyze Document"
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive bg-destructive/10 shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive text-xl">
                <AlertCircle className="mr-2 h-6 w-6" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive-foreground">{error}</p>
            </CardContent>
          </Card>
        )}

        {analysisResult && !isLoading && (
          <div className="space-y-6">
            <Card className="shadow-xl rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl md:text-2xl">
                  <FileText className="mr-3 h-6 w-6 text-primary" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">{analysisResult.summary || "No summary available."}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl md:text-2xl">
                    <Tags className="mr-3 h-6 w-6 text-primary" /> Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResult.keyInformation?.keywords && analysisResult.keyInformation.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keyInformation.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1 rounded-full">{keyword}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No keywords extracted.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-xl rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl md:text-2xl">
                    <ListChecks className="mr-3 h-6 w-6 text-primary" /> Important Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResult.keyInformation?.importantPoints && analysisResult.keyInformation.importantPoints.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-base md:text-lg">
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
              <Card className="shadow-xl rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl md:text-2xl">
                    <Users className="mr-3 h-6 w-6 text-primary" /> Characters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.identifiedCharacters.characters.map((character, index) => (
                    <div key={index} className="p-4 border rounded-md bg-card/50 shadow">
                      <p className="font-semibold text-base md:text-lg text-primary">{character.name}</p>
                      <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap">{character.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
      <footer className="w-full max-w-5xl mt-12 pt-8 border-t text-center">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Insightful Reader. Powered by AI.</p>
      </footer>
    </div>
  );
}
