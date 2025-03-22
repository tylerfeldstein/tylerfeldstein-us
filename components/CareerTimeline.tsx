"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, MotionValue } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useInView } from 'react-intersection-observer';
import confetti from 'canvas-confetti';

// Career data from resume in reverse chronological order (most recent first)
const careerData = [
  {
    id: 1,
    title: "Senior Cyber Security Engineer",
    company: "Everbridge",
    period: "July 2021 – Present",
    highlights: [
      "Architected and automated Security Operations and Incident Response (SOAR) capabilities.",
      "Integrated security automation in CI/CD environments across AWS, Azure, and GCP (FedRAMP-accredited).",
      "Built automated threat detection, incident response playbooks, and IaC solutions using Terraform, Kubernetes, and GitLab/GitHub Actions.",
      "Deployed Zscaler VPN for enhanced secure remote access and enterprise network security.",
      "Led efforts to improve endpoint protection, IDS/IPS, SIEM integrations, and compliance."
    ]
  },
  {
    id: 2,
    title: "Senior Cyber Security Architect",
    company: "WBD",
    period: "July 2021 – September 2024",
    highlights: [
      "Primary security architect for Warner Bros. Discovery.",
      "Enforced secure configuration policies and implemented security automation and IaC (Terraform).",
      "Conducted regular audits, vulnerability assessments (SentinelOne, Brinqa, Nessus, Splunk).",
      "Designed and implemented firewall rules, IDS, VPN gateways.",
      "Maintained alignment with compliance frameworks: NIST, ISO 27001, SOC 2.",
      "Led threat modeling and security reviews; automated processes using Python and Bash.",
      "Provided executive-level reporting; secured hybrid cloud environments (AWS, Azure, GCP)."
    ]
  },
  {
    id: 3,
    title: "Senior Cyber Security Architect",
    company: "CACI",
    period: "January 2020 – September 2022",
    highlights: [
      "Led secure cloud infrastructure development for CBP's mission support directorate (MSD).",
      "Built GitLab CI/CD pipeline pushing to multiple VPCs/Kubernetes clusters (DEV, PRE-PROD, PROD).",
      "Implemented Fortify on dev IDEs and integrated SAST/DAST in GitLab pipelines.",
      "Integrated Aquasec, Nessus, ELK, and Splunk for layered security and monitoring.",
      "Designed multi-VPC architecture supporting secure microservice deployments.",
      "Enforced early-stage security practices across the development lifecycle."
    ]
  },
  {
    id: 4,
    title: "Senior Cyber Security Consultant",
    company: "T-Mobile (Contract)",
    period: "June 2019 – January 2020",
    highlights: [
      "Protected T-Mobile's 5G infrastructure from RAN sites to subscriber databases.",
      "Embedded security in DevSecOps lifecycle using Kubernetes, Docker, and CI/CD.",
      "Conducted security assessments and secure code reviews (Tenable, Qualys, OpenVAS, Fortify).",
      "Performed penetration testing and risk analysis.",
      "Ensured PCI-DSS, SOX, and CCPA compliance.",
      "Applied MITRE ATT&CK techniques; hardened cloud architecture (AWS, Azure, GCP).",
      "Optimized firewall and log management with ELK and Splunk."
    ]
  },
  {
    id: 5,
    title: "Chief Information Security Officer",
    company: "US Army (UTARNG)",
    period: "August 2016 – June 2019",
    highlights: [
      "Designed tier 3 private cloud (1.5 THz CPU, 12 TB RAM, 1 PB storage, 800+ VMs).",
      "Re-architected datacenter networking using Cisco Nexus (7000 series & FEX).",
      "Implemented encrypted VPN pipelines to off-site locations.",
      "Built threat hunting infrastructure with Bro, Suricata, Silk; used ELK for CVE monitoring.",
      "Managed Nessus with ACAS, conducted regular compliance scans.",
      "Led pentesting teams and enforced RMF compliance.",
      "Authored COOP ensuring 99.99% uptime during outages or disasters."
    ]
  },
  {
    id: 6,
    title: "25 CMF IT Instructor",
    company: "US Army (UTARNG)",
    period: "July 2015 – October 2018",
    highlights: [
      "Taught MOS 25B topics including CCNA Routing & Switching, MCSA Server, and CompTIA certs.",
      "Managed 8 physical Windows Server 2012 servers in N-tier design.",
      "Designed 6-server VMware vSphere cluster with 400+ VMs."
    ]
  }
];

