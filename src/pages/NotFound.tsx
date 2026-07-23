import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-ivory px-6 text-center">
      <div>
        <p className="label text-gold">Page not found</p>
        <h1 className="mt-5 font-display text-6xl text-plum">Lost among the flowers</h1>
        <p className="mt-5 font-body text-xl text-ink/75">
          We could not find that page. Let us get you back to the blooms.
        </p>
        <Link
          to="/"
          className="label mt-9 inline-flex items-center gap-2 rounded-full bg-rosewood px-8 py-4 text-white transition-colors hover:bg-rosewood-dark"
        >
          Back home <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}
