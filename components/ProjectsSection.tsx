"use client";

import React from 'react';
import { Github } from 'lucide-react';

// Project data
const projects = [
  {
    title: "Enterprise Cloud Security Architecture",
    description: "Designed and implemented secure multi-VPC architecture supporting containerized microservices deployment with comprehensive security controls across AWS, Azure, and GCP.",
    tags: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "CI/CD"],
    githubUrl: "https://github.com/username/cloud-security-architecture",
    liveUrl: "https://example-security.com",
    imageUrl: "/projects/cloud-security.jpg"
  },
  {
    title: "Automated Security Operations Platform",
    description: "Built comprehensive SOAR capabilities with automated threat detection, incident response playbooks, and integration with SIEM solutions for real-time security monitoring.",
    tags: ["Python", "Splunk", "ELK Stack", "GitLab", "Docker", "Ansible"],
    githubUrl: "https://github.com/username/security-automation",
    liveUrl: "https://example-soar.com",
    imageUrl: "/projects/security-ops.jpg"
  },
  {
    title: "Secure DevSecOps Pipeline Implementation",
    description: "Integrated security throughout the CI/CD lifecycle with SAST/DAST tools, container scanning, and automated compliance checks for a FedRAMP-accredited environment.",
    tags: ["GitLab", "Fortify", "Aquasec", "Nessus", "Docker", "Kubernetes"],
    githubUrl: "https://github.com/username/devsecops-pipeline",
    liveUrl: "https://example-devsecops.com",
    imageUrl: "/projects/devsecops.jpg"
  }
];

const ProjectsSection = () => {
  return (
    <section className="py-8 relative z-20">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-2 text-foreground">
            AI Security & Cloud Architecture Projects
          </h2>
          <p className="max-w-[700px] mx-auto text-foreground/80">
            A selection of my enterprise AI security and cloud architecture projects that demonstrate 
            my expertise in building secure, compliant, and resilient infrastructure using zero trust principles and machine learning for threat detection.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project, idx) => (
            <div 
              key={idx} 
              className="bg-card/80 backdrop-blur-lg border border-border/40 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all hover:border-primary/50 hover:bg-card/90 group"
              style={{
                transform: `perspective(1000px) rotateX(${idx % 2 === 0 ? '-2deg' : '1deg'}) rotateY(${idx % 3 === 0 ? '-1deg' : '2deg'})`,
                transformStyle: 'preserve-3d',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div className="h-48 bg-muted/40 flex items-center justify-center overflow-hidden group-hover:bg-muted/50 transition-all">
                <div className="text-muted-foreground transform group-hover:scale-110 transition-transform duration-300">Project Image</div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-foreground/70 text-sm mb-4">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 text-xs rounded-md bg-background/50 backdrop-blur-md text-foreground/90"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-foreground/70 hover:text-foreground transition-colors"
                  >
                    <Github className="h-4 w-4 mr-1" />
                    <span>Code</span>
                  </a>
                  <a 
                    href={project.liveUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/90 transition-colors"
                  >
                    View Live
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection; 