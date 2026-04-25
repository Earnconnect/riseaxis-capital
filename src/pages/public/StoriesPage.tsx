import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, ChevronRight, Star, MapPin, Briefcase, Heart, GraduationCap, Building2, AlertCircle } from 'lucide-react'

const G = {
  navy:   '#0F172A',
  page:   '#F8FAFC',
  white:  '#FFFFFF',
  green:  '#16A34A',
  border: '#E2E8F0',
}

const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
)

const CATEGORIES = ['All', 'Emergency', 'Education', 'Medical', 'Business', 'Community']

const STORIES = [
  {
    id: 1,
    name: 'Marcus D.',
    location: 'Atlanta, GA',
    program: 'Emergency Assistance',
    category: 'Emergency',
    amount: '$3,500',
    date: 'January 2025',
    icon: AlertCircle,
    color: '#DC2626',
    rating: 5,
    headline: 'Kept My Family in Our Home',
    summary: 'After an unexpected layoff, I was two months behind on rent and facing eviction with three kids. RiseAxis Capital\'s Emergency Assistance grant covered the arrears and bought me time to find a new job.',
    full: 'When my employer closed down without warning, I had no savings to fall back on. Within six weeks I was facing an eviction notice. A friend mentioned RiseAxis Capital and I honestly didn\'t think I\'d qualify — but I applied anyway. Within 10 days my application was approved and the funds were sent directly to my landlord. By the time the next rent cycle came around, I had a new job offer in hand. I can\'t overstate how much this program changed the trajectory of my family\'s life.',
    outcome: 'Secured new employment within 30 days of receiving grant',
  },
  {
    id: 2,
    name: 'Priya S.',
    location: 'Houston, TX',
    program: 'Education Support',
    category: 'Education',
    amount: '$5,000',
    date: 'November 2024',
    icon: GraduationCap,
    color: '#7C3AED',
    rating: 5,
    headline: 'Finished My Nursing Degree',
    summary: 'I was one semester away from completing my RN degree when my financial aid ran out. The Education Support grant covered my final tuition balance and certification exam fees.',
    full: 'I had been working as a CNA for six years while putting myself through nursing school part-time. When my Pell Grant was exhausted and my final semester bill arrived, I nearly had to drop out and wait another year. A counselor at my college suggested I look into nonprofit grant programs. I found RiseAxis Capital online, submitted my application with my academic records and financial aid gap letter, and received approval within two weeks. I graduated on time, passed my NCLEX on the first attempt, and started working as a registered nurse the following month.',
    outcome: 'Graduated on schedule, now employed as RN at HCA Healthcare',
  },
  {
    id: 3,
    name: 'James & Carol T.',
    location: 'Phoenix, AZ',
    program: 'Medical Expenses',
    category: 'Medical',
    amount: '$4,200',
    date: 'February 2025',
    icon: Heart,
    color: '#DC2626',
    rating: 5,
    headline: 'Cancer Treatment Without Losing Everything',
    summary: 'My wife\'s chemotherapy co-pays were stacking up faster than we could manage on a single income. The Medical Expenses grant covered three months of treatment costs while I kept our bills current.',
    full: 'Carol was diagnosed with stage 2 breast cancer in October. Between the diagnosis and the start of chemotherapy, I had already maxed out one credit card on imaging and specialist consults. I work in construction and couldn\'t afford to take unpaid time off, but I also needed to drive her to twice-weekly infusions. A hospital social worker pointed us to RiseAxis Capital. The application took about 45 minutes to complete online. We were asked to submit Carol\'s treatment plan and billing statements from the oncology center, and the grant was approved in 8 days. It covered every co-pay through the end of her primary treatment cycle.',
    outcome: 'Carol completed primary treatment; currently in remission',
  },
  {
    id: 4,
    name: 'Darnell W.',
    location: 'Chicago, IL',
    program: 'Business Funding',
    category: 'Business',
    amount: '$8,500',
    date: 'March 2025',
    icon: Briefcase,
    color: '#D97706',
    rating: 5,
    headline: 'Launched My Food Truck — Debt-Free',
    summary: 'I had the concept, the license, and the skills — but not the capital to purchase my truck and first month of inventory. The Business Funding grant made it happen without a bank loan.',
    full: 'I spent two years as a line cook saving up and developing my concept for a Caribbean fusion food truck. I had everything except the $8,000 gap between my savings and the truck plus equipment costs. Every small business loan I applied for required 2 years of operating history I didn\'t have yet. RiseAxis Capital\'s Business Funding program was specifically designed for early-stage and startup businesses like mine. I submitted my business plan, cost projections, food handler certificates, and a copy of my mobile food vendor license. Three weeks later the grant was approved. I launched at a local farmers market that same spring and turned profitable in my second month.',
    outcome: 'Food truck operating profitably; planning second unit in 2026',
  },
  {
    id: 5,
    name: 'Neighborhood Youth Alliance',
    location: 'Baltimore, MD',
    program: 'Community Development',
    category: 'Community',
    amount: '$12,000',
    date: 'December 2024',
    icon: Building2,
    color: '#0891B2',
    rating: 5,
    headline: 'After-School Program Kept Its Doors Open',
    summary: 'A funding gap threatened to shut down our after-school STEM program serving 60 middle schoolers. The Community Development grant bridged the gap while we secured a larger foundation grant.',
    full: 'Our nonprofit had been operating a free after-school STEM program for three years when our primary city contract was cut during the budget cycle. We had 60 kids enrolled, two paid instructors, and about 90 days before the doors would have to close. Our executive director found RiseAxis Capital while researching emergency bridge funding for nonprofits. We submitted our 990, program impact data, and a detailed bridge funding proposal. The Community Development grant covered instructor salaries and facility rent for four months — enough time to complete our application to a major private foundation, which ultimately funded us for three years. We never missed a single program day.',
    outcome: 'Program continues; 3-year foundation grant secured for $85,000',
  },
  {
    id: 6,
    name: 'Rosa M.',
    location: 'Los Angeles, CA',
    program: 'Emergency Assistance',
    category: 'Emergency',
    amount: '$2,800',
    date: 'October 2024',
    icon: AlertCircle,
    color: '#DC2626',
    rating: 5,
    headline: 'Utility Cutoffs Reversed Before Winter',
    summary: 'A medical emergency wiped out my savings and I fell behind on utilities while recovering. The grant covered my electric and gas arrears so my household didn\'t go dark heading into winter.',
    full: 'I had a gallbladder emergency in August that put me out of work for six weeks. I\'m self-employed as a house cleaner, so there was no sick pay — I just stopped earning. By the time I was cleared to work again, I had $1,900 in utility arrears and shutoff notices for both electric and gas. My daughter helped me find and apply through RiseAxis Capital. The process was entirely online and very clear about what documents were needed. Within 12 days I had an approval notification and the utility companies confirmed the payments had posted. Having heat and electricity restored my ability to actually focus on getting clients back and rebuilding.',
    outcome: 'Returned to full-time self-employment within 8 weeks',
  },
]

