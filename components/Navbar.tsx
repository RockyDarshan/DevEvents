'use client'
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import posthog from "posthog-js"
import { Menu, X, User } from "lucide-react"

const Navbar = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const isLoggedIn = typeof window !== 'undefined' ? !!localStorage.getItem('user') : false

  const handleNavClick = (label: string) => {
    posthog.capture('navbar_link_clicked', { label })
    setIsOpen(false)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/create-event", label: "Create Event" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-start w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition text-white">
            <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Image src="/icons/logo.png" alt="logo" width={22} height={22} />
            </div>
            <p className="font-bold text-lg hidden sm:block">CodeRift</p>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 ml-auto">
            <ul className="flex items-center gap-8 list-none">
              {navLinks.map((link) => (
                <li key={link.href} className="list-none">
                  <Link
                    href={link.href}
                    onClick={() => handleNavClick(link.label)}
                    className={`transition-colors font-medium ${
                      isActive(link.href)
                        ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  onClick={() => handleNavClick('Profile')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  <User size={18} />
                  Profile
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => handleNavClick('Login')}
                    className="px-4 py-2 text-white/70 hover:text-white transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => handleNavClick('Sign Up')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10">
            <ul className="flex flex-col gap-4 mt-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => handleNavClick(link.label)}
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      isActive(link.href)
                        ? "bg-blue-500 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  onClick={() => handleNavClick('Profile')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  <User size={18} />
                  Profile
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => handleNavClick('Login')}
                    className="px-4 py-2 text-center text-white/70 hover:text-white transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => handleNavClick('Sign Up')}
                    className="px-4 py-2 text-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar