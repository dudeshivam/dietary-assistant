import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import type React from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How quickly can I get my personalized plan?",
    answer:
      "Most users can complete setup and receive their first AI-generated plan in under two minutes.",
  },
  {
    question: "Do I need to follow a strict meal template?",
    answer:
      "No. The assistant adapts to your dietary preference and routine, then adjusts recommendations as your progress changes.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel at any time from your account with no long-term contract.",
  },
  {
    question: "Is this beginner-friendly?",
    answer:
      "Absolutely. The product is designed for complete beginners with clear daily instructions, reminders, and progress tracking.",
  },
];

function FAQRow({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border/60 rounded-2xl bg-card/60 backdrop-blur-sm">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
        data-ocid={`faq.item.${index + 1}`}
      >
        <span className="font-medium text-foreground">{item.question}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      {isOpen && (
        <div
          id={`faq-panel-${index}`}
          className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed"
        >
          {item.answer}
        </div>
      )}
    </div>
  );
}

export function FAQ() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="faq"
      data-ocid="faq.section"
      className="py-24 bg-background"
      aria-labelledby="faq-headline"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-10 animate-on-scroll ${isVisible ? "in-view" : ""}`}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-5">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden />
            FAQ
          </span>
          <h2
            id="faq-headline"
            className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-4"
          >
            Answers Before You Start
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to know before creating your account.
          </p>
        </div>

        <div className="space-y-3" data-ocid="faq.list">
          {FAQ_ITEMS.map((item, index) => (
            <FAQRow
              key={item.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex((prevIndex) => (prevIndex === index ? -1 : index))
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
