import { useState, useRef, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const quickReplies = ["How to save more?", "Explain BNPL", "Loan tips", "Budget help", "What is digital gold?"];

export default function ChatBotPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Namaste! 🙏 I'm your **RozanaPay AI assistant**.\n\nAsk me anything about savings, loans, budgeting, or financial planning!\n\nआप हिंदी या English में पूछ सकते हैं!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        toast.error(err.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > newMessages.length) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to get response");
    }
    setIsLoading(false);
  };

  return (
    <MobileLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)]">
        <div className="px-5 pt-6 pb-2">
          <h1 className="text-xl font-black text-foreground mb-0.5">AI Assistant 🤖</h1>
          <p className="text-xs text-muted-foreground">Powered by AI · Hindi & English</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'gradient-primary text-primary-foreground rounded-br-md'
                  : 'bg-card shadow-card text-foreground rounded-bl-md'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>ul]:mb-1 [&>ol]:mb-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-card shadow-card rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {quickReplies.map((qr) => (
            <button key={qr} onClick={() => sendMessage(qr)} disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold disabled:opacity-50">
              {qr}
            </button>
          ))}
        </div>

        <div className="px-5 pb-3 flex gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-full bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button onClick={() => sendMessage(input)} disabled={isLoading}
              className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0 disabled:opacity-50">
              <Send className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
