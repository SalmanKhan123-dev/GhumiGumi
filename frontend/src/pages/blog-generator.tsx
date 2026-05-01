import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '@/helpers/axios-instance';
import ThemeToggle from '@/components/theme-toggle-button';
import AppIcon from '@/assets/svg/app-icon.svg';

function BlogGenerator() {
  const [topic, setTopic] = useState('');
  const [destination, setDestination] = useState('');
  const [style, setStyle] = useState('engaging and descriptive');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a blog topic.');
      return;
    }
    setError('');
    setLoading(true);
    setContent('');
    try {
      const res = await axiosInstance.post('/api/ai/blog-generator', { topic, destination, style });
      setContent(res.data.content);
    } catch {
      setError('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseContent = () => {
    sessionStorage.setItem('ai_blog_content', content);
    sessionStorage.setItem('ai_blog_topic', topic);
    navigate('/add-blog');
  };

  return (
    <div className="min-h-screen cursor-default bg-light dark:bg-dark">
      {/* Header */}
      <div className="relative bg-[url('./assets/wanderlustbg.webp')] bg-cover bg-center h-36">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-between px-8 sm:px-16">
          <div className="flex items-center gap-3 text-white">
            <Link to="/"><img src={AppIcon} className="h-10 w-10" /></Link>
            <Link to="/" className="text-2xl font-semibold text-white no-underline">GhumiGumi</Link>
            <span className="hidden text-gray-300 sm:block">/ AI Blog Writer</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-2 text-center">
          <h1 className="text-2xl font-bold text-light-primary dark:text-dark-primary">✍️ AI Blog Writer</h1>
          <p className="mt-2 text-sm text-light-secondary dark:text-dark-secondary">
            Give us your idea — AI writes the full blog post with title suggestions for you
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-dark-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-light-secondary dark:text-dark-secondary">
                Blog Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. My solo trip to Hunza Valley"
                className="w-full rounded-lg bg-zinc-100 p-3 text-sm placeholder:text-sm dark:bg-dark-field dark:text-dark-textInField"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-light-secondary dark:text-dark-secondary">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Hunza, Pakistan"
                className="w-full rounded-lg bg-zinc-100 p-3 text-sm placeholder:text-sm dark:bg-dark-field dark:text-dark-textInField"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-light-secondary dark:text-dark-secondary">
                Writing Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-lg bg-zinc-100 p-3 text-sm dark:bg-dark-field dark:text-dark-textInField"
              >
                <option value="engaging and descriptive">✨ Engaging & Descriptive</option>
                <option value="funny and casual">😄 Funny & Casual</option>
                <option value="professional and informative">📰 Professional</option>
                <option value="poetic and emotional">🎭 Poetic & Emotional</option>
              </select>
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-neutral-800 p-3 text-base font-semibold text-white disabled:bg-neutral-600 dark:bg-light dark:text-dark dark:hover:bg-dark-secondary/80"
          >
            {loading ? '✨ Writing your blog...' : '✨ Generate Blog Content'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 flex flex-col items-center gap-3 text-light-tertiary dark:text-dark-tertiary">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-neutral-800 dark:border-gray-700 dark:border-t-white"></div>
            <p className="text-sm">Writing your travel blog...</p>
          </div>
        )}

        {/* Result */}
        {content && !loading && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-dark-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-light-primary dark:text-dark-primary">Generated Blog Content</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="rounded-lg border border-zinc-300 px-3 py-1 text-xs text-light-secondary hover:bg-zinc-50 dark:border-dark-button dark:text-dark-secondary dark:hover:bg-dark-button"
                >
                  {copied ? '✓ Copied!' : 'Copy All'}
                </button>
                <button
                  onClick={handleUseContent}
                  className="rounded-lg bg-neutral-800 px-4 py-1 text-xs font-semibold text-white hover:bg-neutral-700 dark:bg-light dark:text-dark"
                >
                  Use This → Post Blog
                </button>
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-zinc-50 p-4 dark:bg-dark-field">
              {content.split('\n').map((line, i) => {
                const clean = line.replace(/\*\*/g, '').replace(/\*/g, '').replace(/##/g, '').trim();
                if (!clean) return <div key={i} className="h-1" />;
                if (['TITLES', 'INTRODUCTION', 'BODY', 'TIPS', 'CONCLUSION'].some(s => clean.startsWith(s))) {
                  return (
                    <p key={i} className="mt-4 text-xs font-bold uppercase tracking-widest text-light-tertiary dark:text-dark-tertiary">
                      {clean}
                    </p>
                  );
                }
                if (clean.match(/^[1-3]\./)) {
                  return (
                    <div key={i} className="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-dark-button">
                      <p className="text-sm font-semibold text-light-primary dark:text-dark-primary">💡 {clean}</p>
                    </div>
                  );
                }
                return <p key={i} className="text-sm leading-relaxed text-light-description dark:text-dark-description">{clean}</p>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogGenerator;
