import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SearchIcon, RotateCcwIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AskInput } from './AskInput';
import { SuggestionGrid } from './SuggestionGrid';
import { BiddingArena } from './arena/BiddingArena';
import { SourceMarker } from './SourceMarker';
import { useAskInput } from '../hooks/useAskInput';
import { useBidding } from '../contexts/BiddingContext';
import { easeOut, fadeUp, stagger } from '../utils/motion';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  followUps?: string[];
  loading?: boolean;
}

export function HeroIntro() {
  const reduced = useReducedMotion() ?? false;
  const { ask: startBidding, arena, cachedAnswer, chatReply, followUps } = useBidding();
  const ask = useAskInput(reduced, startBidding);
  const busy = arena.run !== null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // When a question is submitted (typed or auto-typed), set up a pending user message
  // The arena plays, and when it finishes we attach the answer.
  const handleSubmit = useCallback((question: string) => {
    setPendingQuery(question);
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
  }, []);

  // Detect when a new question was asked via AskInput submit
  useEffect(() => {
    if (ask.submitted && ask.submitted.length > 0) {
      // Check if this is a new submission (not already in messages)
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== ask.submitted) {
        handleSubmit(ask.submitted);
      }
    }
  }, [ask.submitted, handleSubmit, messages]);

  // Detect when arena starts from auto-typed suggestion (no ask.submitted)
  useEffect(() => {
    if (busy && arena.run) {
      const question = arena.run.question;
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== question) {
        setPendingQuery(question);
        setMessages((prev) => [...prev, { role: 'user', content: question }]);
      }
    }
  }, [busy, arena.run, messages]);

  // When arena finishes and we have a pending query, attach the answer
  useEffect(() => {
    if (!busy && pendingQuery) {
      const answer = cachedAnswer ?? chatReply ?? null;
      if (answer) {
        setMessages((prev) => {
          // Replace any existing loading assistant message, or append
          const withoutLoading = prev.filter((m) => !m.loading);
          return [...withoutLoading, { role: 'assistant', content: answer, followUps }];
        });
        setPendingQuery(null);
      } else if (cachedAnswer === null && chatReply === null) {
        // Show loading message while waiting for LLM
        const hasLoading = messages.some((m) => m.loading);
        if (!hasLoading) {
          setMessages((prev) => [...prev, { role: 'assistant', content: '', loading: true }]);
        }
        // Timeout fallback
        const timeout = setTimeout(() => {
          setMessages((prev) => {
            const loading = prev.find((m) => m.loading);
            if (loading) {
              return prev.map((m) => m.loading
                ? { role: 'assistant', content: 'I\u2019m experiencing a temporary issue connecting to my knowledge base. Please try asking again.', followUps: [] }
                : m);
            }
            return prev;
          });
          setPendingQuery(null);
        }, 5000);
        return () => clearTimeout(timeout);
      }
    }
  }, [busy, pendingQuery, cachedAnswer, chatReply, followUps, messages]);

  // Update loading message when LLM reply arrives
  useEffect(() => {
    if (chatReply && pendingQuery === null && messages.some((m) => m.loading)) {
      setMessages((prev) => prev.map((m) =>
        m.loading
          ? { role: 'assistant', content: chatReply, followUps }
          : m
      ));
    }
  }, [chatReply, followUps, pendingQuery, messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleReset = () => {
    setMessages([]);
    setPendingQuery(null);
  };

  const handleFollowUp = (question: string) => {
    startBidding(question);
    handleSubmit(question);
  };

  const showChat = messages.length > 0 && !busy;
  const showIntro = messages.length === 0;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative z-10 flex h-full flex-col rounded-[28px] border border-line bg-cream-card px-6 pb-6 pt-8">

      {/* Intro / Suggestion Grid view */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div
            key="intro"
            variants={stagger}
            initial={busy ? 'hidden' : 'show'}
            animate="show"
            exit={{ opacity: 0 }}
            aria-hidden={busy}
            className={`flex flex-1 flex-col transition-[filter,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            busy ? 'pointer-events-none opacity-20 blur-[6px]' : ''}`}>
            <div className="text-center">
              <motion.h2
                variants={fadeUp}
                className="mx-auto font-serif font-semibold text-forest">
                <span
                  className="relative inline-block leading-[1.25] tracking-[-0.02em] [text-wrap:balance]"
                  style={{ fontSize: 'clamp(19px, 1.9vw, 26px)' }}>
                  Only{' '}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.26, delay: 0.3, ease: easeOut }}
                    className="inline-block rounded-lg bg-forest px-1.5 pb-0.5 text-gold">
                    1&nbsp;in&nbsp;4
                  </motion.span>{' '}
                  Canadians turn to a financial&nbsp;advisor.<SourceMarker />
                </span>
                <span
                  className="mt-1 block font-normal italic leading-[1.05] tracking-[-0.02em] text-gold-dark"
                  style={{ fontSize: 'clamp(36px, 3.8vw, 52px)' }}>
                  We're changing that.
                </span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mx-auto mt-1 max-w-[520px] text-[15px] leading-relaxed text-[#5B6660]">
                Experts from top financial firms bid for you.
              </motion.p>
            </div>
            <div className="flex flex-1 items-center" style={{ paddingTop: 0, paddingBottom: 'clamp(12px, calc(0.6vh + 10px), 26px)' }}>
              <SuggestionGrid onPick={ask.autoType} disabled={busy} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arena overlay */}
      <BiddingArena />

      {/* Multi-turn chat conversation */}
      <AnimatePresence mode="wait">
        {showChat && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="flex flex-1 flex-col">

            {/* Reset button */}
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-[#5B6660] transition-colors hover:text-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40">
                <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
                New Topic
              </button>
            </div>

            {/* Conversation stream */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-[460px] space-y-3 pr-2">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  {msg.role === 'user' ? (
                    <div className="inline-flex max-w-[85%] items-center gap-2 rounded-full border border-forest/15 bg-white px-3.5 py-1.5 text-sm font-medium text-forest shadow-sm">
                      <SearchIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{msg.content}</span>
                    </div>
                  ) : msg.loading ? (
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-line bg-white px-4 py-3">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-forest/30 border-t-forest" />
                      <span className="text-[13px] text-[#5B6660]">SafeBot is analyzing your question…</span>
                    </div>
                  ) : (
                    <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-line bg-white px-4 py-3">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="chat-markdown text-[13px] leading-relaxed text-ink">
                        {msg.content}
                      </ReactMarkdown>
                      {msg.followUps && msg.followUps.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {msg.followUps.map((chip, chipIdx) => (
                            <button
                              key={chipIdx}
                              onClick={() => handleFollowUp(chip)}
                              className="rounded-full border border-line bg-cream px-3 py-1 text-[12px] font-medium text-forest transition-colors hover:bg-gold-light">
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AskInput — always at bottom */}
      <motion.div variants={fadeUp} className="mt-auto border-t border-[#E3DCCD] pt-3">
        <AskInput
          value={ask.value}
          status={ask.status}
          submitted={ask.submitted}
          inputRef={ask.inputRef}
          disabled={busy}
          onChange={ask.onChange}
          onSubmit={ask.submit} />
      </motion.div>
    </motion.div>);
}
