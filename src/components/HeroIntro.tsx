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

interface HeroIntroProps {
  onOpenQuotesModal: () => void;
}

export function HeroIntro({ onOpenQuotesModal }: HeroIntroProps) {
  const reduced = useReducedMotion() ?? false;
  const { ask: startBidding, arena, cachedAnswer, chatReply, followUps } = useBidding();
  const ask = useAskInput(reduced, startBidding);
  const busy = arena.run !== null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback((question: string) => {
    setPendingQuery(question);
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
  }, []);

  useEffect(() => {
    if (ask.submitted && ask.submitted.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== ask.submitted) {
        handleSubmit(ask.submitted);
      }
    }
  }, [ask.submitted, handleSubmit, messages]);

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

  useEffect(() => {
    if (!busy && pendingQuery) {
      const answer = cachedAnswer ?? chatReply ?? null;
      if (answer) {
        setMessages((prev) => {
          const withoutLoading = prev.filter((m) => !m.loading);
          return [...withoutLoading, { role: 'assistant', content: answer, followUps }];
        });
        setPendingQuery(null);
      } else if (cachedAnswer === null && chatReply === null) {
        const hasLoading = messages.some((m) => m.loading);
        if (!hasLoading) {
          setMessages((prev) => [...prev, { role: 'assistant', content: '', loading: true }]);
        }
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

  useEffect(() => {
    if (chatReply && pendingQuery === null && messages.some((m) => m.loading)) {
      setMessages((prev) => prev.map((m) =>
        m.loading
          ? { role: 'assistant', content: chatReply, followUps }
          : m
      ));
    }
  }, [chatReply, followUps, pendingQuery, messages]);

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
      className="relative z-10 flex h-full flex-col rounded-[28px] border border-[#E3DCCD] bg-[#FBF9F4] px-5 pb-5 pt-6 sm:px-6 sm:pt-7">

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
            className={`flex flex-1 flex-col justify-between transition-[filter,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
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
                  style={{ fontSize: 'clamp(34px, 3.6vw, 48px)' }}>
                  We're changing that.
                </span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mx-auto mt-1 max-w-[500px] text-[14px] leading-relaxed text-[#5B6660]">
                Experts from top financial firms bid for you.
              </motion.p>
            </div>
            <div className="my-auto py-2">
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
            className="flex flex-1 flex-col overflow-hidden">

            {/* Header with New Topic button */}
            <div className="mb-2 flex items-center justify-between border-b border-[#E3DCCD] pb-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6660]">SafeBot Guidance</p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[12.5px] font-semibold text-[#0B3D2E] transition-colors hover:bg-[#EDE6D8]">
                <RotateCcwIcon className="h-3 w-3" aria-hidden="true" />
                New Topic
              </button>
            </div>

            {/* Conversation stream with clamped height */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-[clamp(220px,32vh,310px)] pr-2 flex flex-col gap-3">
              {messages.map((msg, idx) => {
                const isLatest = idx === messages.length - 1;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: easeOut }}
                    className={msg.role === 'user' ? 'flex justify-end' : 'flex flex-col items-start gap-2.5'}>
                    {msg.role === 'user' ? (
                      <div className="inline-flex max-w-[85%] items-center gap-2 rounded-full border border-forest/15 bg-white px-3.5 py-1.5 text-sm font-medium text-forest shadow-sm">
                        <SearchIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{msg.content}</span>
                      </div>
                    ) : msg.loading ? (
                      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-[#E3DCCD] bg-white px-4 py-3">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-forest/30 border-t-forest" />
                        <span className="text-[13px] text-[#5B6660]">SafeBot is analyzing your question…</span>
                      </div>
                    ) : (
                      <>
                        <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-[#E3DCCD] bg-white px-4 py-3">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="chat-markdown text-[13px] leading-relaxed text-ink">
                            {msg.content}
                          </ReactMarkdown>
                        </div>

                        {/* In-chat Get Competing Quotes callout — rendered ONLY on the latest assistant response */}
                        {isLatest && (
                          <div className="w-full rounded-2xl border border-[#C9A227]/40 bg-[#FAF6EC] p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                            <div>
                              <p className="text-[12.5px] font-semibold text-[#0B3D2E]">Want real offers from top Canadian institutions?</p>
                              <p className="text-[11px] text-[#5B6660]">Make banks compete with no obligation and compare side-by-side.</p>
                            </div>
                            <button
                              type="button"
                              onClick={onOpenQuotesModal}
                              className="whitespace-nowrap rounded-xl bg-[#0B3D2E] px-3.5 py-2 text-xs font-semibold text-[#F3E7BF] hover:bg-[#145440] transition-colors shrink-0">
                              Get Competing Quotes →
                            </button>
                          </div>
                        )}

                        {/* Follow-up chips — rendered ONLY on the latest assistant response */}
                        {isLatest && msg.followUps && msg.followUps.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {msg.followUps.map((chip, chipIdx) => (
                              <button
                                key={chipIdx}
                                onClick={() => handleFollowUp(chip)}
                                className="rounded-full border border-[#E3DCCD] bg-white px-3 py-1 text-[12px] font-medium text-forest transition-colors hover:border-forest hover:bg-gold-light/40">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AskInput — always pinned at bottom */}
      <motion.div variants={fadeUp} className="mt-auto border-t border-[#E3DCCD] pt-2.5">
        <AskInput
          value={ask.value}
          status={ask.status}
          submitted={ask.submitted}
          inputRef={ask.inputRef}
          disabled={busy}
          onChange={ask.onChange}
          onSubmit={ask.submit} />
      </motion.div>
    </motion.div>
  );
}