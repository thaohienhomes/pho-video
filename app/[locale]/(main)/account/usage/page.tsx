"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
    Loader2, Zap, Gift, Users, Flame, Image as ImageIcon, Play as VideoIcon,
    Sparkles, RotateCcw, ArrowUpRight, ArrowDownLeft, Coins,
    Calendar, Info, AlertTriangle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatPhoPoints } from "@/lib/pho-points"
import { cn } from "@/lib/utils"

interface Transaction {
    id: string
    amount: number
    balanceAfter: number
    transactionType: string
    description: string | null
    metadata: any
    createdAt: string
}

interface Stats {
    balance: number
    lifetimeEarned: number
    lifetimeSpent: number
    tier: string
    status: string
}

export default function UsagePage() {
    const t = useTranslations("account.usage")
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const [statsRes, transRes] = await Promise.all([
                    fetch("/api/pho-points/balance"),
                    fetch("/api/pho-points/transactions")
                ])

                if (!statsRes.ok || !transRes.ok) {
                    throw new Error("Failed to fetch data")
                }

                const statsData = await statsRes.json()
                const transData = await transRes.json()

                setStats(statsData)
                setTransactions(transData.transactions || [])
            } catch (error) {
                console.error("Error fetching usage data:", error)
                setError("Could not load your history. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const getTransactionIcon = (type: string, amount: number) => {
        const isPositive = amount > 0
        const iconClass = isPositive ? "text-green-400" : "text-[#F0421C]"

        switch (type) {
            case 'subscription_grant': return <Zap className={cn("w-4 h-4", iconClass)} />
            case 'bonus_signup':
            case 'bonus_referral':
            case 'bonus_streak':
            case 'bonus_birthday':
            case 'bonus_first_purchase': return <Gift className={cn("w-4 h-4", iconClass)} />
            case 'spend_image': return <ImageIcon className={cn("w-4 h-4", iconClass)} />
            case 'spend_video':
            case 'spend_i2v': return <VideoIcon className={cn("w-4 h-4", iconClass)} />
            case 'spend_upscale': return <Sparkles className={cn("w-4 h-4", iconClass)} />
            case 'refund': return <RotateCcw className={cn("w-4 h-4", iconClass)} />
            default: return isPositive ? <ArrowUpRight className={cn("w-4 h-4", iconClass)} /> : <ArrowDownLeft className={cn("w-4 h-4", iconClass)} />
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(new Date(dateString))
        } catch (e) {
            return dateString
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-[#F0421C] animate-spin mb-4" />
                    <div className="absolute inset-0 bg-[#F0421C]/20 blur-xl rounded-full" />
                </div>
                <p className="text-white/40 animate-pulse font-medium">Crunching your usage data...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-red-500/5 border border-red-500/10 rounded-3xl">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Oops!</h3>
                <p className="text-white/60 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-bold"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                        {t("title")}
                    </h1>
                    <p className="text-white/50 mt-1 font-medium italic">
                        {t("subtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-[#F0421C]/10 border border-[#F0421C]/20 rounded-2xl shadow-[0_0_20px_rgba(240,66,28,0.1)]">
                    <Coins className="w-4 h-4 text-[#F0421C]" />
                    <span className="text-sm font-black text-white whitespace-nowrap">
                        {formatPhoPoints(stats?.balance || 0)} <span className="text-[#F0421C]/80 ml-1">PTS</span>
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: t("balance"), value: stats?.balance, icon: <Zap className="w-5 h-5 text-yellow-400" /> },
                    { label: t("lifetime_earned"), value: stats?.lifetimeEarned, icon: <ArrowUpRight className="w-5 h-5 text-green-400" /> },
                    { label: t("lifetime_spent"), value: stats?.lifetimeSpent, icon: <ArrowDownLeft className="w-5 h-5 text-[#F0421C]" /> },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md relative overflow-hidden group hover:border-[#F0421C]/30 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            {stat.icon}
                        </div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <div className="text-3xl font-black text-white tracking-tight">
                            {formatPhoPoints(stat.value || 0)}
                        </div>
                        <div className="mt-2 text-[9px] text-white/20 font-medium">TOTAL SINCE JOINING</div>
                    </motion.div>
                ))}
            </div>

            {/* Transactions Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
                        <Calendar className="w-5 h-5 text-[#F0421C]" />
                        {t("history_title")}
                    </h2>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                        Last 50 Events
                    </span>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
                    <div className="divide-y divide-white/[0.03]">
                        {transactions.length > 0 ? (
                            transactions.map((tx, i) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03, duration: 0.4 }}
                                    className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105",
                                            tx.amount > 0
                                                ? "bg-green-500/5 border-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.05)]"
                                                : "bg-[#F0421C]/5 border-[#F0421C]/10 shadow-[0_0_15px_rgba(240,66,28,0.05)]"
                                        )}>
                                            {getTransactionIcon(tx.transactionType, tx.amount)}
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-black text-white group-hover:text-[#F0421C] transition-colors">
                                                {t(`transaction_types.${tx.transactionType}`)}
                                            </div>
                                            <div className="text-[10px] text-white/30 font-bold tracking-tighter mt-0.5">
                                                {formatDate(tx.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={cn(
                                            "text-base font-black tracking-tight",
                                            tx.amount > 0 ? "text-green-400" : "text-white"
                                        )}>
                                            {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                                        </div>
                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                            <div className="w-1 h-1 rounded-full bg-[#F0421C]/40" />
                                            <div className="text-[9px] text-white/20 font-black uppercase tracking-widest">
                                                {formatPhoPoints(tx.balanceAfter)} PTS
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-24 text-center">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                    <Info className="w-8 h-8 text-white/10" />
                                </div>
                                <p className="text-white/40 font-bold italic text-sm tracking-tight">{t("empty")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <p className="text-[10px] text-white/20 text-center font-medium italic">
                Transactions are processed in real-time. For billing inquiries, contact support.
            </p>
        </div>
    )
}