export default function StoriesPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [expanded, setExpanded] = useState<number | null>(null)

  const filtered = activeCategory === 'All'
    ? STORIES
    : STORIES.filter(s => s.category === activeCategory)

  return (
    <div style={{ background: G.white }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${G.navy} 0%, #1E3A5F 100%)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 pt-28 pb-20 relative z-10">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-green-400 mb-6"
              style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.25)' }}>
              <Star size={11} fill="currentColor" /> Real Stories, Real Impact
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Grant Recipient <span style={{ color: '#4ADE80' }}>Success Stories</span>
            </h1>
            <p className="text-lg text-white/50 max-w-xl">
              Real people. Real outcomes. Every story below is a first-person account from an approved grant recipient who agreed to share their experience.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ background: G.navy }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '2,400+', label: 'Grants Awarded' },
              { value: '$2.4M',  label: 'Total Disbursed' },
              { value: '41',     label: 'States Served' },
              { value: '94%',    label: 'Applicant Satisfaction' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#4ADE80' }}>{s.value}</div>
                <div className="text-xs text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section style={{ background: G.page, borderBottom: `1px solid ${G.border}` }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: activeCategory === cat ? G.green : G.white,
                  color: activeCategory === cat ? '#fff' : '#475569',
                  border: `1px solid ${activeCategory === cat ? G.green : G.border}`,
                  boxShadow: activeCategory === cat ? '0 2px 8px rgba(22,163,74,0.25)' : 'none',
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stories grid */}
      <section style={{ background: G.white }} className="py-16">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((story, i) => {
                const Icon = story.icon
                const isExpanded = expanded === story.id
                return (
                  <FadeUp key={story.id} delay={i * 0.05}>
                    <div className="rounded-2xl overflow-hidden flex flex-col h-full"
                      style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

                      {/* Card header */}
                      <div className="p-5 border-b" style={{ borderColor: G.border }}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `${story.color}15`, border: `1px solid ${story.color}30` }}>
                              <Icon size={16} style={{ color: story.color }} />
                            </div>
                            <div>
                              <div className="font-semibold text-sm" style={{ color: G.navy }}>{story.name}</div>
                              <div className="flex items-center gap-1 text-xs" style={{ color: '#94A3B8' }}>
                                <MapPin size={10} />
                                {story.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold" style={{ color: G.green }}>{story.amount}</div>
                            <div className="text-[10px]" style={{ color: '#94A3B8' }}>{story.date}</div>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{ background: `${story.color}10`, color: story.color, border: `1px solid ${story.color}20` }}>
                          {story.program}
                        </div>

                        <div className="flex mt-3 gap-0.5">
                          {Array.from({ length: story.rating }).map((_, i) => (
                            <Star key={i} size={11} fill="#FBBF24" style={{ color: '#FBBF24' }} />
                          ))}
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start gap-2 mb-3">
                          <Quote size={16} className="shrink-0 mt-0.5" style={{ color: G.green }} />
                          <h3 className="font-bold text-base leading-snug" style={{ color: G.navy }}>{story.headline}</h3>
                        </div>

                        <p className="text-sm leading-relaxed mb-3" style={{ color: '#475569' }}>{story.summary}</p>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p className="text-sm leading-relaxed mb-3 pt-1" style={{ color: '#475569' }}>{story.full}</p>
                              <div className="rounded-xl p-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                                <div className="text-[11px] font-bold uppercase tracking-wide text-green-700 mb-1">Outcome</div>
                                <div className="text-xs text-green-800">{story.outcome}</div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          onClick={() => setExpanded(isExpanded ? null : story.id)}
                          className="mt-auto pt-3 flex items-center gap-1.5 text-xs font-semibold transition-colors"
                          style={{ color: G.green }}>
                          {isExpanded ? 'Show less' : 'Read full story'}
                          <ChevronRight size={13} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                      </div>
                    </div>
                  </FadeUp>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8">
          <p className="text-xs text-center" style={{ color: '#94A3B8' }}>
            All stories are shared with consent. Names are partially anonymized to protect recipient privacy.
            Grant amounts and outcomes are accurate as of the date noted. Individual results may vary.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: G.white, borderTop: `1px solid ${G.border}` }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-16">
          <FadeUp>
            <div className="rounded-2xl p-8 md:p-12 text-center" style={{ background: `linear-gradient(135deg, ${G.navy}, #1E3A5F)` }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-green-400 mb-5"
                style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.25)' }}>
                <Star size={11} fill="currentColor" /> Your Story Could Be Next
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to Write Your Success Story?</h2>
              <p className="text-white/50 mb-7 max-w-lg mx-auto text-sm">
                Applications are reviewed within 7–14 business days. No credit check. No repayment required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/apply"
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
                  Apply for a Grant <ChevronRight size={14} />
                </Link>
                <Link to="/programs"
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  Browse Programs
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
