import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SearchIcon, RotateCcwIcon, FileTextIcon, ArrowRightIcon } from 'lucide-react';
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

export function HeroIntro({ onOpenQuotesModal }: HeroIntroProps) {
  const reduced = useReducedMotion() ?? false;
  const { ask: startBidding, arena } = useBidding();
  const busy = arena.run !== null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeDispatchRef = useRef<string | null>(null);

  // Smooth scroll pinned strictly to the bottom of the conversation
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

    // Staggered execution ensures ReactMarkdown DOM calculation is complete
    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 80);
    setTimeout(doScroll, 180);
  }, []);

  const handleSendMessage = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || activeDispatchRef.current === trimmed) return;
    activeDispatchRef.current = trimmed;

    // Trigger Bidding Arena duel animation
    startBidding(trimmed);

    // 1. Synchronously resolve pre-canned cache
    const match = findPreCannedMatch(trimmed);

    if (match) {
      const botReply = formatPreCannedResponse(match) || match.answer;
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
      return;
    }

    // 2. Novel query -> Dispatch to Supabase Edge Function
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

  const handleReset = () => {
    setMessages([]);
    activeDispatchRef.current = null;
  };

  const showChat = messages.length > 0 && !busy;
  const showIntro = messages.length === 0;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative z-20 flex h-full flex-col justify-between rounded-[28px] border border-[#E3DCCD] bg-[#FBF9F4] p-3.5 sm:p-5 shadow-sm overflow-hidden"
    >
      {/* 1. Initial Hero State (Headline + 6 Suggestion Cards) */}
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
            <div className="text-center pt-1 shrink-0">
              <motion.h2
                variants={fadeUp}
                className="mx-auto font-serif font-semibold text-forest"
              >
                <span
                  className="relative inline-block leading-[1.25] tracking-[-0.02em] [text-wrap:balance]"
                  style={{ fontSize: 'clamp(18px, 1.8vw, 24px)' }}
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
                  className="mt-0.5 block font-normal italic leading-[1.05] tracking-[-0.02em] text-gold-dark"
                  style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}
                >
                  We're changing that.
                </span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mx-auto mt-0.5 max-w-[480px] text-[13px] leading-relaxed text-[#5B6660]"
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
            {/* Header: New Topic positioned in top right */}
            <div className="flex items-center justify-end pb-1 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-6 shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-semibold text-[#0B3D2E] transition-colors hover:bg-[#EDE6D8]"
              >
                <RotateCcwIcon className="h-3 w-3" aria-hidden="true" />
                New Topic
              </button>
            </div>

            {/* Scrollable Message Thread */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto pr-1.5 flex flex-col gap-2.5"
            >
              {messages.map((msg, idx) => {
                const isLatest = idx === messages.length - 1;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: easeOut }}
                    className={
                      msg.role === 'user'
                        ? 'flex justify-end'
                        : 'flex flex-col items-start gap-2'
                    }
                  >
                    {msg.role === 'user' ? (
                      <div className="inline-flex max-w-[85%] items-center gap-2 rounded-full border border-forest/15 bg-white px-3.5 py-1.5 text-xs font-medium text-forest shadow-sm">
                        <SearchIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{msg.content}</span>
                      </div>
                    ) : msg.loading ? (
                      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-[#E3DCCD] bg-white px-4 py-3">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-forest/30 border-t-forest" />
                        <span className="text-[12.5px] text-[#5B6660]">
                          SafeBot is analyzing your question…
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-full max-w-[96%] rounded-2xl rounded-tl-sm border border-[#E3DCCD] bg-white px-3.5 py-2.5 shadow-sm">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="chat-markdown text-[12.5px] leading-relaxed text-ink space-y-1.5"
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>

                        {/* Centered In-chat Quote Banner (Magic Patterns reference) */}
                        {isLatest && (
                          <div className="w-full max-w-[96%] mx-auto my-1 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#D8CEBA] bg-[#FAF7F0] px-4 py-2 text-center shadow-xs">
                            <button
                              type="button"
                              onClick={() => {
                                const target = document.getElementById('rates-heading');
                                target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                              }}
                              className="group inline-flex items-center gap-1.5 font-serif text-[12.5px] font-semibold text-[#0B3D2E] hover:underline"
                            >
                              <span>Your best options are on the right</span>
                              <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                            </button>
                            <p className="text-[11px] font-medium text-[#5B6660]">
                              Get <span className="font-semibold text-[#0B3D2E]">free</span>, no-obligation quotes in your inbox
                            </p>
                            <button
                              type="button"
                              onClick={onOpenQuotesModal}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B3D2E] px-3.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#124E3B]"
                            >
                              <FileTextIcon className="h-3.5 w-3.5" aria-hidden="true" />
                              Get Quotes
                            </button>
                          </div>
                        )}

                        {/* Follow-up chips: strictly on latest response */}
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
                      </>
                    )}
                  </motion.div>
                );
              })}
              {/* Dedicated bottom anchor element */}
              <div ref={messagesEndRef} className="h-px w-full" aria-hidden="true" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Pinned AskInput Bar */}
      <motion.div variants={fadeUp} className="mt-auto border-t border-[#E3DCCD] pt-2 shrink-0">
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