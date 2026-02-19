"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Container from "@/bloggo/components/ui/Container";
import Button from "@/bloggo/components/ui/Button";
import Badge from "@/bloggo/components/ui/Badge";
import Input from "@/bloggo/components/ui/Input";
import { getBlogBySlug } from "@/bloggo/lib/mock-data";

const BASE = "/bloggo";

interface EditorState {
  title: string;
  content: string;
  tags: string;
  lastSaved: string | null;
}

const DEFAULT_CONTENT = `## Introduction

Start writing your post here. This editor supports **markdown-style** formatting.

## Main Section

Add your main content here. You can write about anything!

> Add a blockquote to highlight important information.

## Conclusion

Wrap up your thoughts and add a call to action.
`;

export default function EditorPage() {
  const params = useParams();
  const slug = params.slug as string;
  const storageKey = `bloggo-draft-${slug}`;

  const [state, setState] = useState<EditorState>(() => {
    const defaults: EditorState = {
      title: "",
      content: DEFAULT_CONTENT,
      tags: "",
      lastSaved: null,
    };
    if (typeof window === "undefined") return defaults;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved) as EditorState;
      } catch {
        // ignore
      }
    }

    const mockPost = getBlogBySlug(slug);
    if (mockPost) {
      return {
        ...defaults,
        title: mockPost.title,
        tags: mockPost.tags.join(", "),
        content: mockPost.sections
          .map((sec) => {
            if (sec.type === "heading") return `## ${sec.content}`;
            if (sec.type === "paragraph") return sec.content;
            if (sec.type === "quote") return `> ${sec.content}`;
            if (sec.type === "code")
              return `\`\`\`${sec.language || ""}\n${sec.content}\n\`\`\``;
            if (sec.type === "list")
              return `${sec.content}\n${sec.items?.map((i) => `- ${i}`).join("\n") || ""}`;
            return "";
          })
          .join("\n\n"),
      };
    }

    return defaults;
  });
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [preview, setPreview] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveToLocal = (newState: EditorState) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setSaving(true);
      const withTimestamp = {
        ...newState,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(withTimestamp));
      setState(withTimestamp);
      setTimeout(() => setSaving(false), 600);
    }, 1000);
  };

  const update = (field: keyof EditorState, value: string) => {
    const newState = { ...state, [field]: value };
    setState(newState);
    saveToLocal(newState);
  };

  const handlePublish = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPublished(true);
    }, 1500);
  };

  const wordCount = state.content.trim().split(/\s+/).filter(Boolean).length;

  if (published) {
    return (
      <Container
        size="sm"
        className="py-32 flex flex-col items-center text-center gap-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-4xl">
          🎉
        </div>
        <h1 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
          Post Published!
        </h1>
        <p className="text-[var(--bloggo-text-secondary)]">
          <strong className="text-[var(--bloggo-text-primary)]">
            {state.title || "Your post"}
          </strong>{" "}
          is now live. (This is a demo — no real publishing happens.)
        </p>
        <div className="flex gap-3">
          <Link href={`${BASE}/profile/demo`}>
            <Button variant="primary">View Profile</Button>
          </Link>
          <Button variant="secondary" onClick={() => setPublished(false)}>
            Keep Editing
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-16 z-30 border-b border-[var(--bloggo-border)] bg-[var(--bloggo-bg)]/90 backdrop-blur-xl">
        <Container className="flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`${BASE}/profile/demo`}
              className="text-sm text-[var(--bloggo-text-muted)] hover:text-[var(--bloggo-text-primary)] transition-colors"
            >
              ← Back
            </Link>
            <span className="text-[var(--bloggo-border)]">|</span>
            <span className="text-xs text-[var(--bloggo-text-muted)]">
              {saving ? (
                <span className="text-amber-400">Saving…</span>
              ) : state.lastSaved ? (
                <span className="text-emerald-400">
                  Saved {new Date(state.lastSaved).toLocaleTimeString()}
                </span>
              ) : (
                "Draft"
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--bloggo-text-muted)] hidden sm:block">
              {wordCount} words
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreview((v) => !v)}
            >
              {preview ? "✏️ Edit" : "👁 Preview"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              loading={saving}
              disabled={!state.title || !state.content}
            >
              Publish
            </Button>
          </div>
        </Container>
      </div>

      <Container size="md" className="py-10">
        {preview ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Badge variant="yellow">Preview Mode</Badge>
              <span className="text-xs text-[var(--bloggo-text-muted)]">
                This is how your post will look
              </span>
            </div>
            <h1 className="text-4xl font-black text-[var(--bloggo-text-primary)]">
              {state.title || "Untitled Post"}
            </h1>
            {state.tags && (
              <div className="flex flex-wrap gap-2">
                {state.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <Badge key={tag} variant="violet">
                      {tag}
                    </Badge>
                  ))}
              </div>
            )}
            <div className="prose-bloggo whitespace-pre-wrap border-t border-[var(--bloggo-border)] pt-8">
              {state.content}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="violet">✍️ Editor</Badge>
              <span className="text-xs text-[var(--bloggo-text-muted)]">
                Draft auto-saved to localStorage
              </span>
            </div>

            <div>
              <label htmlFor="editor-title" className="sr-only">
                Post title
              </label>
              <textarea
                id="editor-title"
                rows={2}
                placeholder="Your post title…"
                value={state.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full bg-transparent text-3xl sm:text-4xl font-black text-[var(--bloggo-text-primary)] placeholder:text-[var(--bloggo-text-muted)] resize-none focus:outline-none border-b border-[var(--bloggo-border)] pb-4 leading-tight"
              />
            </div>

            <Input
              label="Tags"
              id="editor-tags"
              type="text"
              placeholder="Next.js, TypeScript, Web Dev (comma separated)"
              value={state.tags}
              onChange={(e) => update("tags", e.target.value)}
              hint="Separate tags with commas"
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="editor-content"
                className="text-sm font-medium text-[var(--bloggo-text-secondary)]"
              >
                Content
              </label>
              <textarea
                id="editor-content"
                rows={28}
                placeholder="Start writing your post…"
                value={state.content}
                onChange={(e) => update("content", e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--bloggo-bg-card)] border border-[var(--bloggo-border)] text-[var(--bloggo-text-primary)] placeholder:text-[var(--bloggo-text-muted)] font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500/50 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-[var(--bloggo-text-muted)]">
              <span>## Heading</span>
              <span>**bold**</span>
              <span>*italic*</span>
              <span>&gt; Quote</span>
              <span>```code```</span>
              <span>- List item</span>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
