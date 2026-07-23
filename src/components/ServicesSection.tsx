import React from 'react';
import { Link } from 'react-router-dom';
import {
  WalletIcon,
  CreditCardIcon,
  TrendingUpIcon,
  PiggyBankIcon,
  ArrowRightIcon } from
'lucide-react';
import { Card } from './Card';
const services = [
{
  title: 'Personal Budgeting',
  description:
  'Establish clear spending habits and build a sustainable financial foundation.',
  icon: WalletIcon
},
{
  title: 'Debt Management',
  description:
  'Strategic planning to consolidate, reduce, and eliminate outstanding liabilities.',
  icon: CreditCardIcon
},
{
  title: 'Investment Planning',
  description:
  'Tailored portfolio strategies designed for long-term, steady growth.',
  icon: TrendingUpIcon
},
{
  title: 'Retirement Planning',
  description:
  'Secure your future with comprehensive wealth preservation techniques.',
  icon: PiggyBankIcon
}];

export function ServicesSection() {
  return (
    <section id="services" className="container mx-auto px-4 py-16 md:py-24">
      <div className="mb-12 md:mb-16">
        <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
          Our Services
        </h2>
        <div className="w-16 h-px bg-accent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, idx) =>
        <Card
          key={idx}
          className="p-6 flex flex-col h-full bg-surface border border-border-subtle hover:border-border transition-colors">
          
            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center mb-6">
              <service.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
              {service.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed flex-grow mb-6">
              {service.description}
            </p>
            <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors mt-auto group">
            
              Learn more
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>
        )}
      </div>
    </section>);

}