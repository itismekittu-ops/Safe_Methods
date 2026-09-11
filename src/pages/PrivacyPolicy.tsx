import React from 'react';
import { SEO } from '../components/SEO';

export function PrivacyPolicy() {
  return (
    <main>
      <SEO
        title="Privacy Policy"
        description="Safe Methods Privacy Policy — how we collect, use, and protect your personal information when you visit safemethods.com."
        path="/privacy-policy"
      />
      <section className="bg-primary text-primary-foreground py-20 md:py-28 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-heading text-4xl md:text-6xl mb-6 text-surface">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed font-light">
            Last updated: August 2026
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="prose prose-lg text-foreground max-w-none space-y-6">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Safe Methods ("we," "us," or "our") operates the website
            safemethods.com (the "Site"). This Privacy Policy explains how we
            collect, use, and protect your personal information when you visit
            or interact with our Site.
          </p>

          <h2 className="font-heading text-3xl text-primary border-b border-subtle pb-4 mt-12">
            1. Information We Collect
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Information you provide to us:</strong>
            <br />
            When you use our Contact form, we collect your name and email address
            (required), and may collect additional information you choose to
            provide, such as a phone number or message details (optional).
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Information collected automatically:</strong>
            <br />
            We may use cookies and similar technologies, and third-party
            analytics tools such as Google Analytics, to understand how visitors
            use our Site. This may include information such as your IP address,
            browser type, device information, and pages visited.
          </p>

          <h2 className="font-heading text-3xl text-primary border-b border-subtle pb-4 mt-12">
            2. How We Use Your Information
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            We use the information we collect to:
          </p>
          <ul className="space-y-3 text-lg text-muted-foreground list-disc pl-6">
            <li>Respond to your inquiries submitted through our Contact form</li>
            <li>Improve our Site and services</li>
            <li>Understand how visitors interact with our Site through analytics</li>
            <li>Communicate with you about our services, where applicable</li>
          </ul>

          <h2 className="font-heading text-3xl text-primary border-b border-subtle pb-4 mt-12">
            3. Sharing of Information
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            We do not sell your personal information to third parties. We may
            share information with service providers who help us operate our
            Site (such as hosting or email service providers), solely for the
            purpose of providing our services to you.
          </p>

          <h2 className="font-heading text-3xl text-primary border-b border-subtle pb-4 mt-12">
            4. Cookies
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Our Site may use cookies to enhance your experience and, where
            applicable, to gather analytics data. You can control or disable
            cookies through your browser settings, though this may affect Site
            functionality.
          </p>

          <h2 className="font-heading text-3xl text-primary border-b border-subtle pb-4 mt-12">
            5. Data Retention
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            We retain personal information only as long as necessary to fulfill
            the purposes outlined in this policy, unless a longer retention
            period is required by law.
          </p>

          <h2 className="font-heading text-3xl text-primary border-b border-subtle pb-4 mt-12">
            6. Your Rights
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            If you are a resident of Canada, you have rights under applicable
            privacy legislation, including the right to access, correct, or
            request deletion of your personal information. To exercise these
            rights, contact us using the information below.
          </p>

          <h2 className="font-heading text-3xl text-primary border-b border-subtle pb-4 mt-12">
            7. Third-Party Links
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Our Site may contain links to third-party websites. We are not
            responsible for the privacy practices of those sites and encourage
            you to review their privacy policies.
          </p>

          <h2 className="font-heading text-3xl text-primary border-b border-subtle pb-4 mt-12">
            8. Changes to This Policy
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated "Last updated" date.
          </p>

          <h2 className="font-heading text-3xl text-primary border-b border-subtle pb-4 mt-12">
            9. Contact Us
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            If you have questions about this Privacy Policy, please contact us
            at:
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Email:</strong>{' '}
            <a href="mailto:info@safemethods.org" className="text-accent hover:text-primary transition-colors">
              info@safemethods.org
            </a>
            <br />
            <strong className="text-foreground">Location:</strong> Mississauga,
            Ontario, Canada
          </p>
        </div>
      </section>
    </main>
  );
}
