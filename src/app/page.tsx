'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ClipboardPaste, Copy, Sun, Moon, Type } from 'lucide-react';
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hiddenInput = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update text on server
  const updateText = async (newText: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newText }),
      });
      
      if (!response.ok) throw new Error('Failed to update');
      setError('');
      toast.success('Text updated successfully');
    } catch (err) {
      setError('Failed to save text');
      toast.error('Failed to save text');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateText(newText);
  };

  // Handle paste attempt
  const handlePasteAttempt = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
        const clipboardText = await navigator.clipboard.readText();
        setText(clipboardText);
        updateText(clipboardText);
        toast.success('Text pasted successfully');
        return;
      }

      if (hiddenInput.current) {
        hiddenInput.current.focus();
        setTimeout(() => {
          document.execCommand('paste');
        }, 100);
      }
    } catch (err) {
      setError('Failed to paste from clipboard');
      toast.error('Failed to paste from clipboard');
      console.error(err);
    }
  };

  // Handle copy functionality with fallback
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        toast.success('Text copied to clipboard');
        return;
      }

      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        toast.success('Text copied to clipboard');
      } catch (err) {
        textArea.remove();
        setError('Failed to copy text');
        toast.error('Failed to copy text');
        console.error(err);
      }
    } catch (err) {
      setError('Failed to copy text');
      toast.error('Failed to copy text');
      console.error(err);
    }
  };

  // Handle paste event on hidden input
  const handleHiddenPaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    setText(pastedText);
    updateText(pastedText);
    if (hiddenInput.current) {
      hiddenInput.current.blur();
    }
  };

  // Fetch updates
  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch('/api/text');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setText(data.text);
        setError('');
      } catch (err) {
        setError('Failed to fetch text');
        console.error(err);
      }
    };

    fetchText();
    const interval = setInterval(fetchText, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (!mounted) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Local Text Share</CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Share text between devices on your local network
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full min-h-[150px] flex flex-col gap-2"
                disabled
              >
                <ClipboardPaste className="h-5 w-5" />
                Loading...
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Local Text Share</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Share text between devices on your local network
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-2 rounded text-center">
                {error}
              </div>
            )}
            
            {showTextInput ? (
              <div className="space-y-2">
                <Textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Type your text here..."
                  className="min-h-[150px]"
                />
              </div>
            ) : (
              <Button
                onClick={handlePasteAttempt}
                variant="outline"
                className="w-full min-h-[150px] flex flex-col gap-2"
              >
                <ClipboardPaste className="h-5 w-5" />
                Click to paste from clipboard
              </Button>
            )}

            <input
              ref={hiddenInput}
              type="text"
              className="opacity-0 h-0 w-0 absolute"
              onPaste={handleHiddenPaste}
            />
            
            <div className="rounded-lg border bg-card p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Current Stored Text:</h3>
                {text && (
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                )}
              </div>
              <div className="whitespace-pre-wrap">
                {text || <span className="text-muted-foreground italic">No text shared yet</span>}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              {loading ? 'Saving...' : 'Open this page on any device in the same network to view or update the text.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="min-h-screen p-4 md:p-24 bg-background">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowTextInput(!showTextInput)}
          aria-label="Toggle text input"
        >
          <Type className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          suppressHydrationWarning
        >
          {mounted && (theme === 'dark' ? 
            <Sun className="h-5 w-5" /> : 
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
      {renderContent()}
    </main>
  );
}