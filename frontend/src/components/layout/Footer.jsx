import { Facebook, HandHeart, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/about", label: "About" },
  { to: "/#how-it-works", label: "How It Works" },
  { to: "/verify-donation", label: "Verify Donation" },
  { to: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <HandHeart size={18} />
              </span>
              <span className="text-lg font-bold text-primary">অর্পণ</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-600">
              Transparent Donations, Trusted Impact.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Quick Links</h3>
            <div className="mt-3 space-y-2">
              {footerLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="block text-sm text-slate-600 transition hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Social</h3>
            <div className="mt-3 flex items-center gap-3 text-slate-600">
              <a href="#" className="rounded-full border border-slate-200 p-2 hover:text-primary">
                <Facebook size={16} />
              </a>
              <a href="#" className="rounded-full border border-slate-200 p-2 hover:text-primary">
                <Instagram size={16} />
              </a>
              <a href="#" className="rounded-full border border-slate-200 p-2 hover:text-primary">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
          © 2026 Orpon. Made with ❤️ in Bangladesh
        </div>
      </div>
    </footer>
  );
}
