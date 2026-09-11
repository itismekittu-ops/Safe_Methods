import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './Card';
import { Badge } from './Badge';
const posts = [
{
  title: '5 Steps to Build an Emergency Fund',
  description:
  'A practical approach to securing a financial safety net without compromising your current lifestyle.',
  category: 'Saving',
  image:
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=600&h=400'
},
{
  title: 'How to Improve Your Credit Score Fast',
  description:
  'Actionable strategies to optimize your credit utilization and resolve outstanding discrepancies.',
  category: 'Credit',
  image:
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600&h=400'
},
{
  title: 'Investing 101 for Beginners',
  description:
  'Demystifying the markets: foundational principles for building a resilient investment portfolio.',
  category: 'Investing',
  image:
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600&h=400'
}];

export function BlogSection() {
  return (
    <section id="blog" className="container mx-auto px-4 py-16 md:py-24">
      <div className="mb-12 md:mb-16 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
            Latest Insights
          </h2>
          <div className="w-16 h-px bg-accent"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post, idx) =>
        <Card
          key={idx}
          className="overflow-hidden flex flex-col bg-surface border border-border-subtle">
          
            <div className="aspect-[3/2] w-full overflow-hidden bg-muted">
              <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="mb-4">
                <Badge variant="accent">{post.category}</Badge>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3 leading-snug">
                {post.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
                {post.description}
              </p>
              <Link
              to="/blog"
              className="text-sm font-medium text-primary hover:text-accent transition-colors mt-auto">
              
                Read More
              </Link>
            </div>
          </Card>
        )}
      </div>
    </section>);

}