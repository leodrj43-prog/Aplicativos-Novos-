import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  ShieldCheck, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  FileText, 
  Globe,
  ExternalLink,
  ChevronRight,
  PieChart,
  Activity,
  BarChart as BarChartIcon,
  GraduationCap,
  HeartPulse,
  Settings,
  Layers,
  Briefcase,
  RefreshCw,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LabelList
} from 'recharts';
import { fetchTransparencyData, TransparencyReport, CostData, HistoricalCost } from './services/geminiService';

export default function App() {
  const [data, setData] = useState<TransparencyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string>('all');

  const calculateVariations = (historicalData: HistoricalCost[]) => {
    return historicalData.map((item, index) => {
      if (index === 0) return { ...item, variation: null };
      const prevValue = historicalData[index - 1].value;
      const variation = ((item.value - prevValue) / prevValue) * 100;
      return { ...item, variation: variation.toFixed(1) };
    });
  };

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await fetchTransparencyData();
      const dataWithVariations = {
        ...result,
        historicalData: calculateVariations(result.historicalData)
      };
      setData(dataWithVariations);
      setLastUpdated(new Date().toLocaleString('pt-BR'));
      if (result.historicalData) {
        setSelectedYears(result.historicalData.map(d => d.year));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleYear = (year: string) => {
    setSelectedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year) 
        : [...prev, year].sort()
    );
  };

  const agencies = ['all', ...new Set(data?.keyMetrics.map(m => m.agency) || [])];

  const filteredMetrics = data?.keyMetrics.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.agency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgency = selectedAgency === 'all' || m.agency === selectedAgency;
    return matchesSearch && matchesAgency;
  });

  const filteredHistoricalData = data?.historicalData.filter(d => 
    selectedYears.includes(d.year)
  );

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="text-red-400" size={20} />;
      case 'down': return <TrendingDown className="text-emerald-400" size={20} />;
      default: return <Minus className="text-blue-300" size={20} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('educação')) return <GraduationCap size={14} />;
    if (cat.includes('saúde')) return <HeartPulse size={14} />;
    if (cat.includes('gestão') || cat.includes('administrativo')) return <Settings size={14} />;
    if (cat.includes('geral')) return <Layers size={14} />;
    if (cat.includes('trabalho')) return <Briefcase size={14} />;
    return <BarChart3 size={14} />;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-gov-blue-dark border border-white/20 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-gov-gold font-bold mb-1">{label}</p>
          <p className="text-white text-lg font-display">{item.formattedValue}</p>
          {item.variation && (
            <p className={`text-xs font-bold mt-1 ${Number(item.variation) >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {Number(item.variation) >= 0 ? '+' : ''}{item.variation}% em relação ao ano anterior
            </p>
          )}
          <p className="text-blue-300 text-xs mt-1">Custo Total da União</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gov-blue-dark overflow-hidden">
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              borderRadius: ["20%", "50%", "20%"]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-24 h-24 bg-gov-gold/20 backdrop-blur-xl border-2 border-gov-gold flex items-center justify-center"
          >
            <Activity size={40} className="text-gov-gold" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-4 border border-gov-gold/30 rounded-full"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-2xl font-display font-bold text-gov-gold tracking-tight">Sincronizando com o Tesouro</p>
          <p className="text-blue-300/60 text-sm mt-2">Processando dados de transparência federal...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gov-blue-dark text-white pb-20">
      {/* Header / Hero */}
      <header className="relative overflow-hidden pt-16 pb-24 px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 2 }}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        >
          <motion.div 
            animate={{ 
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gov-blue-light rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, -40, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gov-gold rounded-full blur-[120px]" 
          />
        </motion.div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="bg-gov-gold p-2 rounded-lg">
              <ShieldCheck className="text-gov-blue-dark" size={24} />
            </div>
            <span className="text-gov-gold font-bold tracking-widest uppercase text-sm">Transparência Federal</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
          >
            Custos do <span className="text-gov-gold">Serviço Público</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl text-blue-100 max-w-2xl mb-10 leading-relaxed"
          >
            Acompanhe com clareza e precisão como os recursos da União são aplicados na manutenção e entrega de serviços essenciais à população brasileira.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <a 
              href="https://www.tesourotransparente.gov.br/temas/contabilidade-e-custos/sistema-de-custos" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-gov-blue-dark px-6 py-3 rounded-full font-bold hover:bg-gov-gold transition-all hover:shadow-[0_0_20px_rgba(255,204,0,0.4)]"
            >
              Fonte Oficial <ExternalLink size={18} />
            </a>
            <button 
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full font-bold hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Atualizando...' : 'Sincronizar Agora'}
            </button>
            
            <div className="flex items-center gap-2 text-blue-200/60 text-xs font-medium bg-black/20 px-4 py-2 rounded-full border border-white/5">
              <Clock size={14} />
              <span>Última atualização: {lastUpdated}</span>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-12">
        {/* Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="glass-card p-8 mb-12 flex flex-col md:flex-row gap-8 items-center"
        >
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="bg-gov-blue-light/30 p-6 rounded-2xl"
          >
            <PieChart size={64} className="text-gov-gold" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-display font-bold mb-3 flex items-center gap-2">
              <Info size={24} className="text-gov-gold" /> Resumo Executivo
            </h2>
            <p className="text-blue-50 leading-relaxed text-lg">
              {data?.summary}
            </p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl font-display font-bold"
          >
            Métricas de Destaque
          </motion.h3>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative w-full md:w-64"
            >
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={18} />
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-gov-gold/50 transition-all appearance-none cursor-pointer text-sm"
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
              >
                {agencies.map(agency => (
                  <option key={agency} value={agency} className="bg-gov-blue-dark">
                    {agency === 'all' ? 'Todos os Órgãos' : agency}
                  </option>
                ))}
              </select>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative w-full md:w-80"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por categoria ou título..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-gov-gold/50 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </motion.div>
          </div>
        </div>

        {/* Metrics Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          <AnimatePresence mode="popLayout">
            {filteredMetrics?.map((metric, idx) => (
              <motion.div
                key={metric.title}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: idx * 0.05,
                  layout: { duration: 0.3 }
                }}
                className="glass-card p-6 hover-scale group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gov-gold/0 group-hover:bg-gov-gold transition-all duration-300" />
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gov-gold/80 bg-gov-gold/10 px-2 py-0.5 rounded w-fit">
                      {getCategoryIcon(metric.category)}
                      {metric.category}
                    </span>
                    <span className="text-[10px] text-blue-300/60 font-medium truncate max-w-[150px]">
                      {metric.agency}
                    </span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {getTrendIcon(metric.trend)}
                  </motion.div>
                </div>
                <h4 className="text-blue-200 text-sm font-medium mb-1">{metric.title}</h4>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-display font-bold mb-3 group-hover:text-gov-gold transition-colors"
                >
                  {metric.value}
                </motion.div>
                <p className="text-sm text-blue-100/70 leading-snug">
                  {metric.description}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Evolution Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 mb-16"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <div>
              <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                <BarChartIcon size={24} className="text-gov-gold" /> Evolução dos Custos Totais
              </h3>
              <p className="text-blue-200/70 text-sm mt-1">Valores anuais consolidados (em bilhões de R$)</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-300 mr-2">Filtrar Anos:</span>
              {data?.historicalData.map(d => (
                <button
                  key={d.year}
                  onClick={() => toggleYear(d.year)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    selectedYears.includes(d.year)
                      ? 'bg-gov-gold text-gov-blue-dark border-gov-gold shadow-[0_0_10px_rgba(255,204,0,0.3)]'
                      : 'bg-white/5 text-blue-200 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {d.year}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredHistoricalData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                onMouseMove={(state) => {
                  if (state.activeTooltipIndex !== undefined) {
                    setActiveBar(state.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setActiveBar(null)}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffcc00" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ffcc00" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#93c5fd', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#93c5fd', fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${value}B`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                >
                  <LabelList 
                    dataKey="variation" 
                    position="top" 
                    offset={10}
                    content={(props: any) => {
                      const { x, y, width, value } = props;
                      if (!value) return null;
                      const numValue = Number(value);
                      return (
                        <text 
                          x={x + width / 2} 
                          y={y - 10} 
                          fill={numValue >= 0 ? '#f87171' : '#34d399'} 
                          textAnchor="middle" 
                          fontSize={12} 
                          fontWeight="bold"
                        >
                          {numValue >= 0 ? '+' : ''}{value}%
                        </text>
                      );
                    }}
                  />
                  {filteredHistoricalData?.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={activeBar === index ? '#ffcc00' : 'url(#barGradient)'}
                      style={{ transition: 'fill 0.3s ease' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Detailed Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 glass-card p-8"
          >
            <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
              <FileText size={24} className="text-gov-gold" /> Análise de Impacto
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-blue-50 leading-relaxed mb-6">
                {data?.detailedAnalysis}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <h5 className="font-bold mb-2 text-gov-gold">Controle Social</h5>
                  <p className="text-sm text-blue-100/80">Permite que a sociedade atue como fiscalizadora da eficiência dos gastos públicos.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <h5 className="font-bold mb-2 text-gov-gold">Tomada de Decisão</h5>
                  <p className="text-sm text-blue-100/80">Subsídios técnicos para gestores otimizarem a alocação de recursos escassos.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 flex flex-col justify-between"
          >
            <div>
              <div className="bg-gov-gold/20 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <Globe size={24} className="text-gov-gold" />
              </div>
              <h3 className="text-xl font-display font-bold mb-4">Acesso Global</h3>
              <p className="text-blue-100/80 mb-6">
                O Brasil é referência internacional em transparência de dados fiscais e de custos, ocupando posições de destaque em rankings globais.
              </p>
            </div>
            <button className="w-full py-4 bg-gov-gold text-gov-blue-dark font-bold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2">
              Ver Dados Abertos <BarChart3 size={20} />
            </button>
          </motion.div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 mt-20 pt-10 border-t border-white/10 text-center">
        <p className="text-blue-300/60 text-sm">
          Dados extraídos e processados via IA a partir do Portal Tesouro Transparente. 
          <br />
          © 2026 Portal de Transparência de Custos Federais.
        </p>
      </footer>
    </div>
  );
}
