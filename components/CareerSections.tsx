"use client";

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Career data with most recent first
const careerData = [
  {
    id: 1,
    position: "Senior Cyber Security Engineer",
    company: "Everbridge",
    period: "July 2021 - Present",
    logo: "/companies/everbridge.png",
    description: "As Senior Cyber Security Engineer at Everbridge, I spearheaded the design and implementation of advanced Security Operations and Incident Response (SOAR) capabilities. I led the development of AI-powered agents and chatbots for security automation and threat intelligence, significantly enhancing our proactive defense posture. My work involved building robust automated threat detection systems using Terraform, Kubernetes, and CI/CD pipelines across multiple cloud platforms. I successfully integrated security mechanisms across AWS, Azure, and GCP environments, ensuring FedRAMP accreditation compliance. Additionally, I deployed comprehensive enterprise security solutions and led initiatives to meet rigorous compliance standards.",
    bgGradient: "from-blue-900 to-blue-800"
  },
  {
    id: 2,
    position: "Senior Cyber Security Architect",
    company: "Warner Bros. Discovery",
    period: "July 2021 - September 2024",
    logo: "/companies/Warner_Bros._Discovery.png",
    description: "At Warner Bros. Discovery, I served as the primary security architect for the enterprise, where I designed and implemented robust security frameworks for the organization's digital infrastructure. I specialized in security automation and Infrastructure as Code using Terraform, enabling consistent and scalable security controls. My responsibilities included conducting thorough vulnerability assessments using industry-leading tools like SentinelOne, Brinqa, Nessus, and Splunk. I maintained strict alignment with critical compliance frameworks including NIST, ISO 27001, and SOC 2. Throughout my tenure, I secured complex hybrid cloud environments spanning AWS, Azure, and GCP, while providing executive-level reporting on security posture and risk mitigation strategies.",
    bgGradient: "from-purple-900 to-purple-800"
  },
  {
    id: 3,
    position: "Senior Cyber Security Architect",
    company: "CACI",
    period: "January 2020 - September 2022",
    logo: "/companies/caci.svg",
    description: "While at CACI, I led secure cloud infrastructure development for CBP's mission support directorate (MSD). I architected and implemented a sophisticated GitLab CI/CD pipeline capable of deploying to multiple VPCs and Kubernetes clusters across development, pre-production, and production environments. I integrated Fortify into development IDEs and implemented comprehensive SAST/DAST scanning in GitLab pipelines to identify vulnerabilities early in the development lifecycle. My work included the integration of Aquasec, Nessus, ELK, and Splunk for multi-layered security monitoring and threat detection. I designed an innovative multi-VPC architecture supporting secure microservice deployments, while enforcing security best practices throughout the development process.",
    bgGradient: "from-red-900 to-red-800"
  },
  {
    id: 4,
    position: "Senior Cyber Security Consultant",
    company: "T-Mobile",
    period: "June 2019 - January 2020",
    logo: "/companies/tmobile.svg",
    description: "As a Senior Cyber Security Consultant at T-Mobile, I was responsible for protecting the company's critical 5G infrastructure from RAN sites to subscriber databases. I embedded robust security practices within the DevSecOps lifecycle using Kubernetes, Docker, and CI/CD methodologies. My work involved conducting comprehensive security assessments and secure code reviews utilizing tools such as Tenable, Qualys, OpenVAS, and Fortify. I performed in-depth penetration testing and risk analysis to identify and remediate potential vulnerabilities. A key focus of my role was ensuring compliance with PCI-DSS, SOX, and CCPA regulations. I applied MITRE ATT&CK techniques to harden cloud architecture across AWS, Azure, and GCP platforms, while optimizing firewall configurations and log management through ELK and Splunk implementations.",
    bgGradient: "from-pink-900 to-pink-800"
  },
  {
    id: 5,
    position: "Chief Information Security Officer",
    company: "US Army (UTARNG)",
    period: "August 2016 - June 2019",
    logo: "/companies/army.png",
    description: "As CISO for the US Army (UTARNG), I designed and implemented a sophisticated tier 3 private cloud infrastructure with impressive specifications: 1.5 THz of CPU power, 12 TB of RAM, and 1 PB of storage, supporting over 800 virtual machines. I completely re-architected the datacenter networking infrastructure using Cisco Nexus (7000 series & FEX) equipment. My security initiatives included implementing encrypted VPN pipelines to off-site locations and building a comprehensive threat hunting infrastructure utilizing Bro, Suricata, and Silk, with ELK for CVE monitoring. I managed Nessus with ACAS and conducted regular compliance scans to maintain security standards. I led penetration testing teams and enforced RMF compliance across all systems. One of my key achievements was authoring a Continuity of Operations Plan that ensured 99.99% uptime during outages or disasters.",
    bgGradient: "from-green-900 to-green-800"
  },
  {
    id: 6,
    position: "25 CMF IT Instructor",
    company: "US Army (UTARNG)",
    period: "July 2015 - October 2018",
    logo: "/companies/army.png",
    description: "As a 25 CMF IT Instructor for the US Army (UTARNG), I taught comprehensive courses covering MOS 25B topics including CCNA Routing & Switching, MCSA Server (2008, 2012, 2016), and various cybersecurity certifications including CompTIA Security+, CASP+, and CEH. I managed a robust infrastructure of 8 physical Windows Server 2012 servers in an N-tier design to support training environments. Additionally, I designed and implemented a sophisticated 6-server VMware vSphere cluster capable of supporting over 400 virtual machines for hands-on training scenarios. My role involved developing and delivering technical curriculum that prepared military personnel for both their service duties and civilian IT careers, with a strong emphasis on practical, real-world applications of networking, server administration, and cybersecurity principles.",
    bgGradient: "from-slate-900 to-slate-800"
  }
];

