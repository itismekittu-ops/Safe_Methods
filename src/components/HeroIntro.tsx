import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SearchIcon, FileTextIcon, ArrowRightIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AskInput } from './AskInput';
import { SuggestionGrid } from './SuggestionGrid';
import { BiddingArena } from './arena/BiddingArena';
import { SourceMarker } from './SourceMarker';
import { useAskInput } from '../hooks/useAskInput';
import { useBidding } from '../contexts/BiddingContext';
import { easeOut, fadeUp, stagger } from '../utils/motion';
import { supabase } from '../lib/supabase';
import { findPreCannedMatch, formatPreCannedResponse } from '../data/preCannedQuestions';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  followUps?: string[];
  loading?: boolean;
}

interface HeroIntroProps {
  onOpenQuotesModal: () => void;
}

/**
 * Normalizes text so that:
 * 1. Headings (Overview, Guidance Questions, Current Rates, Pros, Cons) are converted to markdown h3 headings.
 * 2. Isolated bullet points (•) on their own lines are stripped.
 * 3. Rates text stays clean and inline without extra bullet splits.
 * 4. Standard bullet points (•) in lists start on their own lines.
 */
function formatChatResponse(text: string): string {
  if (!text) return '';

  return text
    .replace(/\r\n/g, '\n')
    // Convert section titles to markdown h3 headings
    .replace(/(^|\n)\*?\*?(Overview|Guidance Questions|Current Rates|Pros|Cons)\*?\*?:?/g, '\n\n### $2\n')
    // Strip orphaned bullet points sitting on their own line
    .replace(/\n\s*[•\-\*]\s*\n/g, '\n')
    // Ensure every single bullet point starts on a brand-new line
    .replace(/(?:^|\s+)[•\-\*]\s+/g, '\n\n• ')
    .trim();
}

