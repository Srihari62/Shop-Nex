import React from "react";
import Link from "next/link";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Send,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "All Products", href: "/products" },
      { name: "Special Offers", href: "/offers" },
      { name: "Featured Shops", href: "/shops" },
      { name: "New Arrivals", href: "/products?sort=newest" },
      { name: "Top Rated", href: "/products?sort=popular" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Become a Seller", href: "/seller-registration" },
      { name: "Affiliate Program", href: "/affiliate" },
      { name: "Careers", href: "/careers" },
      { name: "Contact Us", href: "/contact" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Track Order", href: "/track-order" },
      { name: "Shipping Policy", href: "/shipping" },
      { name: "Returns & Refunds", href: "/returns" },
      { name: "FAQs", href: "/faqs" },
    ]
  };

  return (
    <footer className="relative bg-[#0F172A] text-white overflow-hidden">
      {/* ─── Decorative Background Elements ─── */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#47718F] via-[#365870] to-[#47718F]" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#47718F]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#365870]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ─── Service Features ─── */}
      <div className="border-b border-white/5">
        <div className="w-[90%] md:w-[80%] mx-auto py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#47718F]/20 transition-colors duration-500">
                <Truck className="text-[#47718F]" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Free Shipping</h4>
                <p className="text-white/40 text-xs mt-1">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#47718F]/20 transition-colors duration-500">
                <ShieldCheck className="text-[#47718F]" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Secure Payment</h4>
                <p className="text-white/40 text-xs mt-1">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#47718F]/20 transition-colors duration-500">
                <RotateCcw className="text-[#47718F]" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Easy Returns</h4>
                <p className="text-white/40 text-xs mt-1">30 days return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#47718F]/20 transition-colors duration-500">
                <Headphones className="text-[#47718F]" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">24/7 Support</h4>
                <p className="text-white/40 text-xs mt-1">Dedicated help center</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[90%] md:w-[80%] mx-auto pt-12 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <Link href="/" className="inline-block">
                <span className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#47718F] to-[#365870] rounded-lg rotate-12 flex items-center justify-center shadow-lg shadow-[#47718F]/20">
                    <span className="text-white -rotate-12">S</span>
                  </div>
                  SHOP<span className="text-[#47718F]">NEX</span>
                </span>
              </Link>
              <p className="mt-4 text-white/50 text-sm leading-relaxed max-w-sm font-medium">
                Your premium multi-vendor marketplace. Experience the next generation of online shopping with trusted sellers and high-quality products.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <Link 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#47718F] hover:text-white transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-[#47718F] mb-4">Shop</h4>
              <ul className="space-y-4">
                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white/40 hover:text-white text-sm transition-colors duration-300 font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-[#47718F] mb-4">Company</h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white/40 hover:text-white text-sm transition-colors duration-300 font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden md:block">
              <h4 className="font-black text-xs uppercase tracking-widest text-[#47718F] mb-4">Support</h4>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white/40 hover:text-white text-sm transition-colors duration-300 font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-[#47718F] mb-4">Newsletter</h4>
              <p className="text-white/40 text-sm mb-4 font-medium">
                Subscribe to get special offers and once-in-a-lifetime deals.
              </p>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Your Email Address"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm outline-none focus:border-[#47718F] focus:ring-4 focus:ring-[#47718F]/10 transition-all font-medium"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#47718F] text-white rounded-xl flex items-center justify-center hover:bg-[#365870] transition-colors shadow-lg">
                  <Send size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/40">
                <Mail size={16} className="text-[#47718F]" />
                <span className="text-xs font-medium">support@shopnex.com</span>
              </div>
              <div className="flex items-center gap-3 text-white/40">
                <Phone size={16} className="text-[#47718F]" />
                <span className="text-xs font-medium">+1 (234) 567-890</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest">
            © {currentYear} SHOPNEX MARKETPLACE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-white/30 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/30 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-white/30 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
