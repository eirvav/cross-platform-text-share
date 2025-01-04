'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardPaste } from 'lucide-react';

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hiddenInput = useRef<HTMLInputElement>(null);

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
    } catch (err) {
      setError('Failed to save text');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle paste attempt
  const handlePasteAttempt = async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard?.readText) {
        const clipboardText = await navigator.clipboard.readText();
        setText(clipboardText);
        updateText(clipboardText);
        return;
      }

      // Fallback for iOS: Focus and paste into hidden input
      if (hiddenInput.current) {
        hiddenInput.current.focus();
        document.execCommand('paste');
      }
    } catch (err) {
      setError('Failed to paste from clipboard');
      console.error(err);
    }
  };

  // Handle paste event on hidden input
  const handleHiddenPaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    setText(pastedText);
    updateText(pastedText);
    // Blur the hidden input after pasting
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

    // Initial fetch
    fetchText();

    // Set up polling
    const interval = setInterval(fetchText, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-24 bg-gray-50">
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
              <div className="bg-red-50 text-red-500 p-2 rounded text-center">
                {error}
              </div>
            )}
            
            <button
              onClick={handlePasteAttempt}
              className="w-full min-h-[150px] flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ClipboardPaste className="h-5 w-5" />
              Click to paste from clipboard
            </button>
            <input
              ref={hiddenInput}
              type="text"
              className="opacity-0 h-0 w-0 absolute"
              onPaste={handleHiddenPaste}
            />
            
            <div className="rounded-lg border p-4 bg-white">
              <h3 className="font-medium mb-2">Current Stored Text:</h3>
              <div className="whitespace-pre-wrap">
                {text || <span className="text-muted-foreground italic">No text shared yet</span>}
              </div>
            </div>
            
            <p className="text-sm text-gray-500 text-center">
              {loading ? 'Saving...' : 'Open this page on any device in the same network to view or update the text.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}