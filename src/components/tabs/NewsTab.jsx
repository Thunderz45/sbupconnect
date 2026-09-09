import React, { useState } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

const NEWS = [
  { id: 0, title: 'India AI Mission Allocates Rs.10,000 Crore for University Labs', category: 'Technology', source: 'Economic Times', date: '07 Sep 2026', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800', summary: 'National Supercomputing Initiative expands GPU availability to top higher education institutes.', body: 'The Union Cabinet has approved the deployment of high-performance GPU clusters across 100 premier universities.' },
  { id: 1, title: 'RBI Projects 7.2% GDP Growth Driven by Services & Data Technology', category: 'Business', source: 'Financial Express', date: '07 Sep 2026', image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800', summary: 'Monetary Policy Committee highlights robust domestic consumption and tech hiring.', body: 'The Reserve Bank of India retained its optimistic GDP projection of 7.2% for FY27.' },
  { id: 2, title: 'ISRO Successfully Tests Next-Generation Heavy Payload Rocket Booster', category: 'India', source: 'The Hindu', date: '06 Sep 2026', image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=800', summary: 'Sriharikota spaceport completes ground test firing of indigenous cryogenic engine.', body: 'ISRO achieved a milestone with the 500-second endurance test of its CE-20 cryogenic engine.' },
  { id: 3, title: 'Global Tech Summit: Focus on Ethical AI & Data Sovereignty', category: 'World', source: 'Reuters', date: '05 Sep 2026', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800', summary: 'Delegates from 40 nations sign international AI safety framework.', body: 'International tech leaders aligned on new privacy compliance benchmarks.' },
  { id: 4, title: 'Indian Cricket Team Secures T20 Series Victory in Final Over Thriller', category: 'Sports', source: 'SportsStar', date: '06 Sep 2026', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800', summary: 'Spectacular bowling performance in the death overs seals a dramatic 12-run win.', body: 'A packed stadium witnessed an exhilarating finish as India defended 185 runs.' },
  { id: 5, title: 'Startup India Fund: Rs. 500 Cr Allocated for Campus Incubation Hubs', category: 'Business', source: 'LiveMint', date: '05 Sep 2026', image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800', summary: 'DPIIT partners with 50 universities to set up state-of-the-art innovation centres.', body: 'New campus-based incubators to support early-stage ventures with seed funding.' },
];

const CATS = ['All', 'Technology', 'Business', 'India', 'World', 'Sports'];

const CAT_COLORS = {
  Technology: '#0EA5E9', Business: '#10B981', India: '#F59E0B',
  World: '#8B5CF6', Sports: '#EF4444',
};

export default function NewsTab() {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = NEWS.filter(n => filter === 'All' || n.category === filter);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-title">News Feed</div>
        <div className="page-sub">Latest news curated for SBUP students</div>
      </div>

      <div className="notes-filter">
        {CATS.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="news-grid">
        {filtered.map(article => (
          <div key={article.id} className="news-card" onClick={() => setExpanded(expanded === article.id ? null : article.id)}>
            <img src={article.image} alt={article.title} loading="lazy" />
            <div className="news-card-body">
              <div className="news-source" style={{ color: CAT_COLORS[article.category] }}>
                {article.category} · {article.source} · {article.date}
              </div>
              <div className="news-headline">{article.title}</div>
              <div className="news-excerpt">
                {expanded === article.id ? article.body : article.summary}
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--sky-600)' }}>
                  {expanded === article.id ? 'Show less' : 'Read more'} <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