const CareerCard = ({ data, progress }: { data: typeof careerData[0], progress: MotionValue<number> }) => {
  return (
    <motion.div
      className="flex items-center justify-center h-screen w-full absolute inset-0"
      style={{ 
        opacity: progress,
        pointerEvents: "auto"
      }}
    >
      <Card className="w-full max-w-3xl mx-auto border-border backdrop-blur-sm bg-card/95 shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <CardTitle className="text-3xl font-bold text-foreground">{data.title}</CardTitle>
              <p className="text-xl text-primary mt-1">{data.company}</p>
            </div>
            <Badge variant="outline" className="text-lg text-muted-foreground border-border font-medium">
              {data.period}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-4 text-foreground/90">
            {data.highlights.map((highlight, idx) => (
              <motion.li 
                key={idx}
                className="text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1,
                  x: 0
                }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
              >
                {highlight}
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CareerTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [headerRef, headerInView] = useInView({
    threshold: 0.5,
    triggerOnce: false
  });

  // Calculate progress for each card based on scroll position
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Progress values for each career card
  const card1Progress = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const card2Progress = useTransform(scrollYProgress, [0.1, 0.2, 0.3], [0, 1, 0]);
  const card3Progress = useTransform(scrollYProgress, [0.2, 0.3, 0.4], [0, 1, 0]);
  const card4Progress = useTransform(scrollYProgress, [0.3, 0.4, 0.5], [0, 1, 0]);
  const card5Progress = useTransform(scrollYProgress, [0.4, 0.5, 0.6], [0, 1, 0]);
  const card6Progress = useTransform(scrollYProgress, [0.5, 0.6, 0.7], [0, 1, 0]);
  const cardProgressValues = [
    card1Progress, card2Progress, card3Progress, 
    card4Progress, card5Progress, card6Progress
  ];

  // Header animations
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05, 0.1], [1, 1, 0]);
  
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (progress) => {
      // Trigger confetti when nearing end
      if (progress > 0.65 && !hasTriggeredConfetti) {
        setHasTriggeredConfetti(true);
        triggerConfetti();
      } else if (progress < 0.6 && hasTriggeredConfetti) {
        setHasTriggeredConfetti(false);
      }
    });
    
    return () => unsubscribe();
  }, [scrollYProgress, hasTriggeredConfetti]);
  
  const triggerConfetti = () => {
    // Only import and use confetti on client
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default;
        
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
        
        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }
        
        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();
          
          if (timeLeft <= 0) {
            return clearInterval(interval);
          }
          
          const particleCount = 50 * (timeLeft / duration);
          
          // since particles fall down, start a bit higher than random
          confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
          }));
          confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
          }));
        }, 250);
      });
    }
  };

  return (
    <div className="relative bg-background" ref={containerRef}>
      {/* Sticky title header */}
      <motion.div 
        ref={headerRef}
        style={{ opacity: headerOpacity }}
        className="sticky top-0 z-10 h-screen w-full flex flex-col items-center justify-center"
      >
        <div className="text-center max-w-xl mx-auto px-4">
          <h2 className="text-5xl font-bold tracking-tight text-foreground mb-4">
            My Career Journey
          </h2>
          <p className="text-xl text-muted-foreground">
            Scroll to explore my professional history in cybersecurity and cloud infrastructure.
          </p>
          <div className="mt-8 flex justify-center">
            <motion.div 
              initial={{ y: 0 }}
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Career cards - each takes up full viewport height */}
      {careerData.map((career, index) => (
        <CareerCard
          key={career.id}
          data={career}
          progress={cardProgressValues[index]}
        />
      ))}

      {/* Spacer to ensure we have enough scroll room */}
      <div className="h-screen"></div>
    </div>
  );
};

export default CareerTimeline; 