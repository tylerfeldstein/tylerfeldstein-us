"use client";

import React from 'react';
import { 
  ActivityIcon, 
  ServerIcon, 
  SmartphoneIcon,
  DatabaseIcon,
  CloudIcon,
  ShieldIcon,
  BrainIcon,
  CodeIcon,
  LockIcon,
  NetworkIcon,
  AlertCircleIcon,
  CommandIcon
} from 'lucide-react';

// Define the expertise data to be used
const expertiseItems = [
  {
    icon: <ShieldIcon className="h-10 w-10 text-primary" />,
    title: "Cloud Security Architecture",
    description: "Designing and implementing secure cloud infrastructure on AWS, Azure, and GCP with FedRAMP-accredited solutions and compliance controls."
  },
  {
    icon: <CodeIcon className="h-10 w-10 text-secondary" />,
    title: "Security Automation",
    description: "Building automated security operations and incident response capabilities using CI/CD, IaC with Terraform, and GitLab/GitHub Actions."
  },
  {
    icon: <NetworkIcon className="h-10 w-10 text-accent" />,
    title: "Network Security",
    description: "Implementing secure network designs with Cisco Nexus, firewall rules, IDS/IPS, and secure VPN gateways for enterprise environments."
  },
  {
    icon: <CloudIcon className="h-10 w-10 text-primary" />,
    title: "DevSecOps",
    description: "Integrating security throughout CI/CD pipelines with SAST/DAST tools, container security, and automated vulnerability management."
  },
  {
    icon: <AlertCircleIcon className="h-10 w-10 text-secondary" />,
    title: "Threat Detection & Response",
    description: "Building threat hunting infrastructure with tools like Splunk, ELK Stack, SentinelOne, and MITRE ATT&CK frameworks."
  },
  {
    icon: <CommandIcon className="h-10 w-10 text-accent" />,
    title: "Compliance & Risk Management",
    description: "Ensuring alignment with frameworks including NIST, ISO 27001, SOC 2, PCI-DSS, and implementing RMF controls."
  },
];

const ExpertiseSection = () => {
  return (
    <section className="py-8 relative z-20">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-2 text-foreground">
            My Expertise
          </h2>
          <p className="max-w-[700px] mx-auto text-foreground/80">
            With over 10 years of experience in cybersecurity, I specialize in 
            architecting secure cloud infrastructure and implementing robust security automation
            to protect critical systems and data.
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
              <p className="text-muted-foreground">
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