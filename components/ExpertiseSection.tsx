"use client";

import React from 'react';
import { 
  ShieldIcon,
  BrainIcon,
  CodeIcon,
  NetworkIcon,
  AlertCircleIcon,
  GlobeIcon,
  BotIcon,
  HardDriveIcon,
  KeyIcon
} from 'lucide-react';

// Define the expertise data to be used
const expertiseItems = [
  {
    icon: <ShieldIcon className="h-10 w-10 text-primary" />,
    title: "Cloud Security Architecture",
    description: "Designing zero trust architecture and implementing secure cloud infrastructure on AWS, Azure, and GCP with FedRAMP-accredited solutions and compliance controls."
  },
  {
    icon: <BrainIcon className="h-10 w-10 text-secondary" />,
    title: "AI Engineering & Machine Learning",
    description: "Building AI-driven solutions and agent workflows with machine learning expertise for enhanced threat detection, predictive analytics, and automated decision-making systems."
  },
  {
    icon: <GlobeIcon className="h-10 w-10 text-accent" />,
    title: "Full Stack Development",
    description: "Developing modern web applications using React, Next.js, Node.js and cloud-native architectures with CI/CD pipelines, microservices, and containerization."
  },
  {
    icon: <CodeIcon className="h-10 w-10 text-primary" />,
    title: "Security Automation & DevSecOps",
    description: "Integrating security throughout CI/CD pipelines with SAST/DAST tools, container security, and automated vulnerability management using Terraform and GitLab/GitHub Actions."
  },
  {
    icon: <AlertCircleIcon className="h-10 w-10 text-secondary" />,
    title: "Threat Detection & Incident Response",
    description: "Building AI-driven threat hunting infrastructure using Splunk, ELK Stack, SentinelOne, and MITRE ATT&CK frameworks for advanced cyber defense."
  },
  {
    icon: <NetworkIcon className="h-10 w-10 text-accent" />,
    title: "Enterprise Network Security",
    description: "Implementing secure network architectures with Cisco Nexus, firewall rules, IDS/IPS, VPN gateways, and Zscaler solutions for comprehensive protection."
  },
  {
    icon: <KeyIcon className="h-10 w-10 text-primary" />,
    title: "Compliance & Risk Management",
    description: "Ensuring alignment with frameworks including NIST, ISO 27001, SOC 2, PCI-DSS, CCPA, and implementing RMF controls with automated compliance monitoring."
  },
  {
    icon: <HardDriveIcon className="h-10 w-10 text-secondary" />,
    title: "Infrastructure Optimization",
    description: "Designing and managing high-performance private clouds, virtualization environments with VMware, and enterprise-grade datacenter architecture."
  },
  {
    icon: <BotIcon className="h-10 w-10 text-accent" />,
    title: "Secure AI Integration & Alignment",
    description: "Implementing responsible AI principles with secure guardrails, ensuring data privacy, ethical AI deployment, and integration of large language models into enterprise security frameworks."
  }
];

const ExpertiseSection = () => {
  return (
    <section className="pt-8 relative z-20">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-2 text-foreground">
            My Expertise as an AI Engineer & Cybersecurity Architect
          </h2>
          <p className="max-w-[800px] mx-auto text-foreground/80">
            As a CISSP-certified Cybersecurity Architect and AI Engineer with over 10 years of experience, 
            I specialize in building secure cloud infrastructure, AI-driven security solutions, and full stack 
            applications that protect critical systems and data. My expertise spans machine learning, zero trust architecture, 
            and automated security operations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {expertiseItems.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-card/80 backdrop-blur-lg border border-border/40 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all hover:border-primary/50 hover:bg-card/90 group"
              style={{
                transform: `perspective(1000px) rotateX(${idx % 2 === 0 ? '2deg' : '-1deg'}) rotateY(${idx % 3 === 0 ? '1deg' : '-2deg'})`,
                transformStyle: 'preserve-3d',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-foreground/70 text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertiseSection; 