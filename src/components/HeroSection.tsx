import React, { useEffect, useState, useRef } from 'react';
import { SendIcon, BuildingIcon, CheckIcon } from 'lucide-react';
import { Card } from './Card';
const SUGGESTIONS = [
{
  category: 'Lending/Credit',
  question: 'How do I get the best mortgage rate?'
},
{
  category: 'Mutual Funds/Stocks',
  question: 'How do I start investing in mutual funds?'
},
{
  category: 'Debt Management',
  question: 'How do I consolidate my debt effectively?'
},
{
  category: 'Personal Budgeting',
  question: 'How do I create a monthly budget?'
},
{
  category: 'Finance',
  question: 'How do I file my taxes correctly?'
},
{
  category: 'Investment Planning',
  question: 'Should I pay off debt or invest first?'
}];

const BANKS = ['Meridian', 'Apex', 'Evergreen', 'Northbank', 'Summit'];
const WINNING_BANK_INDEX = 2;
export function HeroSection() {
  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'bot';
      content: string;
    }>>(
    []);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSend = (text: string) => {
    if (!text.trim()) return;
    // Add user message
    const newMessages = [
    ...messages,
    {
      role: 'user' as const,
      content: text
    }];

    setMessages(newMessages);
    setInputValue('');
    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
      ...prev,
      {
        role: 'bot',
        content:
        'Based on your inquiry, I have analyzed our network of top financial firms. Here are the best matches that can help you with comparable rates and expert advice.'
      }]
      );
    }, 1000);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };
  const isEmpty = messages.length === 0;
  return (
    <section className="container mx-auto px-4 py-12 md:py-20 lg:py-24 min-h-[80vh] flex flex-col">
      {isEmpty ?
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center mt-4 md:mt-8 flex-grow">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground mb-6">
            Comparable Financial Advice.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-2xl">
            We bring financial experts from top big firms so you can compare &
            choose the best product or interest rate.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12 text-left">
            {SUGGESTIONS.map((item, idx) =>
          <button
            key={idx}
            onClick={() => handleSend(item.question)}
            className="bg-surface border border-border-subtle hover:border-border transition-colors p-5 rounded-2xl flex flex-col gap-2 text-left group shadow-sm hover:shadow-soft">
            
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                  {item.category}
                </span>
                <span className="text-foreground font-medium">
                  {item.question}
                </span>
              </button>
          )}
          </div>

          {/* Input Area for Empty State */}
          <div className="w-full max-w-3xl mt-auto pt-4">
            <div className="relative flex items-center">
              <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your financial goals..."
              className="w-full pl-6 pr-14 py-4 bg-surface border border-border-subtle text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-soft"
              style={{
                borderRadius: '9999px'
              }} />
            
              <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim()}
              className="absolute right-2 w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              style={{
                borderRadius: '9999px'
              }}
              aria-label="Send message">
              
                <SendIcon className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              SafeBot can make mistakes. Consider verifying important
              information.
            </p>
          </div>
        </div> :

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full flex-grow">
          {/* Left Column: Chat */}
          <div className="lg:col-span-2 flex flex-col bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-soft h-[600px]">
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
              {messages.map((msg, idx) =>
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
                  <div
                className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
            )}
              <div ref={messagesEndRef} />
            </div>

            {/* Follow-up chips */}
            {messages.length > 1 &&
          <div className="px-6 pb-3 flex flex-wrap gap-2">
                <button
              onClick={() => handleSend('What are their fees?')}
              className="text-xs px-4 py-1.5 border border-border-subtle bg-background hover:bg-muted text-foreground transition-colors"
              style={{
                borderRadius: '9999px'
              }}>
              
                  What are their fees?
                </button>
                <button
              onClick={() => handleSend('Can I schedule a call?')}
              className="text-xs px-4 py-1.5 border border-border-subtle bg-background hover:bg-muted text-foreground transition-colors"
              style={{
                borderRadius: '9999px'
              }}>
              
                  Can I schedule a call?
                </button>
                <button
              onClick={() => handleSend('Compare interest rates')}
              className="text-xs px-4 py-1.5 border border-border-subtle bg-background hover:bg-muted text-foreground transition-colors"
              style={{
                borderRadius: '9999px'
              }}>
              
                  Compare interest rates
                </button>
              </div>
          }

            {/* Input Area for Active State */}
            <div className="p-4 bg-surface border-t border-border-subtle">
              <div className="relative flex items-center">
                <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a follow-up question..."
                className="w-full pl-6 pr-14 py-3 bg-background border border-border-subtle text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                style={{
                  borderRadius: '9999px'
                }} />
              
                <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim()}
                className="absolute right-1.5 w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                style={{
                  borderRadius: '9999px'
                }}
                aria-label="Send message">
                
                  <SendIcon className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3">
                SafeBot can make mistakes. Consider verifying important
                information.
              </p>
            </div>
          </div>

          {/* Right Column: Top Matches */}
          <div className="lg:col-span-1 flex flex-col">
            <h3 className="font-heading text-2xl text-foreground mb-6">
              Top Matches
            </h3>

            {/* Top panel: Best Bank Match */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Best Bank Match
              </p>
              <div className="flex items-center justify-between gap-2">
                {BANKS.map((bank, idx) => {
                const isWinner = idx === WINNING_BANK_INDEX;
                return (
                  <div
                    key={bank}
                    className={`relative w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-surface ${isWinner ? 'border-2 border-accent shadow-soft' : 'border border-border-subtle opacity-70'}`}
                    title={bank}>
                    
                      <BuildingIcon
                      className={`w-5 h-5 ${isWinner ? 'text-primary' : 'text-muted-foreground'}`} />
                    
                      {isWinner &&
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                          <CheckIcon className="w-3 h-3" />
                        </span>
                    }
                    </div>);

              })}
              </div>
              <Card className="p-4 bg-surface border border-border-subtle flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-primary shrink-0">
                  <BuildingIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {BANKS[WINNING_BANK_INDEX]} Bank
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Lowest comparable interest rate with flexible terms — the
                    strongest match for your goals.
                  </p>
                </div>
              </Card>
            </div>

            {/* Gold hairline divider */}
            <div className="border-t border-border my-6" />

            {/* Bottom panel: Recommended Consultant */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recommended Consultant
              </p>
              <Card className="p-5 bg-surface border border-border-subtle flex flex-col items-center text-center gap-3">
                <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&h=160&q=80"
                alt="Sarah Mitchell, Senior Financial Advisor"
                className="w-16 h-16 rounded-full object-cover border border-border-subtle" />
              
                <div>
                  <h4 className="font-semibold text-foreground">
                    Sarah Mitchell
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Senior Financial Advisor
                  </p>
                </div>
                <button className="w-full py-2.5 rounded-md bg-accent text-primary font-semibold text-sm hover:bg-accent/90 transition-colors">
                  Book a call
                </button>
              </Card>
            </div>
          </div>
        </div>
      }
    </section>);

}