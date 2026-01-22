"use client"

import { motion } from "framer-motion"
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Play, Sparkles } from "lucide-react"
import Link from "next/link"

export function FinalCTA() {
    return (
        <section className="py-32 relative overflow-hidden">
            {/* Aurora Gradient Background */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
                <motion.div
                    className="w-[600px] h-[600px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(240,66,28,0.2) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)",
                        filter: "blur(100px)",
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <div className="max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-8">
                        Ready to direct your <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F0421C] to-purple-500">
                            masterpiece?
                        </span>
                    </h2>

                    <p className="text-xl text-white/60 font-light max-w-2xl mx-auto mb-12">
                        Join thousands of creators turning their dreams into cinematic reality. Start creating for free today.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <SignedOut>
                            <SignUpButton mode="modal">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-[#F0421C] hover:bg-orange-600 text-white px-12 py-8 text-xl rounded-2xl shadow-[0_0_40px_rgba(240,66,28,0.4)] transition-all duration-500 font-semibold group border-t border-white/20"
                                >
                                    <Play className="mr-3 w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                                    Start Creating for Free
                                </Button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/studio" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full bg-[#F0421C] hover:bg-orange-600 text-white px-12 py-8 text-xl rounded-2xl shadow-[0_0_40px_rgba(240,66,28,0.4)] transition-all duration-500 font-semibold group border-t border-white/20"
                                >
                                    <Sparkles className="mr-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
                                    Go to Studio
                                </Button>
                            </Link>
                        </SignedIn>
                    </div>
                </motion.div>
            </div>

            {/* Fine accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </section>
    )
}
