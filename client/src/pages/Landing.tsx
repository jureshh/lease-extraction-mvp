import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { AlertTriangle, TrendingUp, Shield, Users, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <HeroSection />
      <DiscoverySection />
      <TransformationSection />
      <ImpactSection />
      <Footer />
    </div>
  );
}

function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/95 to-slate-950 z-10" />
        <img 
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663312694766/tSLkOfSGQwZgENgD.jpg" 
          alt="Shopping mall interior"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      
      <div className="container relative z-20 max-w-5xl mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="text-slate-400 text-xl mb-4">150 Leases</div>
          
          <motion.div
            className="text-7xl md:text-9xl font-black text-red-500 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
          >
            PLN 1M+
          </motion.div>
          
          <motion.p
            className="text-3xl md:text-4xl text-slate-300 mb-16"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Hidden Revenue
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-red-600 hover:bg-red-700 text-white"
              asChild
            >
              <a href="#discovery">
                Discover How <ArrowRight className="ml-2" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
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
      {/* Background with dashboard preview */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 z-10" />
        <img 
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663312694766/GoklxSsgaFXOvfse.webp" 
          alt="Real estate dashboard"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      <div className="container relative z-20 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="text-blue-400 text-2xl mb-4">AI-Powered Intelligence</div>
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
            Instant Clarity
          </h2>
        </motion.div>
        
        {/* Animated stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { value: "150", label: "Leases", delay: 0.4 },
            { value: "39,795 m²", label: "Portfolio", delay: 0.6 },
            { value: "Seconds", label: "Analysis Time", delay: 0.8 },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: stat.delay, duration: 0.6 }}
            >
              <Card className="p-8 bg-slate-800/50 border-slate-700 backdrop-blur text-center">
                <div className="text-5xl font-black text-blue-400 mb-2">{stat.value}</div>
                <div className="text-slate-400 text-lg">{stat.label}</div>
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
      value: "PLN 1.0M",
      label: "Revenue Leakage",
      color: "text-red-400",
      bgColor: "bg-red-900/20",
      borderColor: "border-red-800",
    },
    {
      icon: TrendingUp,
      value: "9",
      label: "Break Options at Risk",
      color: "text-orange-400",
      bgColor: "bg-orange-900/20",
      borderColor: "border-orange-800",
    },
    {
      icon: Shield,
      value: "23",
      label: "Non-Standard Clauses",
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      borderColor: "border-yellow-800",
    },
    {
      icon: Users,
      value: "5.8%",
      label: "Concentration Risk",
      color: "text-green-400",
      bgColor: "bg-green-900/20",
      borderColor: "border-green-800",
    },
  ];

  return (
    <section ref={ref} className="relative py-32 px-4">
      {/* Background with mall aerial view */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/98 to-slate-950 z-10" />
        <img 
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663312694766/qkFfhhWNtIqzfrud.jpg" 
          alt="Shopping center aerial view"
          className="w-full h-full object-cover opacity-15"
        />
      </div>
      
      <div className="container relative z-20 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-4">
            What We Find
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {findings.map((finding, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.15, duration: 0.6 }}
            >
              <Card className={`p-10 ${finding.bgColor} border-2 ${finding.borderColor} backdrop-blur hover:scale-105 transition-transform duration-300 text-center`}>
                <finding.icon className={`w-16 h-16 ${finding.color} mb-6 mx-auto`} />
                <div className={`text-6xl font-black ${finding.color} mb-4`}>{finding.value}</div>
                <div className="text-slate-300 text-xl">{finding.label}</div>
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

  return (
    <section ref={ref} className="relative py-32 px-4">
      {/* Background with dashboard */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/98 to-slate-950 z-10" />
        <img 
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663312694766/tERIOLqoutAihwDM.webp" 
          alt="Analytics dashboard"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      <div className="container relative z-20 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
            Your Portfolio
          </h2>
          
          <motion.div
            className="text-6xl md:text-8xl font-black text-blue-400 mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Decoded
          </motion.div>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="text-xl px-10 py-7 bg-blue-600 hover:bg-blue-700 text-white"
              asChild
            >
              <Link href="/upload">
                View Live Demo <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-xl px-10 py-7 border-2 border-slate-600 text-slate-300 hover:bg-slate-800"
              asChild
            >
              <Link href="/upload">
                Upload Lease
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
        <p className="mb-4 text-lg">Lease Extraction Platform</p>
        <p className="text-sm">AI-Powered Commercial Real Estate Analytics</p>
      </div>
    </footer>
  );
}