export function HeroIntro({ onOpenQuotesModal }: HeroIntroProps) {
  const reduced = useReducedMotion() ?? false;
  const { ask: startBidding, arena, reset: resetBidding } = useBidding();
  const busy = arena.run !== null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeDispatchRef = useRef<string | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    const doScroll = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end',
        });
      }
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };

    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 80);
    setTimeout(doScroll, 180);
  }, []);

  const handleReset = useCallback(() => {
    setMessages([]);
    activeDispatchRef.current = null;
    if (resetBidding) {
      resetBidding();
    }
  }, [resetBidding]);

  // Listen to logo click event to clear state
  useEffect(() => {
    const onReset = () => handleReset();
    window.addEventListener('reset-safe-chat', onReset);
    return () => window.removeEventListener('reset-safe-chat', onReset);
  }, [handleReset]);

  const handleSendMessage = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || activeDispatchRef.current === trimmed) return;
    activeDispatchRef.current = trimmed;

    startBidding(trimmed);

    const match = findPreCannedMatch(trimmed);

    if (match) {
      const botReply = formatPreCannedResponse(match) || match.answer;
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: trimmed },
          {
            role: 'assistant',
            content: botReply,
            followUps: match.followUpChips || match.followUpQuestions || []
          }
        ]);
        activeDispatchRef.current = null;
        scrollToBottom();
      }, 350);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: trimmed },
      { role: 'assistant', content: '', loading: true }
    ]);
    scrollToBottom();

    try {
      const { data, error } = await supabase.functions.invoke('safebot-chat', {
        body: { message: trimmed }
      });

      if (error || !data) {
        throw error || new Error('No reply from AI');
      }

      const replyText = data.reply || data.content || (typeof data === 'string' ? data : '');
      const dynamicFollowUps = data.followUps || [];

      setMessages((prev) => {
        const clean = prev.filter((m) => !m.loading);
        return [
          ...clean,
          {
            role: 'assistant',
            content: replyText,
            followUps: dynamicFollowUps
          }
        ];
      });
      scrollToBottom();
    } catch {
      setMessages((prev) => {
        const clean = prev.filter((m) => !m.loading);
        return [
          ...clean,
          {
            role: 'assistant',
            content:
              'Safe Methods provides transparent financial guidance and lets top Canadian institutions bid for your business. Please explore our posted rates on the right or book a direct consultation with one of our verified advisors.',
            followUps: ['Best mortgage rate?', 'Best GIC rates?', 'Smart way to borrow money?']
          }
        ];
      });
      scrollToBottom();
    } finally {
      activeDispatchRef.current = null;
    }
  }, [startBidding, scrollToBottom]);

  const ask = useAskInput(reduced, handleSendMessage);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const showChat = messages.length > 0 && !busy;
  const showIntro = messages.length === 0;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative z-20 flex h-full flex-col justify-between rounded-[24px] border border-[#E3DCCD] bg-[#FBF9F4] p-3 sm:p-4 shadow-sm overflow-hidden"
    >
      {/* 1. Initial Hero State (6 Question Cards) */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div
            key="intro"
            variants={stagger}
            initial={busy ? 'hidden' : 'show'}
            animate="show"
            exit={{ opacity: 0 }}
            aria-hidden={busy}
            className={`flex flex-1 min-h-0 flex-col justify-between transition-[filter,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              busy ? 'pointer-events-none opacity-20 blur-[6px]' : ''
            }`}
          >
            <div className="text-center pt-0.5 shrink-0">
              <motion.h2
                variants={fadeUp}
                className="mx-auto font-serif font-semibold text-forest leading-[1.25] tracking-[-0.02em] [text-wrap:balance]"
              >
                <span
                  className="block text-forest"
                  style={{ fontSize: 'clamp(18px, 1.8vw, 23px)' }}
                >
                  Only{' '}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.26, delay: 0.3, ease: easeOut }}
                    className="inline-block rounded-lg bg-forest px-1.5 pb-0.5 text-gold"
                  >
                    1&nbsp;in&nbsp;4
                  </motion.span>{' '}
                  Canadians turn to a financial&nbsp;advisor.<SourceMarker />
                </span>
                <span
                  className="mt-1 block font-serif font-semibold text-gold-dark"
                  style={{ fontSize: 'clamp(18px, 1.8vw, 23px)' }}
                >
                  We're changing that.
                </span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mx-auto mt-1 max-w-[480px] text-[12.5px] leading-relaxed text-[#5B6660]"
              >
                Experts from top financial firms bid for you.
              </motion.p>
            </div>

            <div className="my-auto py-1 shrink-0">
              <SuggestionGrid onPick={ask.autoType} disabled={busy} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Bidding Arena Overlay */}
      <BiddingArena />

      {/* 3. Multi-Turn Conversation Stream */}
      <AnimatePresence mode="wait">
        {showChat && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="relative flex flex-1 min-h-0 flex-col overflow-hidden pb-1"
          >
            {/* Scrollable chat thread */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2"
            >
              {messages.map((msg, idx) => {
                const isLatest = idx === messages.length - 1;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`w-full flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* User Question Chip */}
                    {msg.role === 'user' ? (
                      <div className="inline-flex max-w-[85%] items-center gap-1.5 rounded-full border border-forest/15 bg-white px-3.5 py-1 text-xs font-medium text-forest shadow-xs my-0.5">
                        <SearchIcon className="h-3 w-3 shrink-0 text-forest/70" aria-hidden="true" />
                        <span className="truncate">{msg.content}</span>
                      </div>
                    ) : msg.loading ? (
                      <div className="flex items-center gap-2 py-2 text-[12.5px] text-[#5B6660]">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-forest/30 border-t-forest" />
                        <span>SafeBot is analyzing your question…</span>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-1.5">
                        {/* 
                          Fix: Removed block-level span from strong, handled headings via h3.
                          Rates and bullets now render cleanly on a single row without orphaned dots.
                        */}
                        <div className="w-full bg-transparent p-0 text-[13px] leading-snug text-ink">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="chat-markdown space-y-1 text-[13px] leading-snug text-ink"
                            components={{
                              h3: ({ node, ...props }) => (
                                <h3 className="font-bold text-forest text-[13.5px] mt-1.5 mb-0.5" {...props} />
                              ),
                              strong: ({ node, ...props }) => (
                                <strong className="font-bold text-forest text-[13px]" {...props} />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="my-0.5 text-[13px] leading-snug text-ink" {...props} />
                              ),
                            }}
                          >
                            {formatChatResponse(msg.content)}
                          </ReactMarkdown>
                        </div>

                        {/* 
                          Single-line CTA Row:
                          - Left (2): "Your best options are on the right ->"
                          - Center (3): "[Get Quotes]" button
                          - Right (4): "Get free, no-obligation quotes in your inbox"
                        */}
                        {isLatest && (
                          <div className="w-full my-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 py-1 text-xs">
                            {/* 2. Left Side */}
                            <div className="flex-1 text-left shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const target = document.getElementById('rates-heading');
                                  target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                }}
                                className="group inline-flex items-center gap-1 font-serif text-[12px] font-semibold text-[#0B3D2E] hover:underline whitespace-nowrap"
                              >
                                <span>Your best options are on the right</span>
                                <ArrowRightIcon className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                              </button>
                            </div>

                            {/* 3. Center Button */}
                            <div className="shrink-0 flex justify-center">
                              <button
                                type="button"
                                onClick={onOpenQuotesModal}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B3D2E] px-3.5 py-1.5 text-[11.5px] font-semibold text-white transition-colors hover:bg-[#124E3B] shadow-xs active:scale-[0.98] whitespace-nowrap"
                              >
                                <FileTextIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                <span>Get Quotes</span>
                              </button>
                            </div>

                            {/* 4. Right Side */}
                            <div className="flex-1 text-right shrink-0">
                              <p className="text-[11.5px] text-[#5B6660] whitespace-nowrap">
                                Get <span className="font-semibold text-[#0B3D2E]">free</span>, no-obligation quotes in your inbox
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Contextual Follow-up Chips */}
                        {isLatest && msg.followUps && msg.followUps.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {msg.followUps.map((chip, chipIdx) => (
                              <button
                                key={chipIdx}
                                onClick={() => handleSendMessage(chip)}
                                className="rounded-full border border-[#E3DCCD] bg-white px-2.5 py-1 text-[11px] font-medium text-forest transition-colors hover:border-forest hover:bg-gold-light/40"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} className="h-px w-full" aria-hidden="true" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input Bar */}
      <motion.div variants={fadeUp} className="mt-auto pt-1 shrink-0 border-0">
        <AskInput
          value={ask.value}
          status={ask.status}
          submitted={ask.submitted}
          inputRef={ask.inputRef}
          disabled={busy}
          onChange={ask.onChange}
          onSubmit={ask.submit}
        />
      </motion.div>
    </motion.div>
  );
}