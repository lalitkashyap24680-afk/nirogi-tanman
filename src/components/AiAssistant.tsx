import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMsg {
  role: "user" | "model";
  content: string;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "model",
      content: "Hello! I am the Nirogi-TanMan AI health assistant. Ask me anything about healthy diet, yoga, exercises, doctors, or medicines! How can I support your wellness today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    if (!textToSend) setInput("");

    const newMessages = [...messages, { role: "user" as const, content: prompt }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, chatHistory: messages })
      });
      const data = await response.json();
      if (data.text) {
        setMessages((prev) => [...prev, { role: "model", content: data.text }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: "Apologies, I encountered a temporary communication glitch. Please try again soon." }
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Failed to reach servers. Please ensure your backend is compiled and online." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "What are early symptoms of heart care issues?",
    "Recommend an Ayurveda product for stress",
    "Suggest a simple 10-minute morning yoga routine",
    "How do I schedule an appointment with Dr. Priya?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="mb-4 w-[360px] h-[520px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 dark:border-slate-700"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm">TanMan Health AI</h4>
                  <p className="text-[10px] text-green-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-ping"></span>
                    Ask basic questions & tips
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FCFBF7] dark:bg-slate-900">
              <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                ⚠️ Information provided by AI is for lifestyle awareness. Please schedule a consultation with our certified doctors for official diagnostics.
              </div>

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "model" && (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#2E7D32] flex items-center justify-center shrink-0">
                      <Bot size={15} />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#2E7D32] text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-green-100/10 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-[#1B5E20]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
                      <User size={15} />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#2E7D32] flex items-center justify-center shrink-0">
                    <Bot size={15} />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block px-1">Suggested prompts</span>
                <div className="flex flex-col gap-1">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s)}
                      className="text-left text-[11px] text-[#2E7D32] hover:text-[#1B5E20] bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30 px-3 py-1.5 rounded-xl border border-green-100/50 dark:border-green-900/30 transition truncate cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
              <input
                type="text"
                placeholder="Type your wellness query..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-slate-50 dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                className="p-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl transition shadow-md flex items-center justify-center shrink-0 active:scale-95 duration-100 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-tr from-[#2E7D32] to-[#1B5E20] text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E7D32]"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}