const CareerSections = () => {
  return (
    <section className="py-16">
      {/* Introduction */}
      <div className="container mx-auto px-6 mb-12 md:mb-20">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-center mb-6"
        >
          My Career Journey
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto"
        >
          A chronological overview of my professional experience
        </motion.p>
      </div>
      
      {/* Desktop Timeline View (hidden on mobile) */}
      <div className="hidden md:block container mx-auto px-6">
        <div className="relative">
          {/* Vertical timeline */}
          <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-primary/20 rounded-full" />
          
          {/* Career cards with aligned dots */}
          {careerData.map((career, index) => (
            <div key={career.id} className="relative mb-16">
              {/* Career card */}
              <div className={`flex items-center ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                <div className={`w-[calc(50%-20px)] ${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`p-6 md:p-8 relative rounded-2xl bg-gradient-to-b ${career.bgGradient} shadow-xl text-left`}
                  >
                    {/* Top section with 30/70 split for logo and company info */}
                    <div className="flex mb-6">
                      {/* Logo in upper left - 30% width */}
                      <div className="w-[30%] flex items-start justify-start pr-4">
                        <div className="w-full aspect-square flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl p-3">
                          <Image
                            src={career.logo}
                            alt={career.company}
                            width={80}
                            height={80}
                            priority
                            className="object-contain w-full h-full"
                          />
                        </div>
                      </div>
                      
                      {/* Company info - 70% width */}
                      <div className="w-[70%] text-left">
                        {/* Position title */}
                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">{career.position}</h3>
                        
                        {/* Company name in big bold letters */}
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-white/90 mb-1">{career.company}</h2>
                        
                        {/* Period */}
                        <p className="text-base lg:text-lg text-white/60">{career.period}</p>
                      </div>
                    </div>
                    
                    {/* Bottom section - Experience Overview */}
                    <div className="text-left">
                      <h5 className="text-lg lg:text-xl font-medium text-white mb-4">Experience Overview</h5>
                      <p className="text-white/90 leading-relaxed text-sm lg:text-base">{career.description}</p>
                    </div>
                  </motion.div>
                </div>
                
                {/* Empty space for the other side */}
                <div className="w-[calc(50%-20px)]"></div>
              </div>
              
              {/* Timeline dot with perfectly centered connector line */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 w-6 h-6 rounded-full bg-primary z-10 shadow-lg border-4 border-background flex items-center justify-center">
                {/* Connector line on the left side */}
                {index % 2 === 0 && (
                  <div className="absolute right-full h-[2px] w-[20px] bg-primary" />
                )}
                
                {/* Connector line on the right side */}
                {index % 2 !== 0 && (
                  <div className="absolute left-full h-[2px] w-[20px] bg-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile Stacked Card View (hidden on desktop) */}
      <div className="md:hidden container mx-auto px-4">
        <div className="space-y-8">
          {careerData.map((career, index) => (
            <motion.div
              key={career.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-6 relative rounded-2xl bg-gradient-to-b ${career.bgGradient} shadow-xl text-left`}
            >
              {/* Top section with logo and company info - keep same layout as desktop */}
              <div className="flex mb-6">
                {/* Logo on left - 30% width */}
                <div className="w-[30%] flex items-start justify-start pr-4">
                  <div className="w-full aspect-square flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl p-3">
                    <Image
                      src={career.logo}
                      alt={career.company}
                      width={80}
                      height={80}
                      priority
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
                
                {/* Company info - 70% width */}
                <div className="w-[70%] text-left">
                  {/* Position title */}
                  <h3 className="text-xl font-bold text-white mb-1">{career.position}</h3>
                  
                  {/* Company name */}
                  <h2 className="text-2xl font-extrabold text-white/90 mb-1">{career.company}</h2>
                  
                  {/* Period */}
                  <p className="text-base text-white/60">{career.period}</p>
                </div>
              </div>
              
              {/* Bottom section - Experience Overview */}
              <div className="text-left">
                <h5 className="text-lg font-medium text-white mb-4">Experience Overview</h5>
                <p className="text-white/90 leading-relaxed text-sm">{career.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Contact section */}
      <div className="container mx-auto px-6 mt-16 md:mt-24 text-center">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4 md:mb-6"
        >
          Let's Connect
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto"
        >
          I'm always interested in new opportunities and challenges.
        </motion.p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 md:px-8 py-3 bg-primary text-white rounded-md font-medium"
        >
          Contact Me
        </motion.button>
      </div>
    </section>
  );
};

export default CareerSections; 