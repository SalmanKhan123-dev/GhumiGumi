import { Link } from 'react-router-dom';
import AppIcon from '@/assets/svg/app-icon.svg';
import GitHub_Icon from '@/assets/svg/github.svg';

function footer() {
  const newDate = new Date();
  const year = newDate.getFullYear();

  return (
    <footer className="mt-10 bg-zinc-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <img src={AppIcon} className="h-8 w-8" alt="GhumiGumi logo" />
              <span className="text-lg font-semibold">GhumiGumi</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Stories, guides, and AI-powered tools to help you plan your next journey.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/" className="transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/trip-planner" className="transition-colors hover:text-white">
                  AI Trip Planner
                </Link>
              </li>
              <li>
                <Link to="/destination-recommender" className="transition-colors hover:text-white">
                  Destination Finder
                </Link>
              </li>
              <li>
                <Link to="/blog-generator" className="transition-colors hover:text-white">
                  AI Blog Writer
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
              Account
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/signin" className="transition-colors hover:text-white">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="transition-colors hover:text-white">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/add-blog" className="transition-colors hover:text-white">
                  Write a Post
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
              Connect
            </h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>
                <a
                  href="https://github.com/SalmanKhan123-dev/GhumiGumi-WebDev-Project.git"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  <img src={GitHub_Icon} className="h-4 w-4" alt="GitHub" />
                  Report an issue
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/salmankhancse"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-white"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-800 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>&copy; {year} GhumiGumi. All rights reserved.</p>
          <p>Built for travelers, by travelers.</p>
        </div>
      </div>
    </footer>
  );
}

export default footer;
