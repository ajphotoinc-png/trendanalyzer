import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Sparkles, 
  Camera, 
  Palette, 
  Cpu, 
  Copy, 
  Check, 
  ChevronRight, 
  Search,
  TrendingUp,
  Clock,
  Globe,
  Heart,
  Zap,
  Share2,
  User,
  Image
} from 'lucide-react';
import { Trend, GeneratedPrompt } from './types';
import { generateContentPrompts, predictTrends } from './services/geminiService';

export default function App() {
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [predictingTrends, setPredictingTrends] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScope, setFilterScope] = useState<'Global' | 'Country' | null>(null);
  const [countryInput, setCountryInput] = useState('');
  const [personalization, setPersonalization] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [predictedTrends, setPredictedTrends] = useState<Trend[]>([]);

  const filteredTrends = predictedTrends.filter(trend => {
    return trend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trend.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleSearch = async (scope: 'Global' | 'Country') => {
    setFilterScope(scope);
    setPredictingTrends(true);
    setHasSearched(true);
    setPredictedTrends([]);
    setSelectedTrend(null);
    setPrompts([]);
    
    try {
      const trends = await predictTrends(scope, scope === 'Country' ? countryInput : undefined);
      setPredictedTrends(trends);
    } catch (error) {
      console.error('Error predicting trends:', error);
    } finally {
      setPredictingTrends(false);
    }
  };

  const resetSearch = () => {
    setFilterScope(null);
    setHasSearched(false);
    setCountryInput('');
    setPersonalization('');
    setSearchTerm('');
    setSelectedTrend(null);
    setPrompts([]);
    setPredictedTrends([]);
  };

  const handleGenerate = async (trend: Trend) => {
    setSelectedTrend(trend);
    setLoading(true);
    setPrompts([]);
    try {
      const result = await generateContentPrompts(trend, personalization);
      setPrompts(result.prompts);
    } catch (error) {
      console.error('Error generating prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Holiday': return <Zap className="w-4 h-4 text-orange-500" />;
      case 'Religious': return <Heart className="w-4 h-4 text-purple-500" />;
      case 'Seasonal': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Global': return <Globe className="w-4 h-4 text-emerald-500" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">StockTrend AI</h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Adobe Stock Prompt Generator</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-4 text-sm font-medium text-slate-500">
              <a href="#" className="text-indigo-600">Dashboard</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Calendar</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Guide</a>
            </nav>
            <div className="h-6 w-px bg-slate-200"></div>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-sm">
              Connect Adobe
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar: Trends List */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[400px]">
              {!hasSearched ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold">Find Trends</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-indigo-900">Personalize (Optional)</span>
                        <User className="w-5 h-5 text-indigo-400" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="e.g. From Aji & Keluarga"
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={personalization}
                        onChange={(e) => setPersonalization(e.target.value)}
                      />
                      <p className="text-[10px] text-indigo-600/60">This will be included in your Social Media & Image-to-Image prompts.</p>
                    </div>

                    <button
                      onClick={() => handleSearch('Global')}
                      className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-left hover:bg-indigo-100 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-indigo-900">Global Trends</span>
                        <Globe className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-xs text-indigo-600/70">Worldwide seasonal events and holidays</p>
                    </button>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">Search by Country</span>
                        <Search className="w-5 h-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Enter country name..."
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={countryInput}
                        onChange={(e) => setCountryInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && countryInput && handleSearch('Country')}
                      />
                      <button
                        disabled={!countryInput}
                        onClick={() => handleSearch('Country')}
                        className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Search Country
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={resetSearch}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <ChevronRight className="w-3 h-3 rotate-180" />
                      Back to Start
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {filterScope === 'Global' ? 'Global' : countryInput}
                    </span>
                  </div>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Filter results..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    {predictingTrends ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full mb-4"
                        />
                        <p className="text-xs text-slate-400 font-medium italic">Predicting trends for 2026...</p>
                      </div>
                    ) : filteredTrends.length > 0 ? (
                      filteredTrends.map((trend) => (
                        <button
                          key={trend.id}
                          onClick={() => handleGenerate(trend)}
                          className={`w-full text-left p-4 rounded-xl border transition-all group ${
                            selectedTrend?.id === trend.id 
                              ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                              : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(trend.category)}
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {trend.category}
                              </span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${selectedTrend?.id === trend.id ? 'translate-x-1 text-indigo-600' : 'text-slate-300 group-hover:translate-x-1'}`} />
                          </div>
                          <h3 className="font-bold text-slate-800 mb-1">{trend.name}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Calendar className="w-3 h-3" />
                              {trend.date}
                            </div>
                            {trend.country && (
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {trend.country}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-sm text-slate-400">No trends found for this search.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  Adobe Stock customers look for content 2-3 months before the actual event. Start uploading your 2026 Independence Day content now!
                </p>
              </div>
              <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-indigo-500/30 rotate-12" />
            </div>
          </div>

          {/* Main Content: Prompt Generation */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!selectedTrend ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-slate-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Select a Trend to Begin</h2>
                  <p className="text-slate-500 max-w-md">
                    Choose an upcoming holiday or seasonal event from the sidebar to generate optimized prompts for your stock portfolio.
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key={selectedTrend.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Trend Header */}
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                          {selectedTrend.category}
                        </span>
                        <span className="text-slate-400 text-sm">•</span>
                        <span className="text-slate-500 text-sm font-medium">{selectedTrend.date}</span>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 mb-4">{selectedTrend.name}</h2>
                      <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                        {selectedTrend.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-6">
                        {selectedTrend.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      {getCategoryIcon(selectedTrend.category)}
                    </div>
                  </div>

                  {/* Generation Status */}
                  {loading ? (
                    <div className="bg-white rounded-3xl p-20 border border-slate-200 flex flex-col items-center justify-center text-center">
                      <div className="relative">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full"
                        />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="mt-8 text-xl font-bold text-slate-800">Analyzing Market Trends...</h3>
                      <p className="mt-2 text-slate-500">Gemini is crafting high-conversion prompts for you.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {prompts.map((p, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={idx}
                          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-all"
                        >
                          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${
                                p.type === 'Photography' ? 'bg-blue-100 text-blue-600' :
                                p.type === 'Vector' ? 'bg-orange-100 text-orange-600' :
                                p.type === 'AI-Generated' ? 'bg-purple-100 text-purple-600' :
                                p.type === 'Social-Media' ? 'bg-emerald-100 text-emerald-600' :
                                p.type === 'Image-to-Image' ? 'bg-rose-100 text-rose-600' :
                                'bg-indigo-100 text-indigo-600'
                              }`}>
                                {p.type === 'Photography' && <Camera className="w-5 h-5" />}
                                {p.type === 'Vector' && <Palette className="w-5 h-5" />}
                                {p.type === 'AI-Generated' && <Cpu className="w-5 h-5" />}
                                {p.type === 'Social-Media' && <Share2 className="w-5 h-5" />}
                                {p.type === 'Image-to-Image' && <User className="w-5 h-5" />}
                                {p.type === 'Photo-Editing' && <Image className="w-5 h-5" />}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">{p.type.replace('-', ' ')}</h4>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Content Category</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => copyToClipboard(p.prompt, idx)}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-500" />
                                  <span className="text-emerald-600">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>Copy Prompt</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-8">
                            <h5 className="text-xl font-bold text-slate-800 mb-4 leading-tight">
                              {p.title}
                            </h5>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6 font-mono text-sm text-slate-700 leading-relaxed relative">
                              {p.prompt}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Recommended Keywords</p>
                              <div className="flex flex-wrap gap-2">
                                {p.keywords.map(kw => (
                                  <span key={kw} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium border border-indigo-100">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900">StockTrend AI</span>
          </div>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
            Helping creators dominate the stock market with AI-powered trend analysis and prompt engineering.
          </p>
          <div className="flex justify-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
          </div>
          <p className="mt-8 text-xs text-slate-400">
            © 2026 StockTrend AI. Powered by Gemini 3.1 Pro.
          </p>
        </div>
      </footer>
    </div>
  );
}
