import React, { useEffect, useState } from 'react';
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

interface ChatState {
  query: string;
  answer: string;
  followUps: string[];
  loading: boolean;
}

export function HeroIntro() {
  const reduced = useReducedMotion() ?? false;
  const { ask: startBidding, arena, cachedAnswer, chatReply, followUps } = useBidding();
  const ask = useAskInput(reduced, startBidding);
  const busy = arena.run !== null;

  const [chat, setChat] = useState<ChatState | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  // Track which question triggered the current arena run
  const arenaDone = !busy && arena.phase === 'intro';

  // When a query is submitted, capture it for chat state
  useEffect(() => {
    if (ask.submitted && ask.submitted !== lastQuery) {
      setLastQuery(ask.submitted);
      setChat({ query: ask.submitted, answer: '', followUps: [], loading: true });
    }
  }, [ask.submitted, lastQuery]);

  // Also handle auto-typed suggestions (they call startBidding directly, not submit)
  // We detect this by watching when arena.run starts and chat hasn't been set yet
  useEffect(() => {
    if (busy && arena.run && !chat) {
      setChat({ query: arena.run.question, answer: '', followUps: [], loading: true });
    }
  }, [busy, arena.run, chat]);

  // When arena finishes, populate the answer
  useEffect(() => {
    if (!busy && chat && chat.loading) {
      const answer = cachedAnswer ?? chatReply ?? null;
      if (answer) {
        setChat((c) => c ? { ...c, answer, followUps, loading: false } : c);
      } else if (cachedAnswer === null && chatReply === null) {
        // Neither cache nor LLM responded yet — keep loading if we haven't timed out
        // Give the LLM a short grace period after arena ends
        const timeout = setTimeout(() => {
          setChat((c) => {
            if (c && c.loading) {
              return { ...c, answer: 'I\u2019m experiencing a temporary issue. Please try asking again.', loading: false };
            }
            return c;
          });
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [busy, chat, cachedAnswer, chatReply, followUps]);

  // Update answer if LLM reply arrives after cache
  useEffect(() => {
    if (chat && !chat.loading && chatReply && chat.answer === '' && cachedAnswer === null) {
      setChat((c) => c ? { ...c, answer: chatReply, loading: false } : c);
    }
    if (chat && chatReply && cachedAnswer === null && chat.loading) {
      setChat((c) => c ? { ...c, answer: chatReply, followUps, loading: false } : c);
    }
  }, [chatReply, cachedAnswer, chat]);

  const handleReset = () => {
    setChat(null);
    setLastQuery(null);
  };

  const handleFollowUp = (question: string) => {
    setLastQuery(question);
    setChat({ query: question, answer: '', followUps: [], loading: true });
    ask.autoType(question);
  };

  const showChat = chat !== null && !busy;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative z-10 flex h-full flex-col rounded-[28px] border border-line bg-cream-card px-6 pb-6 pt-8">
      
      {/* Intro / Suggestion Grid view — hidden when chat is showing or arena is busy */}
      <AnimatePresence mode="wait">
        {!showChat && (
          <motion.div
            key="intro"
            variants={stagger}
            initial={busy ? 'hidden' : 'show'}
            animate="show"
            exit={{ opacity: 0 }}
            aria-hidden={busy}
            className={`flex flex-1 flex-col transition-[filter,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            busy ? 'pointer-events-none opacity-20 blur-[6px]' : ''}`}
            >
            
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

              <motion.p variants={fadeUp} className="mx-auto mt-1 max-w-[520px] text-[15px] leading-relaxed text-muted">
                Experts from top financial firms bid for you.
              </motion.p>
            </div>

            <div className="flex flex-1 items-center" style={{ paddingTop: 0, paddingBottom: 'clamp(12px, calc(0.6vh + 10px), 26px)' }}>
              <SuggestionGrid onPick={ask.autoType} disabled={busy} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arena overlay — always mounted so AnimatePresence works */}
      <BiddingArena />

      {/* Chat Response Panel — shown after arena concludes */}
      <AnimatePresence mode="wait">
        {showChat && chat && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="flex flex-1 flex-col">
            
            {/* User question chip */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-forest/15 bg-white px-3.5 py-1.5 text-sm font-medium text-forest shadow-sm">
                <SearchIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{chat.query}</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-muted transition-colors hover:text-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40">
                
                <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
                New Question
              </button>
            </div>

            {/* Answer area */}
            <div className="mt-3 flex-1 overflow-y-auto">
              {chat.loading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-forest/30 border-t-forest" />
                  <span>SafeBot is analyzing your question…</span>
                </div>
              ) : chat.answer ? (
                <div className="rounded-2xl border border-line bg-white px-4 py-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="chat-markdown text-[13px] leading-relaxed text-ink">
                    {chat.answer}
                  </ReactMarkdown>
                </div>
              ) : null}

              {/* Follow-up chips */}
              {!chat.loading && chat.followUps.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {chat.followUps.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleFollowUp(chip)}
                      className="rounded-full border border-line bg-cream px-3 py-1 text-[12px] font-medium text-forest transition-colors hover:bg-gold-light">
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AskInput — always at bottom */}
      <motion.div variants={fadeUp} className="mt-auto border-t border-line pt-[18px]">
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
