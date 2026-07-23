import React from 'react';
import { Button } from '../components/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter } from
'../components/Card';
import { CheckIcon, ArrowRightIcon } from 'lucide-react';
export function ServiceDetail() {
  return (
    <main>
      {/* Banner Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28 px-4 md:px-8 relative overflow-hidden">
        {/* Subtle decorative background element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-heading text-4xl md:text-6xl mb-6 text-surface">
            Debt Management
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Strategic restructuring and optimization of liabilities to preserve
            liquidity and enhance your overall net worth.
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="!border-accent !text-[#F7F3EA] hover:!bg-accent hover:!text-accent-foreground">
            
            Book a Consultation
          </Button>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
        {/* Left Column (Wider) */}
        <div className="lg:col-span-8 space-y-16">
          <div className="prose prose-lg text-foreground max-w-none">
            <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
              At Safe Methods, we view debt not merely as an obligation, but as
              a strategic tool when managed with precision. Our Debt Management
              advisory service is designed for high-net-worth individuals and
              families seeking to optimize their liability structures, reduce
              unnecessary interest burdens, and free up capital for
              wealth-generating opportunities.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              We take a holistic approach, analyzing your entire balance sheet
              to ensure your liabilities are aligned with your long-term
              financial objectives. Whether it involves consolidating
              high-interest facilities, renegotiating terms, or leveraging
              assets for strategic borrowing, our discreet advisors provide
              tailored, actionable solutions.
            </p>
          </div>

          <div className="space-y-8">
            <h2 className="font-heading text-3xl text-primary border-b border-subtle pb-4">
              What's Included
            </h2>
            <ul className="space-y-6">
              {[
              'Comprehensive liability audit and balance sheet analysis.',
              'Strategic restructuring of existing credit facilities and mortgages.',
              'Negotiation of favorable terms with premium lending institutions.',
              'Liquidity optimization to ensure capital is deployed efficiently.',
              'Ongoing monitoring and adjustment of debt strategies as markets evolve.'].
              map((item, idx) =>
              <li key={idx} className="flex items-start gap-4">
                  <div className="mt-1 bg-surface border border-accent rounded-full p-1 flex-shrink-0">
                    <CheckIcon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-lg text-foreground leading-relaxed">
                    {item}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Column (Narrower, Sticky) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28">
            <Card floating className="border-t-4 border-t-accent">
              <CardHeader>
                <CardTitle className="text-2xl text-primary font-heading">
                  Get Started
                </CardTitle>
              </CardHeader>
              <CardBody>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Take control of your liabilities. Schedule a discreet,
                  complimentary consultation with one of our senior advisors to
                  discuss your unique financial landscape.
                </p>
              </CardBody>
              <CardFooter>
                <Button
                  variant="primary"
                  className="w-full group flex justify-center items-center">
                  
                  Book a Consultation
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Articles Section */}
      <section className="bg-surface py-20 md:py-28 border-t border-subtle">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-heading text-3xl text-primary">
              Related Insights
            </h2>
            <a
              href="#"
              className="hidden md:flex items-center text-sm font-medium text-accent hover:text-primary transition-colors">
              
              View all insights <ArrowRightIcon className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
            {
              title: 'The Strategic Use of Leverage in Wealth Building',
              excerpt:
              'Understanding how high-net-worth individuals use debt as a tool for asset acquisition and tax efficiency.',
              date: 'October 12, 2023'
            },
            {
              title: 'Navigating Interest Rate Volatility',
              excerpt:
              'Strategies for protecting your portfolio and optimizing your liabilities in a shifting rate environment.',
              date: 'September 28, 2023'
            },
            {
              title: 'Consolidating Complex Credit Facilities',
              excerpt:
              'A case study on streamlining multiple lending relationships to reduce costs and improve liquidity.',
              date: 'August 15, 2023'
            }].
            map((article, idx) =>
            <Card
              key={idx}
              className="h-full flex flex-col hover:shadow-raised transition-shadow cursor-pointer group">
              
                <CardBody className="flex-grow">
                  <p className="text-xs text-accent font-medium mb-3 uppercase tracking-wider">
                    {article.date}
                  </p>
                  <h3 className="font-heading text-xl text-primary mb-4 leading-snug group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {article.excerpt}
                  </p>
                </CardBody>
                <CardFooter className="pt-0 border-t-0">
                  <div className="text-sm font-medium text-primary flex items-center group-hover:text-accent transition-colors">
                    Read Article{' '}
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="ghost" className="text-accent">
              View all insights
            </Button>
          </div>
        </div>
      </section>
    </main>);

}