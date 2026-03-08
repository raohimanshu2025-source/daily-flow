import { useState, useRef, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Send, Mic, Bot, User } from "lucide-react";
import { store } from "@/lib/store";

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  time: string;
}

const quickReplies = ["Check balance", "Today's income", "My savings", "Loan status", "Help"];

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  const balance = store.getBalance();
  const todayIncome = store.getTodayIncome();
  const totalSavings = store.getTotalSavings();
  const activeLoans = store.getActiveLoans();

  if (lower.includes('balance') || lower.includes('kitna paisa'))
    return `Your available balance is ₹${balance.toLocaleString("en-IN")}. Keep earning! 💪`;
  if (lower.includes('income') || lower.includes('kamai') || lower.includes('today'))
    return `Today you earned ₹${todayIncome.toLocaleString("en-IN")}. ${todayIncome > 0 ? 'Great work!' : 'Log your income to track earnings!'}`;
  if (lower.includes('saving') || lower.includes('bachat'))
    return `Total savings: ₹${totalSavings.toLocaleString("en-IN")}. ${totalSavings > 0 ? 'You\'re building a safety net! 🎯' : 'Start saving as little as ₹10/day!'}`;
  if (lower.includes('loan') || lower.includes('karz'))
    return `You have ${activeLoans.length} active loan(s). ${activeLoans.length > 0 ? `Total: ₹${activeLoans.reduce((s, l) => s + l.amount, 0).toLocaleString("en-IN")}` : 'You can apply for a micro-loan anytime!'}`;
  if (lower.includes('help') || lower.includes('madad'))
    return 'I can help you with:\n• Check balance\n• View today\'s income\n• Check savings\n• Loan status\n\nJust type or tap a quick reply! 😊';
  return 'I\'m your RozanaPay assistant! Try asking about your balance, income, savings, or loans. आप हिंदी में भी पूछ सकते हैं! 🙏';
}

export default function ChatBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Namaste! 🙏 I\'m your RozanaPay assistant. How can I help you today?\n\nआप हिंदी या English में पूछ सकते हैं!', sender: 'bot', time: new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, text, sender: 'user', time: new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg: Message = { id: `b-${Date.now()}`, text: getBotResponse(text), sender: 'bot', time: new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <MobileLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)]">
        <div className="px-5 pt-6 pb-2">
          <h1 className="text-xl font-bold text-foreground mb-0.5">Chat Assistant</h1>
          <p className="text-xs text-muted-foreground">Ask in Hindi or English · Voice coming soon</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
                msg.sender === 'user'
                  ? 'gradient-primary text-primary-foreground rounded-br-md'
                  : 'bg-card shadow-card text-foreground rounded-bl-md'
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {quickReplies.map((qr) => (
            <button key={qr} onClick={() => sendMessage(qr)} className="shrink-0 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              {qr}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 pb-3 flex gap-2">
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Mic className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type your question..."
              className="flex-1 px-4 py-2.5 rounded-full bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button onClick={() => sendMessage(input)} className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <Send className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
