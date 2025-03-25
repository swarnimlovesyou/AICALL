import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PhoneCall, BarChart3, Shield, Award } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D]">
      <header className="border-b border-gold/30 py-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-6 w-6 text-gold" />
            <h1 className="text-2xl font-serif font-bold gold-gradient">AI Call Analyzer</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-white/80 hover:text-gold transition-colors">
              Features
            </Link>
            <Link href="#benefits" className="text-white/80 hover:text-gold transition-colors">
              Benefits
            </Link>
            <Link href="#contact" className="text-white/80 hover:text-gold transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold/10">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-0"></div>
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 gold-gradient">
                Transform Your Customer Interactions
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-10">
                AI-powered call analysis for insurance agents. Gain insights, improve performance, and enhance customer
                satisfaction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" className="bg-gold hover:bg-gold/90 text-black font-medium">
                    Get Started
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-gold text-gold hover:bg-gold/10">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-black/50">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-16 gold-gradient">
              Powerful Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border border-gold/30 hover:gold-glow transition-shadow">
                <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                  <PhoneCall className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-2">Call Analysis</h3>
                <p className="text-white/70">
                  Automatically transcribe and analyze calls for sentiment, compliance, and key issues.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-gold/30 hover:gold-glow transition-shadow">
                <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-2">Performance Metrics</h3>
                <p className="text-white/70">
                  Track agent performance with detailed metrics and identify areas for improvement.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-gold/30 hover:gold-glow transition-shadow">
                <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-2">Compliance Checks</h3>
                <p className="text-white/70">Ensure all calls meet regulatory requirements and company policies.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 gold-gradient">
                  Elevate Your Customer Service
                </h2>
                <p className="text-white/80 mb-6">
                  Our AI-powered call analysis platform helps insurance companies improve agent performance, ensure
                  compliance, and enhance customer satisfaction.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gold text-sm">✓</span>
                    </div>
                    <span className="text-white/80">Reduce training time by 40%</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gold text-sm">✓</span>
                    </div>
                    <span className="text-white/80">Improve customer satisfaction scores by 25%</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gold text-sm">✓</span>
                    </div>
                    <span className="text-white/80">Ensure 100% compliance with regulations</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-card rounded-lg p-6 border border-gold/30">
                <div className="aspect-video rounded-md bg-black/50 flex items-center justify-center">
                  <Award className="h-16 w-16 text-gold animate-gold-shimmer" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-20 bg-gradient-to-b from-black/50 to-black">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 gold-gradient">
              Ready to Transform Your Call Center?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join leading insurance companies already using our platform to improve agent performance and customer
              satisfaction.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-gold hover:bg-gold/90 text-black font-medium px-8">
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gold/30 py-8 bg-black">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <PhoneCall className="h-5 w-5 text-gold" />
              <span className="text-lg font-serif font-bold gold-gradient">AI Call Analyzer</span>
            </div>
            <div className="text-white/60 text-sm">
              © {new Date().getFullYear()} AI Call Analyzer. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

