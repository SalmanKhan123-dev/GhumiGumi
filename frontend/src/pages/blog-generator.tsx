// @ts-nocheck

import { useState } from 'react';
import { Link } from 'react-router-dom';

import axiosInstance from '@/helpers/axios-instance';
import ThemeToggle from '@/components/theme-toggle-button';

import AppIcon from '@/assets/svg/app-icon.svg';

function BlogGenerator() {
  const [topic, setTopic] = useState('');
  const [destination, setDestination] = useState('');
  const [style, setStyle] = useState('poetic and emotional');

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* =========================================================
     GENERATE BLOG
  ========================================================= */

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a blog topic.');
      return;
    }

    setError('');
    setLoading(true);
    setContent('');

    try {
      const res = await axiosInstance.post(
        '/api/ai/blog-generator',
        {
          topic,
          destination: destination || topic,
          style,
        },
      );

      setContent(res.data.content || '');
    } catch (err) {
      console.error('Blog generation error:', err);

      setError(
        'Failed to generate blog. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     COPY BLOG
  ========================================================= */

  const handleCopy = async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  /* =========================================================
     CLEAN TEXT
  ========================================================= */

  const cleanText = (text: string) => {
    return text
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/`/g, '')
      .trim();
  };

  /* =========================================================
     FORMAT INLINE TEXT
  ========================================================= */

  const formatInlineText = (text: string) => {
    const cleaned = cleanText(text);

    return cleaned;
  };

  /* =========================================================
     BLOG CONTENT RENDERER
  ========================================================= */

  const renderBlog = () => {
    if (!content) return null;

    const lines = content
      .split('\n')
      .map((line) => line.trim());

    const elements: JSX.Element[] = [];

    let currentParagraph: string[] = [];
    let listItems: string[] = [];

    /* =======================================================
       PARAGRAPH
    ======================================================= */

    const flushParagraph = () => {
      if (currentParagraph.length === 0) return;

      const paragraph =
        currentParagraph.join(' ').trim();

      if (paragraph) {
        elements.push(
          <p
            key={`paragraph-${elements.length}`}
            className="mb-5 text-[15px] leading-8 text-dark-description"
          >
            {formatInlineText(paragraph)}
          </p>,
        );
      }

      currentParagraph = [];
    };

    /* =======================================================
       LIST
    ======================================================= */

    const flushList = () => {
      if (listItems.length === 0) return;

      elements.push(
        <div
          key={`list-${elements.length}`}
          className="mb-7 space-y-3"
        >
          {listItems.map((item, index) => (
            <div
              key={index}
              className="flex gap-3 rounded-xl border border-dark-button bg-dark-field px-4 py-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-light text-xs font-bold text-dark">
                {index + 1}
              </span>

              <p className="text-sm leading-6 text-dark-description">
                {formatInlineText(item)}
              </p>
            </div>
          ))}
        </div>,
      );

      listItems = [];
    };

    /* =======================================================
       PROCESS LINES
    ======================================================= */

    lines.forEach((line) => {
      /* Empty line */

      if (!line) {
        flushParagraph();
        flushList();
        return;
      }

      /* =====================================================
         MAIN TITLE
      ===================================================== */

      if (
        line.startsWith('# ') &&
        !line.startsWith('## ')
      ) {
        flushParagraph();
        flushList();

        const title = cleanText(
          line.replace(/^# /, ''),
        );

        elements.push(
          <div
            key={`title-${elements.length}`}
            className="mb-8"
          >
            <div className="mb-4 h-1 w-14 rounded-full bg-light" />

            <h1 className="text-3xl font-extrabold leading-tight text-dark-primary sm:text-4xl">
              {title}
            </h1>
          </div>,
        );

        return;
      }

      /* =====================================================
         H2
      ===================================================== */

      if (line.startsWith('## ')) {
        flushParagraph();
        flushList();

        const heading = cleanText(
          line.replace(/^## /, ''),
        );

        elements.push(
          <div
            key={`heading-${elements.length}`}
            className="mb-5 mt-10"
          >
            <div className="flex items-center gap-3">
              <div className="h-7 w-1 rounded-full bg-light" />

              <h2 className="text-xl font-bold text-dark-primary sm:text-2xl">
                {heading}
              </h2>
            </div>

            <div className="mt-3 h-px bg-dark-button" />
          </div>,
        );

        return;
      }

      /* =====================================================
         H3
      ===================================================== */

      if (line.startsWith('### ')) {
        flushParagraph();
        flushList();

        const heading = cleanText(
          line.replace(/^### /, ''),
        );

        elements.push(
          <div
            key={`subheading-${elements.length}`}
            className="mb-3 mt-7"
          >
            <h3 className="text-lg font-bold text-dark-primary">
              {heading}
            </h3>
          </div>,
        );

        return;
      }

      /* =====================================================
         BULLET
      ===================================================== */

      if (
        line.startsWith('- ') ||
        line.startsWith('* ')
      ) {
        flushParagraph();

        listItems.push(
          line.replace(/^[-*]\s+/, ''),
        );

        return;
      }

      /* =====================================================
         NUMBERED LIST
      ===================================================== */

      if (/^\d+\.\s/.test(line)) {
        flushParagraph();

        listItems.push(
          line.replace(/^\d+\.\s/, ''),
        );

        return;
      }

      /* =====================================================
         NORMAL TEXT
      ===================================================== */

      currentParagraph.push(line);
    });

    flushParagraph();
    flushList();

    return elements;
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen cursor-default bg-light dark:bg-dark">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-zinc-200 bg-white dark:border-dark-button dark:bg-dark-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8">
          {/* LOGO */}

          <div className="flex items-center gap-3">
            <Link to="/">
              <img
                src={AppIcon}
                alt="GhumiGumi"
                className="h-10 w-10"
              />
            </Link>

            <div>
              <Link
                to="/"
                className="text-xl font-bold text-light-primary no-underline dark:text-dark-primary"
              >
                GhumiGumi
              </Link>

              <p className="text-xs text-light-tertiary dark:text-dark-tertiary">
                / AI Blog Writer
              </p>
            </div>
          </div>

          {/* THEME */}

          <ThemeToggle />
        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* ===================================================
            PAGE TITLE
        =================================================== */}

        <div className="mb-10 text-center">
          <div className="mb-3 text-4xl">
            ✍️
          </div>

          <h1 className="text-3xl font-extrabold text-light-primary dark:text-dark-primary sm:text-4xl">
            AI Blog Writer
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-light-secondary dark:text-dark-secondary sm:text-base">
            Give us your idea — AI writes a complete
            travel blog with engaging stories,
            places, food and useful tips.
          </p>
        </div>

        {/* ===================================================
            INPUT CARD
        =================================================== */}

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-dark-button dark:bg-dark-card sm:p-8">
          {/* BLOG TOPIC */}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-light-primary dark:text-dark-primary">
              Blog Topic
              <span className="ml-1">*</span>
            </label>

            <input
              value={topic}
              onChange={(e) =>
                setTopic(e.target.value)
              }
              placeholder="e.g. My solo trip to Delhi"
              className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-light-primary outline-none transition placeholder:text-zinc-500 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-800/10 dark:border-dark-button dark:bg-dark-field dark:text-dark-primary dark:placeholder:text-dark-tertiary dark:focus:border-light"
            />
          </div>

          {/* DESTINATION + STYLE */}

          <div className="grid gap-5 md:grid-cols-2">
            {/* DESTINATION */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-light-primary dark:text-dark-primary">
                Destination
              </label>

              <input
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value)
                }
                placeholder="e.g. Delhi, India"
                className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-light-primary outline-none transition placeholder:text-zinc-500 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-800/10 dark:border-dark-button dark:bg-dark-field dark:text-dark-primary dark:placeholder:text-dark-tertiary dark:focus:border-light"
              />
            </div>

            {/* STYLE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-light-primary dark:text-dark-primary">
                Writing Style
              </label>

              <select
                value={style}
                onChange={(e) =>
                  setStyle(e.target.value)
                }
                className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-light-primary outline-none dark:border-dark-button dark:bg-dark-field dark:text-dark-primary focus:dark:border-light"
              >
                <option value="poetic and emotional">
                  🎭 Poetic & Emotional
                </option>

                <option value="adventurous and energetic">
                  🏔️ Adventurous & Energetic
                </option>

                <option value="friendly and casual">
                  😊 Friendly & Casual
                </option>

                <option value="luxurious and elegant">
                  ✨ Luxury & Elegant
                </option>

                <option value="informative and practical">
                  🧭 Informative & Practical
                </option>
              </select>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              ⚠️ {error}
            </div>
          )}

          {/* GENERATE BUTTON */}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-7 flex w-full items-center justify-center rounded-xl bg-neutral-800 px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-light dark:text-dark dark:hover:bg-dark-secondary"
          >
            {loading
              ? '✨ Creating your travel story...'
              : '✨ Generate Blog Content'}
          </button>
        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="mt-10 flex flex-col items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-zinc-200 border-t-neutral-800 dark:border-dark-button dark:border-t-white" />

            <p className="mt-4 text-sm text-light-secondary dark:text-dark-secondary">
              Crafting your travel story...
            </p>

            <p className="mt-1 text-xs text-light-tertiary dark:text-dark-tertiary">
              Creating places, experiences, food and
              travel tips
            </p>
          </div>
        )}

        {/* ===================================================
            GENERATED BLOG
        =================================================== */}

        {content && !loading && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-dark-button dark:bg-dark-card">
            {/* BLOG HEADER */}

            <div className="border-b border-zinc-200 px-6 py-6 dark:border-dark-button sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-light-tertiary dark:text-dark-tertiary">
                    Your Travel Story
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-light-primary dark:text-dark-primary">
                    Generated Blog Content
                  </h2>
                </div>

                <button
                  onClick={handleCopy}
                  className="rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-semibold text-light-secondary transition hover:bg-zinc-200 dark:border-dark-button dark:bg-dark-field dark:text-dark-secondary dark:hover:bg-dark-button"
                >
                  📋 Copy All
                </button>
              </div>
            </div>

            {/* BLOG BODY */}

            <article className="px-6 py-8 sm:px-10 sm:py-10">
              {/* INTRO INFO */}

              <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-100 p-5 dark:border-dark-button dark:bg-dark-field">
                <div className="flex gap-3">
                  <span className="text-xl">
                    ✨
                  </span>

                  <div>
                    <p className="text-sm font-bold text-light-primary dark:text-dark-primary">
                      Travel Story
                    </p>

                    <p className="mt-1 text-sm leading-6 text-light-secondary dark:text-dark-secondary">
                      A personalized travel story created
                      around your destination and selected
                      writing style.
                    </p>
                  </div>
                </div>
              </div>

              {/* BLOG CONTENT */}

              <div className="blog-content">
                {renderBlog()}
              </div>

              {/* FINAL CTA */}

              <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-100 p-6 text-center dark:border-dark-button dark:bg-dark-field">
                <div className="text-2xl">
                  🌍
                </div>

                <h3 className="mt-2 text-lg font-bold text-light-primary dark:text-dark-primary">
                  Ready for the journey?
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-light-secondary dark:text-dark-secondary">
                  Turn your travel inspiration into a
                  real itinerary with GhumiGumi's AI
                  Trip Planner.
                </p>

                <Link
                  to="/trip-planner"
                  className="mt-5 inline-flex rounded-xl bg-neutral-800 px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-neutral-700 dark:bg-light dark:text-dark dark:hover:bg-dark-secondary"
                >
                  🗺️ Plan This Trip →
                </Link>
              </div>
            </article>
          </div>
        )}
      </main>
    </div>
  );
}

export default BlogGenerator;