"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Award } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSessions, Session, SessionStats } from "@/lib/sessionStorage"

interface DashboardProps {
    onStartNew: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
        const data = props.payload[0].payload;
        return (
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <p className="font-semibold">{data.formattedDate}</p>
                <p className={`text-sm ${data.sentiment === 'Remorseful' ? 'text-emerald-600' : data.sentiment === 'Defensive' ? 'text-rose-600' : 'text-amber-600'}`}>
                    {data.sentiment}: {props.payload[0].value}/100
                </p>
            </div>
        );
    }
    return null;
};

export default function Dashboard({ onStartNew }: DashboardProps) {
    const [sessions, setSessions] = useState<Session[]>([])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSessions(getSessions());
    }, []);

    const stats = useMemo((): SessionStats | null => {
        if (sessions.length === 0) return null;

        const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
        const averageScore = Math.round(totalScore / sessions.length);

        const sentimentBreakdown = sessions.reduce(
            (acc, s) => {
                const sentiment = s.sentiment.toLowerCase() as 'remorseful' | 'defensive' | 'neutral';
                acc[sentiment]++;
                return acc;
            },
            { remorseful: 0, defensive: 0, neutral: 0 }
        );

        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        let trendPercentage = 0;

        if (sessions.length >= 6) {
            const recentSessions = sessions.slice(-3);
            const previousSessions = sessions.slice(-6, -3);

            const recentAvg = recentSessions.reduce((sum, s) => sum + s.score, 0) / 3;
            const previousAvg = previousSessions.reduce((sum, s) => sum + s.score, 0) / 3;

            const diff = recentAvg - previousAvg;
            trendPercentage =
                previousAvg !== 0
                    ? Math.round((diff / previousAvg) * 100)
                    : 0;

                if (trendPercentage > 5) trend = 'improving';
                else if (trendPercentage < -5) trend = 'declining';
                else trend = 'stable';
        }

        return {
            totalSessions: sessions.length,
            averageScore,
            sentimentBreakdown,
            trend,
            trendPercentage,
        };
    }, [sessions]);

    const chartData = sessions.map((session, index) => ({
        session: index + 1,
        score: session.score,
        sentiment: session.sentiment,
        timestamp: session.timestamp,
        formattedDate: session.timestamp && !isNaN(Date.parse(session.timestamp))
            ? new Date(session.timestamp).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
        })
        : "Date unavailable"
}))

    

    const getTrendIcon = () => {
        if (!stats) return null
        switch (stats.trend) {
            case 'improving':
                return <TrendingUp className="w-5 h-5 text-emerald-500" />
            case 'declining':
                return <TrendingDown className="w-5 h-5 text-rose-500" />
            default:
                return <Minus className="w-5 h-5 text-amber-500" />
        }
    }

    const getTrendColor = () => {
        if (!stats) return 'text-slate-600'
        switch (stats.trend) {
            case 'improving':
                return 'text-emerald-600 dark:text-emerald-400'
            case 'declining':
                return 'text-rose-600 dark:text-rose-400'
            default:
                return 'text-amber-600 dark:text-amber-400'
        }
    }

    if (!stats || sessions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <CardTitle>No Sessions Yet</CardTitle>
                        <CardDescription>
                            Complete your first reflection to see your progress dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={onStartNew} className="bg-indigo-600 hover:bg-indigo-700">
                            Start First Reflection
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50">
                            Your Progress
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Track your empathy growth journey
                        </p>
                    </div>
                    <Button onClick={onStartNew} variant="outline">
                        Start New Reflection
                    </Button>
                </motion.header>

                {/* Stats Overview */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Total Sessions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {stats.totalSessions}
                                </p>
                            </CardContent>
                        </Card>
                    

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-2">
                                    <Award className="w-4 h-4" />
                                    Average Score
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {stats.averageScore}/100
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Most Common
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                    {stats.sentimentBreakdown.remorseful >= stats.sentimentBreakdown.defensive ? 'Remorseful' : 'Defensive'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-2">
                                    {getTrendIcon()}
                                    Trend
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className={`text-xl font-bold capitalize ${getTrendColor()}`}>
                                    {stats.trend}
                                    {stats.trendPercentage > 0 && ` ${stats.trendPercentage}%`}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Progress Chart */}
                {chartData.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Empathy Score Over Time</CardTitle>
                                <CardDescription>Your progress across all reflection sessions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full h-[300px] md:h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                            <XAxis
                                                dataKey="session"
                                                label={{ value: 'Session #', position: 'insideBottom', offset: -5 }}
                                                className="text-xs"
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                label={{ value: 'Empathy Score', angle: -90, position: 'insideLeft', offset: 10 }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#6366f1"
                                                strokeWidth={3}
                                                dot={{ fill: '#6366f1', r: 6 }}
                                                activeDot={{ r: 8 }}
                                                isAnimationActive={true}
                                                animationDuration={1000}
                                                animationEasing="ease-in-out"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* 👇 BUTTON SECTION */}

                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => window.open("http://localhost:8000/download-report")}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition"
                    >
                        Download PDF Report
                    </button>
                </div>

                {/* Session History */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Sessions</CardTitle>
                            <CardDescription>Your last {Math.min(sessions.length, 10)} reflections</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {sessions.slice(-10).reverse().map((session, index) => (
                                    <div
                                        key={session.id || index}
                                        className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-md">
                                                {session.scenario}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {session.timestamp && !isNaN(Date.parse(session.timestamp))
                                                    ? new Date(session.timestamp).toLocaleString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })
                                                    : "Date unavailable"}
                                                
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${session.sentiment === 'Remorseful'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                                                : session.sentiment === 'Defensive'
                                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                                }`}>
                                                {session.sentiment}
                                            </span>
                                            <span className="text-lg font-bold text-slate-700 dark:text-slate-300 min-w-[60px] text-right">
                                                {session.score}/100
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Insight Card */}
                {stats.trend !== 'stable' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <Card className={`border-l-4 ${stats.trend === 'improving'
                            ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                            : 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-900/10'
                            }`}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {getTrendIcon()}
                                    Growth Insight
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 dark:text-slate-300">
                                    {stats.trend === 'improving'
                                        ? `Great progress! Your empathy scores have improved by ${stats.trendPercentage}% over your recent sessions. Keep reflecting and growing! 🌱`
                                        : `Your scores have declined by ${stats.trendPercentage}% recently. Consider taking time to truly reflect on the victim's perspective. You've got this! 💪`
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
