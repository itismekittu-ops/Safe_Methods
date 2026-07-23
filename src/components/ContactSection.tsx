import React, { useState } from "react";
import { MailIcon, PhoneIcon, MapPinIcon, ClockIcon, CheckCircleIcon } from "lucide-react";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";
import { Select } from "./Select";
import { Button } from "./Button";
import { supabase } from "../lib/supabase";

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase.from("leads").insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        source: "contact_form",
      });

      if (insertError) throw insertError;

      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setError("Something went wrong sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section
        id="contact"
        className="container mx-auto px-4 py-16 md:py-24 bg-surface border-t border-border-subtle"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
            Message Sent
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Thank you for reaching out. One of our advisors will respond within 24 hours.
          </p>
          <Button variant="secondary" onClick={() => setSubmitted(false)}>
            Send Another Message
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contact"
      className="container mx-auto px-4 py-16 md:py-24 bg-surface border-t border-border-subtle"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Left Column */}
        <div>
          <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-4 block">
            Get in Touch
          </span>
          <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-8">
            We're here to help you navigate your wealth.
          </h2>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <MailIcon className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Email</p>
                <a href="mailto:info@safemethods.org" className="text-muted-foreground hover:text-primary transition-colors">
                  info@safemethods.org
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <PhoneIcon className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Phone</p>
                <a href="tel:+18888417755" className="text-muted-foreground hover:text-primary transition-colors">
                  +1 888-841-7755
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPinIcon className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Office</p>
                <p className="text-muted-foreground">Mississauga, Ontario, Canada</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <ClockIcon className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Response Time</p>
                <p className="text-muted-foreground">Within 24 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-background p-8 rounded-lg border border-border-subtle shadow-soft">
          <h3 className="font-heading text-2xl text-foreground mb-6">Send us a message</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <TextInput
              label="Name"
              placeholder="Jane Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="jane@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Phone</label>
              <div className="flex gap-2">
                <div className="w-1/3">
                  <Select aria-label="Country Code">
                    <option value="+1">+1 (US/CA)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+91">+91 (IN)</option>
                  </Select>
                </div>
                <div className="w-2/3">
                  <TextInput
                    type="tel"
                    placeholder="888-841-7755"
                    aria-label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <TextArea
              label="Message"
              placeholder="How can we assist you?"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-4 py-3">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
