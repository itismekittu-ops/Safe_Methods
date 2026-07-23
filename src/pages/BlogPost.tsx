import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
export function BlogPost() {
  return (
    <main>
      <article>
        {/* Hero Image */}
        <div className="w-full h-[380px] md:h-[480px] bg-muted">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            alt="Looking up at a modern corporate skyscraper with clear blue sky"
            className="w-full h-full object-cover" />
          
        </div>

        {/* Article Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Main Content Column */}
            <div className="lg:col-span-8">
              {/* Article Header */}
              <header className="mb-12">
                <Badge variant="accent" className="mb-6">
                  Wealth Preservation
                </Badge>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-8">
                  Navigating Generational Wealth Transfer in Uncertain Markets
                </h1>

                <div className="flex items-center gap-4 border-y border-border-subtle py-6">
                  <Avatar
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop"
                    name="Arthur Pendelton"
                    size="md" />
                  
                  <div>
                    <div className="font-medium text-foreground">
                      Arthur Pendelton
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      Senior Advisory Partner • October 12, 2023
                    </div>
                  </div>
                </div>
              </header>

              {/* Article Body */}
              <div className="prose-custom max-w-[65ch] text-foreground font-body text-lg leading-relaxed space-y-8">
                <p>
                  The transfer of wealth from one generation to the next is
                  rarely a simple transaction. It is a profound transition that
                  requires meticulous planning, emotional intelligence, and a
                  deep understanding of both market dynamics and family
                  governance. In today's volatile economic climate, the stakes
                  are higher, and the margins for error are significantly
                  narrower.
                </p>
                <p>
                  Historically, families have relied on traditional trust
                  structures and standard portfolio diversification to weather
                  economic storms. However, as we face unprecedented shifts in
                  global monetary policy and emerging asset classes, a more
                  dynamic approach is required. The preservation of capital must
                  be balanced with strategic growth initiatives that align with
                  the family's long-term vision.
                </p>

                <h2 className="font-heading text-3xl text-foreground mt-16 mb-6">
                  The Role of Family Governance
                </h2>
                <p>
                  Beyond the financial mechanics, successful wealth transfer
                  hinges on robust family governance. Establishing clear
                  communication channels and shared values ensures that the
                  succeeding generation is not only financially prepared but
                  also emotionally equipped to manage the responsibilities of
                  significant wealth.
                </p>

                <blockquote className="border-l-[3px] border-accent pl-6 md:pl-8 py-2 my-12">
                  <p className="font-heading text-2xl md:text-3xl text-primary italic leading-snug m-0">
                    "True wealth preservation is not merely about shielding
                    assets from taxation; it is about preparing the next
                    generation to be responsible stewards of the family legacy."
                  </p>
                </blockquote>

                <p>
                  We advise our clients to initiate these conversations early.
                  By integrating the next generation into philanthropic
                  endeavors or smaller investment decisions, families can foster
                  a sense of stewardship and financial acumen. This gradual
                  immersion demystifies the complexities of wealth management
                  and builds confidence.
                </p>
                <p>
                  Ultimately, the goal is to create a resilient framework that
                  can adapt to both external market shocks and internal family
                  dynamics. At Safe Methods, we believe that discretion,
                  precision, and a long-term perspective are the cornerstones of
                  enduring wealth.
                </p>
              </div>
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4">
              <div className="sticky top-32">
                <Card className="p-8 bg-surface border border-border-subtle shadow-soft">
                  <h3 className="font-heading text-2xl text-foreground mb-4">
                    Related Service
                  </h3>
                  <div className="mb-6">
                    <a
                      href="#"
                      className="text-lg font-medium text-primary hover:text-accent transition-colors flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-accent rounded-sm w-fit">
                      
                      Estate Planning & Trusts
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                    Comprehensive structuring to ensure your assets are
                    protected and transferred according to your exact wishes,
                    minimizing tax liabilities and securing your family's
                    future.
                  </p>
                  <Button variant="primary" className="w-full justify-center">
                    Book a Consultation
                  </Button>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Related Articles Section */}
      <section className="bg-surface border-t border-border-subtle py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-foreground">
              Related Articles
            </h2>
            <a
              href="#"
              className="hidden md:flex items-center gap-2 text-primary hover:text-accent font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-sm">
              
              View all insights <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="flex flex-col h-full overflow-hidden border border-border-subtle bg-background hover:shadow-raised transition-shadow duration-300">
              <div className="h-48 w-full bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
                  alt="Luxurious estate exterior"
                  className="w-full h-full object-cover" />
                
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <Badge variant="neutral">Real Estate</Badge>
                </div>
                <h3 className="font-heading text-xl text-foreground mb-3 leading-snug">
                  <a
                    href="#"
                    className="hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-sm">
                    
                    Assessing Prime Real Estate in a High-Rate Environment
                  </a>
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
                  An analysis of luxury property markets and how high-net-worth
                  individuals are adjusting their real estate portfolios to
                  hedge against inflation.
                </p>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-auto">
                  September 28, 2023
                </div>
              </div>
            </Card>

            {/* Card 2 */}
            <Card className="flex flex-col h-full overflow-hidden border border-border-subtle bg-background hover:shadow-raised transition-shadow duration-300">
              <div className="h-48 w-full bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32d7?q=80&w=1632&auto=format&fit=crop"
                  alt="Professional reviewing documents at a desk"
                  className="w-full h-full object-cover" />
                
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <Badge variant="neutral">Tax Strategy</Badge>
                </div>
                <h3 className="font-heading text-xl text-foreground mb-3 leading-snug">
                  <a
                    href="#"
                    className="hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-sm">
                    
                    Year-End Tax Optimization Strategies for 2023
                  </a>
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
                  Essential tax planning maneuvers to consider before the close
                  of the fiscal year, focusing on philanthropic giving and loss
                  harvesting.
                </p>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-auto">
                  September 15, 2023
                </div>
              </div>
            </Card>

            {/* Card 3 */}
            <Card className="flex flex-col h-full overflow-hidden border border-border-subtle bg-background hover:shadow-raised transition-shadow duration-300">
              <div className="h-48 w-full bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop"
                  alt="Executive boardroom table"
                  className="w-full h-full object-cover" />
                
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <Badge variant="neutral">Philanthropy</Badge>
                </div>
                <h3 className="font-heading text-xl text-foreground mb-3 leading-snug">
                  <a
                    href="#"
                    className="hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-sm">
                    
                    Structuring Charitable Foundations for Maximum Impact
                  </a>
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
                  How to establish and govern a private foundation that aligns
                  with your family's values while providing significant societal
                  benefit.
                </p>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-auto">
                  August 30, 2023
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 md:hidden text-center">
            <Button variant="secondary" className="w-full justify-center">
              View all insights
            </Button>
          </div>
        </div>
      </section>
    </main>);

}