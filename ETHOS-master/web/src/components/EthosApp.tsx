
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { Brain, Heart, Scale, Sparkles, AlertCircle, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Dashboard from "@/components/Dashboard"
import { saveSession } from "@/lib/sessionStorage"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EthosApp() {
    const router = useRouter()

    const handleLogout = () => {
    localStorage.removeItem("auth");
    router.push("/login");
};

useEffect(() => {
  const auth = localStorage.getItem("auth")
  if (!auth) {
    router.push("/login")
  }
}, [])
    const [view, setView] = useState<'main' | 'dashboard'>('main')
    const [scenario, setScenario] = useState("")
    const [narrative, setNarrative] = useState("")
    const [reflection, setReflection] = useState("")
    const [analysis, setAnalysis] = useState<{
        sentiment: string
        score: number
        source: string
        explanation?: string[]
    } | null>(null)
    const [loadingNarrative, setLoadingNarrative] = useState(false)
    const [loadingAnalysis, setLoadingAnalysis] = useState(false)
    const [step, setStep] = useState(1)

    const generateNarrative = async () => {
        if (!scenario.trim()) return
        setLoadingNarrative(true)
        try {
            const response = await axios.post("http://localhost:8000/generate-narrative", {
                scenario,
            })
            setNarrative(response.data.narrative)
            setStep(2)
        } catch (error) {
            console.error("Error generating narrative:", error)
            // Ideally show a toast or error message here
        } finally {
            setLoadingNarrative(false)
        }
    }

    const analyzeReflection = async () => {
        if (!reflection.trim()) return
        setLoadingAnalysis(true)
        try {
            const response = await axios.post("http://localhost:8000/analyze-reflection", {
                reflection,
            })
            setAnalysis(response.data)

            // Save session to localStorage
            saveSession({
                id: Date.now().toString(),
                scenario: scenario,          // NOT text
                sentiment: response.data.sentiment,  // NOT emotion
                score: Number(response.data.score),
                timestamp: new Date().toISOString(), // NOT date
            })

            setStep(3)
        } catch (error) {
            console.error("Error analyzing reflection:", error)
        } finally {
            setLoadingAnalysis(false)
        }
    }

    const resetApp = () => {
        setScenario("")
        setNarrative("")
        setReflection("")
        setAnalysis(null)
        setStep(1)
    }

    // Handle view switching
    if (view === 'dashboard') {
        return <Dashboard onStartNew={() => { resetApp(); setView('main'); }} />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="flex justify-end absolute top-4 right-6">
                    <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
        Logout
    </button>
    </div>
                <header className="mb-8 text-center space-y-2">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-center gap-3"
                    >
                        <Scale className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                            Ethos
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-lg text-slate-600 dark:text-slate-400"
                    >
                        AI-Assisted Moral Reflection System
                    </motion.p>
                </header>

                <main className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-indigo-100 dark:border-indigo-900 shadow-xl dark:bg-slate-900/50 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                                            <Brain className="w-5 h-5" />
                                            1. The Scenario
                                        </CardTitle>
                                        <CardDescription>
                                            Describe a situation where you might have acted unethically or caused harm.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            placeholder="e.g., I shouted at my colleague because they made a mistake..."
                                            className="min-h-[150px] text-lg resize-none focus-visible:ring-indigo-500"
                                            value={scenario}
                                            onChange={(e) => setScenario(e.target.value)}
                                        />
                                    </CardContent>
                                    <CardFooter className="justify-end">
                                        <Button
                                            onClick={generateNarrative}
                                            disabled={!scenario.trim() || loadingNarrative}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                                        >
                                            {loadingNarrative ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    Thinking...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    Generate Perspective <Sparkles className="w-4 h-4" />
                                                </div>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )}

                        {step >= 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <Card className="border-purple-100 dark:border-purple-900 shadow-xl dark:bg-slate-900/50 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                            <Heart className="w-5 h-5" />
                                            2. The Other Perspective
                                        </CardTitle>
                                        <CardDescription>
                                            Consider the situation from the victim&apos;s point of view.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="bg-purple-50/50 dark:bg-purple-900/20 p-6 rounded-lg mx-6 italic text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {narrative}
                                    </CardContent>
                                    {step === 2 && (
                                        <CardContent className="mt-6">
                                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Your Reflection</h4>
                                            <Textarea
                                                placeholder="How does reading this perspective make you feel? What would you do differently?"
                                                className="min-h-[120px] text-lg resize-none focus-visible:ring-purple-500"
                                                value={reflection}
                                                onChange={(e) => setReflection(e.target.value)}
                                            />
                                        </CardContent>
                                    )}
                                    {step === 2 && (
                                        <CardFooter className="justify-end">
                                            <Button
                                                onClick={analyzeReflection}
                                                disabled={!reflection.trim() || loadingAnalysis}
                                                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
                                            >
                                                {loadingAnalysis ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                        Analyzing...
                                                    </div>
                                                ) : (
                                                    "Analyze Reflection"
                                                )}
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>
                            </motion.div>
                        )}

                        {step === 3 && analysis && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className={`shadow-xl border-l-4 ${analysis.sentiment === "Remorseful" ? "border-l-emerald-500" :
                                    analysis.sentiment === "Defensive" ? "border-l-rose-500" :
                                        "border-l-amber-500"
                                    }`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Scale className="w-5 h-5 py-4" />
                                            Analysis Result
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                                                <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mb-1">Emotion</p>
                                                <p className={`text-2xl font-bold ${analysis.sentiment === "Remorseful" ? "text-emerald-600 dark:text-emerald-400" :
                                                    analysis.sentiment === "Defensive" ? "text-rose-600 dark:text-rose-400" :
                                                        "text-amber-600 dark:text-amber-400"
                                                    }`}>{analysis.sentiment}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                                                <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mb-1">Empathy Score</p>
                                                <div className="relative pt-1">
                                                    <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-slate-200 dark:bg-slate-700">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${analysis.score}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${analysis.score > 70 ? "bg-emerald-500" :
                                                                analysis.score < 40 ? "bg-rose-500" : "bg-amber-500"
                                                                }`}
                                                        />
                                                    </div>
                                                    <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{analysis.score}/100</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                                                <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mb-1">Source</p>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center justify-center h-full pb-4">
                                                    {analysis.source}
                                                    {analysis.source.includes("Fallback") && (
                                                        <AlertCircle className="w-4 h-4 text-amber-500 ml-1" />
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {analysis.explanation && analysis.explanation.length > 0 && (
                                            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                                                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                                    Why this score?
                                                </h3>
                                                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                                    {analysis.explanation.map((point: string, index: number) => (
                                                        <li key={index}>{point}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex gap-3 justify-center">
                                        <Button variant="outline" onClick={resetApp} className="mt-4">
                                            Start Over
                                        </Button>
                                        <Button
                                            onClick={() => setView('dashboard')}
                                            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            View Your Progress
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}
