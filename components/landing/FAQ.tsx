"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const FAQ_ITEMS = [
    {
        question: "Is it free to start?",
        answer: "Yes! You get 50,000 free Phở Points immediately to generate images and videos. No credit card required to start explore your creativity."
    },
    {
        question: "Can I use the videos commercially?",
        answer: "Absolutely. You own 100% of the rights to your creations on Pro plans. For free tier users, we request attribution to Phở Video."
    },
    {
        question: "How long does generation take?",
        answer: "Fast! Most videos are ready in 60-90 seconds using our high-performance cloud GPUs. Image generation is near-instant."
    }
]

function FAQItem({ question, answer, isOpen, onClick }: {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}) {
    return (
        <div className="mb-4">
            <button
                onClick={onClick}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group
                    ${isOpen
                        ? "bg-white/10 border-primary/50 glow-vermilion-sm"
                        : "bg-white/5 border-white/10 hover:border-white/20"}`}
            >
                <span className={`text-lg font-medium transition-colors ${isOpen ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                    {question}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-white/40 transition-transform duration-500 ${isOpen ? "rotate-180 text-primary" : ""}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 text-white/60 font-light leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section id="faq" className="py-24 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-3xl mx-auto px-6 relative z-10">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white/90 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-white/40 font-light">
                        Everything you need to know about Phở Video.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {FAQ_ITEMS.map((item, index) => (
                        <FAQItem
                            key={index}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
