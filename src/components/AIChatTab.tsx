import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, RefreshCw, Bot, User, ShieldAlert } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'Maxay yihiin lammaanaha SMT-da u saxda ah Dahabka (XAUUSD)?',
  'Sidee loo gartaa Invalidation-ka marka setup-ku jabo?',
  'Ii sharax Entry #1 line iyo sababta aan limit order u dhiganno?',
  'Maxay yihiin Purge hours-ka waqtiga New York?',
  'Muxuu yahay sharciga 1% risk iyo bartilmaameedka 3R/2R?',
  'Waa maxay micnaha KOD ee TSQ sequence-ka?',
];

export const AIChatTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Asc! Waxaan ahay kaaliyahaaga barashada Model#1 (XAUUSD kaliya) ee ICT TET mentorship (2026).

Waxaan kaa caawinayaa:
1. Fahamka sharciyada Model#1 (HTF Bias, 7H Sessions, Purge Hours, CRT, TS, SMT, Entry #1)
2. Hubinta setup-yadaada adoo raacaya 11-ka qodob
3. Diiwaangelinta nadiifka ah ee trades-kaaga

Sharcigeyga adag: Waxba ma abuuro (DO NOT INVENT). Haddii wax aan la hubin la i weydiiyo, waxaan ku leeyahay "ma hubo". Weligayna ma bixiyo baaqyo iibsi/iibin ah (no buy/sell signals).

Maxaan kaala shaqeeyaa maanta?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: textToSend.trim() },
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Khalad ayaa dhacay.');
      }

      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `Ka xunow, cilad ayaa dhacday: ${err.message || 'Isku day mar kale'}.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[700px]">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Model#1 Study Coach (Af-Soomaali)
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Jawaabo waafaqsan sharciyada adag ee TET mentorship • XAUUSD kaliya
            </p>
          </div>
        </div>

        <div className="text-[11px] text-amber-300/80 flex items-center gap-1 font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Ha abuurin (DO NOT INVENT)</span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap font-sans ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              {msg.content}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Kaaliyaha wuxuu hubinayaa shuruucda Model#1...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1.5">
          Su&apos;aalaha Degdegga ah:
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition border border-slate-700/50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70">
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Weydii sharci kasta oo Model#1 ah ama geli xaalad suuq ah..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none placeholder-slate-600 resize-none"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-1.5 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Kaliya ujeeddo waxbarasho • Ma jirto saadaal maaliyadeed</span>
          <span>Shift+Enter xariiq cusub</span>
        </div>
      </div>
    </div>
  );
};
