import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { AlertTriangle, TrendingUp, Shield, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRef } from "react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero / Act 1: The Problem */}
      <HeroSection />
      
      {/* Act 2: The Discovery */}
      <DiscoverySection />
      
      {/* Act 3: The Transformation */}
      <TransformationSection />
      
      {/* Act 4: The Impact */}
      <ImpactSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-slate-900 to-slate-950" />
      
      <div className="container relative z-10 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            You're Managing<br />
            <span className="text-red-400">150 Leases</span>
          </h1>
          
          <motion.p
            className="text-2xl md:text-3xl text-slate-300 mb-6 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Buried in those documents?
          </motion.p>
          
          <motion.div
            className="text-5xl md:text-7xl font-black text-red-500 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
          >
            Over PLN 1M
          </motion.div>
          
          <motion.p
            className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            in missed revenue. Break clauses you didn't catch. Rent reviews you forgot to trigger.
            <br />
            <span className="text-slate-500 italic mt-4 block">It's not your fault—it's the chaos of paper.</span>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-red-600 hover:bg-red-700 text-white"
              asChild
            >
              <a href="#discovery">
                See the Solution <ArrowRight className="ml-2" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-600 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
}

function DiscoverySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="discovery" ref={ref} className="relative py-32 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-transparent" />
      
      <div className="container relative z-10 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            What if AI could read<br />
            <span className="text-blue-400">every clause</span>
          </h2>
          
          <p className="text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Track every deadline, and show you exactly where the money's hiding?
          </p>
          
          <motion.div
            className="text-4xl md:text-5xl font-bold text-blue-400 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Welcome to Instant Clarity
          </motion.div>
          
          <motion.p
            className="text-xl text-slate-400 mb-16"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            150 leases, analyzed in seconds
          </motion.p>
        </motion.div>
        
        {/* Animated stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { label: "Leases Analyzed", value: "150", delay: 0.8 },
            { label: "Portfolio GLA", value: "39,795 m²", delay: 1.0 },
            { label: "Annual Rent", value: "PLN 51M", delay: 1.2 },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: stat.delay, duration: 0.6 }}
            >
              <Card className="p-8 bg-slate-800/50 border-slate-700 backdrop-blur">
                <div className="text-4xl font-black text-blue-400 mb-2">{stat.value}</div>
                <div className="text-slate-400">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TransformationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const findings = [
    {
      icon: AlertTriangle,
      title: "PLN 1.0M Revenue Leakage",
      description: "Indexation gaps and service charge disputes",
      color: "text-red-400",
      bgColor: "bg-red-900/20",
      borderColor: "border-red-800",
    },
    {
      icon: TrendingUp,
      title: "9 Break Options at Risk",
      description: "Expiring in the next 6 months",
      color: "text-orange-400",
      bgColor: "bg-orange-900/20",
      borderColor: "border-orange-800",
    },
    {
      icon: Shield,
      title: "23 Non-Standard Clauses",
      description: "Requiring immediate attention",
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      borderColor: "border-yellow-800",
    },
    {
      icon: Users,
      title: "5.8% Concentration Risk",
      description: "Perfectly balanced portfolio",
      color: "text-green-400",
      bgColor: "bg-green-900/20",
      borderColor: "border-green-800",
    },
  ];

  return (
    <section ref={ref} className="relative py-32 px-4 bg-slate-900/50">
      <div className="container relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Here's What We Found
          </h2>
          <p className="text-2xl text-slate-300">
            Your portfolio, <span className="text-blue-400 font-semibold">decoded</span>
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {findings.map((finding, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.15, duration: 0.6 }}
            >
              <Card className={`p-8 ${finding.bgColor} border-2 ${finding.borderColor} backdrop-blur hover:scale-105 transition-transform duration-300`}>
                <finding.icon className={`w-12 h-12 ${finding.color} mb-4`} />
                <h3 className={`text-2xl font-bold ${finding.color} mb-2`}>{finding.title}</h3>
                <p className="text-slate-300">{finding.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    "Extract 5 critical lease clauses automatically",
    "Track every deadline and break option",
    "Identify revenue leakage in real-time",
    "Monitor tenant concentration risk",
    "Analyze portfolio performance instantly",
  ];

  return (
    <section ref={ref} className="relative py-32 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" />
      
      <div className="container relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Stop Leaving Money<br />
            <span className="text-blue-400">On the Table</span>
          </h2>
          
          <p className="text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
            This is AI-powered lease intelligence—built for asset managers who refuse to miss a single opportunity.
          </p>
          
          <motion.div
            className="mb-16"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="inline-flex flex-col gap-4 text-left">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-lg text-slate-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                >
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            className="text-4xl md:text-5xl font-black text-white mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            Your Portfolio, Decoded.
          </motion.div>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white"
              asChild
            >
              <Link href="/dashboard">
                View Live Demo <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-slate-600 text-slate-300 hover:bg-slate-800"
              asChild
            >
              <Link href="/">
                Upload Your Lease
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative py-12 px-4 border-t border-slate-800">
      <div className="container max-w-6xl mx-auto text-center text-slate-500">
        <p className="mb-4">Lease Extraction Platform</p>
        <p className="text-sm">AI-Powered Commercial Real Estate Analytics</p>
      </div>
    </footer>
  );
}
