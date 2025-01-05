'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardPaste, Copy, Sun, Moon, ImageIcon, ImagePlus, Download } from 'lucide-react';
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type InputMode = 'paste' | 'image';

export default function Home() {
  // State for managing text content and image data (base64)
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  // Used to prevent hydration issues with theme
  const [mounted, setMounted] = useState(false);

  // Refs for handling clipboard operations and file uploads
  const hiddenInput = useRef<HTMLInputElement>(null);  // Used for paste fallback
  const fileInputRef = useRef<HTMLInputElement>(null); // Used for image upload
  const { theme, setTheme } = useTheme();

  // Handle hydration mismatch with theme
  useEffect(() => setMounted(true), []);

  /**
   * Updates the server with new text or image data
   * @param data Object containing text or image to update
   */
  const updateData = async (data: { text?: string; image?: string }) => {
    try {
      setLoading(true);
      const response = await fetch('/api/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      toast.success('Updated successfully');
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles image upload from file input
   * Validates file size and converts to base64
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImage(base64);
      updateData({ image: base64 });
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click when upload button is clicked
  const handleImageClick = () => fileInputRef.current?.click();

  /**
   * Detects if the current device is mobile
   * Used to determine download vs copy functionality
   */
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  /**
   * Handles image actions based on device type
   * Mobile: Downloads the image
   * Desktop: Copies to clipboard
   */
  const handleImageAction = async () => {
    if (!image) return;

    if (isMobile()) {
      try {
        // Convert base64 to blob for download
        const base64Data = image.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        
        // Process in chunks to handle large files
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        // Create blob and trigger download
        const blob = new Blob(byteArrays, { type: 'image/png' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `shared-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        toast.success('Image download started');
      } catch (err) {
        toast.error('Failed to download image');
      }
    } else {
      try {
        // Desktop: Copy to clipboard using Canvas
        const img = new Image();
        img.src = image;
        await new Promise((resolve) => (img.onload = resolve));
        
        // Create canvas to handle image copying
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error();
        
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('Image copied to clipboard');
      } catch {
        toast.error('Failed to copy image');
      }
    }
  };

  /**
   * Handles text paste with fallback for browsers without clipboard API
   */
  const handlePasteAttempt = async () => {
    try {
      // Modern clipboard API
      if (navigator.clipboard?.readText) {
        const clipboardText = await navigator.clipboard.readText();
        setText(clipboardText);
        updateData({ text: clipboardText });
        toast.success('Text pasted successfully');
        return;
      }
      // Fallback for older browsers
      hiddenInput.current?.focus();
      setTimeout(() => document.execCommand('paste'), 100);
    } catch {
      toast.error('Failed to paste from clipboard');
    }
  };

  /**
   * Handles text copy with fallback for browsers without clipboard API
   */
  const handleCopyText = async () => {
    if (!text) return;
    try {
      // Modern clipboard API
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('Text copied to clipboard');
        return;
      }
      // Fallback using document.execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Text copied to clipboard');
    } catch {
      toast.error('Failed to copy text');
    }
  };

  /**
   * Handles paste events from the hidden input fallback
   */
  const handleHiddenPaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    setText(pastedText);
    updateData({ text: pastedText });
    hiddenInput.current?.blur();
  };

  /**
   * Fetches initial data and sets up polling for updates
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/text');
        if (!response.ok) return;
        const data = await response.json();
        setText(data.text || '');
        setImage(data.image);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Renders the main input section (paste or upload)
   */
  const renderInputSection = () => (
    <Button
      onClick={inputMode === 'image' ? handleImageClick : handlePasteAttempt}
      variant="outline"
      className="w-full min-h-[150px] flex flex-col gap-2"
    >
      {inputMode === 'image' ? (
        <>
          <ImagePlus className="h-5 w-5" />
          Click to upload image
        </>
      ) : (
        <>
          <ClipboardPaste className="h-5 w-5" />
          Click to paste from clipboard
        </>
      )}
    </Button>
  );

  /**
   * Renders the main content with loading state handling
   */
  const renderContent = () => {
    // Show loading state before hydration
    if (!mounted) {
      return (
        <Card className="max-w-2xl mx-auto mt-16">
          <CardHeader>
            <CardTitle className="text-center">Local Text & Image Share</CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Share text and images between devices on your local network
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full min-h-[150px] flex flex-col gap-2" disabled>
                <ClipboardPaste className="h-5 w-5" />
                Loading...
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Main content render
    return (
      <Card className="max-w-2xl mx-auto mt-16">
        <CardHeader>
          <CardTitle className="text-center">Local Text & Image Share</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Share text and images between devices on your local network.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-4">
              {renderInputSection()}
              
              {/* Hidden file input for image uploads */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              {/* Image preview section */}
              {inputMode === 'image' && image && (
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">Shared Image:</h3>
                    <Button
                      onClick={handleImageAction}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {isMobile() ? (
                        <>
                          <Download className="h-4 w-4" />
                          Download
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <img 
                    src={image} 
                    alt="Shared" 
                    className="max-w-full rounded-lg"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              )}

              {/* Hidden input for paste fallback */}
              <input
                ref={hiddenInput}
                type="text"
                className="opacity-0 h-0 w-0 absolute"
                onPaste={handleHiddenPaste}
              />
              
              {/* Text display section */}
              {inputMode === 'paste' && (
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">Current Stored Text:</h3>
                    {text && (
                      <Button
                        onClick={handleCopyText}
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
              )}
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {loading ? 'Saving...' : 'Open this page on any device in the same network to view or update the content.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="min-h-screen p-4 md:p-24 bg-background">
      {/* Theme and mode toggle buttons */}
      <div className="max-w-2xl mx-auto flex justify-end gap-2 mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setInputMode(mode => mode === 'paste' ? 'image' : 'paste')}
                aria-label={`Switch to ${inputMode === 'paste' ? 'image' : 'text'} mode`}
              >
                {inputMode === 'paste' ? (
                  <>
                    <ImageIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Switch to Image</span>
                  </>
                ) : (
                  <>
                    <ClipboardPaste className="h-4 w-4" />
                    <span className="hidden sm:inline">Switch to Text</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {`Switch to ${inputMode === 'paste' ? 'image upload' : 'text paste'} mode`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
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