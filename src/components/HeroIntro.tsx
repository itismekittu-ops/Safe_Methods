import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUp, FileText } from 'lucide-react';
import { useBidding } from '../contexts/BiddingContext';
import { preCannedQuestions } from '../data/preCannedQuestions';
import { supabase } from '../lib/supabase';
import { AskInput } from './AskInput';

interface HeroIntroProps {
  onOpenQuotesModal: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  followUps?: string[];
}

export function HeroIntro({ onOpenQuotesModal }: HeroIntroProps) {
  const { setCategoryId } = useBidding();
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window when new content is added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Requirement 4: Reset chat state when Safe Methods logo is clicked
  useEffect(() => {
    const handleResetChat = () => {
      setMessages([]);
      setQuery('');
      setLoading(false);
    };
    window.addEventListener('reset-safe-chat', handleResetChat);
    return () => window.removeEventListener('reset-safe-chat', handleResetChat);
  }, []);

  const handleSend = async (questionText: string) => {
    if (!questionText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: questionText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    // 1. Check local pre-canned answers first
    const matched = preCannedQuestions.find(
      (q) => q.question.toLowerCase().trim() === questionText.toLowerCase().trim()
    );

    if (matched) {
      if (matched.category) {
        setCategoryId(matched.category);
      }
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: matched.answer,
            category: matched.category,
            followUps: matched.followUps || [],
          },
        ]);
        setLoading(false);
      }, 200);
      return;
    }

    // 2. Fall back to backend RAG Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('safebot-chat', {
        body: { query: questionText },
      });

      if (error) throw error;

      if (data?.category) {
        setCategoryId(data.category);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data?.answer || "I'm sorry, I couldn't generate a response. Please try asking an advisor.",
          category: data?.category,
          followUps: data?.followUps || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "The best rate comes from comparing several lenders on the same term and type. Speak to one of our top matched advisors on the right for an accurate, personalized quote.",
          followUps: [
            "How much down payment do I need to buy a home?",
            "Should I renew with my current bank or switch lenders?",
            "What is a mortgage pre-approval and should I get one?",
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isChatActive = messages.length > 0 || loading;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 bg-white/60 p-4 sm:p-5 shadow-sm backdrop-blur-sm">
      {/* Scrollable Main Canvas Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <AnimatePresence mode="wait">
          {!isChatActive ? (
            /* Initial Hero Screen with 6 Demo Cards */
            <motion.div
              key="hero-cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col justify-between"
            >
              <div>
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-forest uppercase">
                  Only 1 in 4 (25%) Canadians turn to a financial advisor or planner for advice
                </p>
                <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-medium tracking-tight text-forest">
                  We bring financial experts from top big firms so you can compare &amp; choose the best product or interest rate.
                </h1>
              </div>

              {/* 2-column centered demo cards */}
              <div className="my-auto py-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {preCannedQuestions.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSend(item.question)}
                    className="group flex h-[54px] w-full items-center justify-between rounded-xl border border-stone-200/90 bg-white px-3.5 text-left text-xs font-medium text-stone-800 transition-all duration-150 hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-500/5 hover:shadow-md hover:ring-2 hover:ring-amber-400/40"
                  >
                    <span className="line-clamp-2 pr-2">{item.question}</span>
                    <Search className="h-4 w-4 shrink-0 text-stone-400 group-hover:text-amber-500 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Active Conversation View */
            <motion.div
              key="chat-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col space-y-3"
            >
              {/* 
                REQUIREMENT 1:
                "New Topic" button removed.
                The header now sits flush with the query pill, eliminating wasted space at the top.
              */}
              <div className="flex items-center justify-end pb-1">
                {messages[0]?.role === 'user' && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs text-stone-700">
                    <Search className="h-3.5 w-3.5 text-stone-400" />
                    <span className="truncate max-w-[280px] font-medium">{messages[0].content}</span>
                  </div>
                )}
              </div>

              {/* Chat Thread Messages */}
              {messages.map((msg) => (
                <div key={msg.id} className="w-full">
                  {msg.role === 'assistant' ? (
                    <div className="w-full space-y-2">
                      {/* 
                        REQUIREMENT 2: Border removed completely (no border, no card wrapper).
                        REQUIREMENT 3: Font size reduced to text-[13px] / leading-snug for maximum density.
                      */}
                      <div className="w-full border-0 bg-transparent p-0 text-[13px] leading-snug text-stone-800 font-normal">
                        <div className="space-y-2 whitespace-pre-line">
                          {msg.content}
                        </div>
                      </div>

                      {/* 
                        REQUIREMENT 5: Outer border and box styling removed completely.
                        REQUIREMENT 6: The two lines are placed together in one inline line with Get Quotes button.
                      */}
                      <div className="w-full border-0 bg-transparent py-1.5 px-0.5 my-1.5 flex flex-wrap items-center justify-between gap-2 border-t-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-700">
                          <span className="font-semibold text-stone-900">Your best options are on the right &rarr;</span>
                          <span className="text-stone-400 hidden sm:inline">&bull;</span>
                          <span className="text-stone-600">Get free, no-obligation quotes in your inbox</span>
                        </div>
                        <button
                          type="button"
                          onClick={onOpenQuotesModal}
                          className="inline-flex items-center shrink-0 gap-1.5 rounded-lg bg-forest hover:bg-forest/90 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors duration-150"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Get Quotes</span>
                        </button>
                      </div>

                      {/* Contextual Follow-up Suggestion Chips */}
                      {msg.followUps && msg.followUps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.followUps.map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(prompt)}
                              className="rounded-full border border-stone-200 bg-white px-3 py-1 text-left text-xs font-medium text-stone-700 hover:border-forest/40 hover:bg-cream-deep/60 hover:text-forest transition-colors shadow-2xs"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 py-2 text-xs text-stone-500">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-forest"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-forest [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-forest [animation-delay:-0.3s]"></div>
                  <span>Searching top rates and guidance...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
        REQUIREMENT 7:
        The line separating the chat window and chat input is removed (no border-t, minimal padding).
      */}
      <div className="pt-1 mt-1 border-0">
        <AskInput
          value={query}
          onChange={setQuery}
          onSubmit={() => handleSend(query)}
          disabled={loading}
        />
      </div>
    </div>
  );
}