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
  CodeIcon
} from 'lucide-react';

// Define the expertise data to be used
const expertiseItems = [
  {
    icon: <BrainIcon className="h-10 w-10 text-primary" />,
    title: "AI Engineering",
    description: "Building intelligent systems using LLMs, vector databases, and RAG architectures. Expertise in AI application design and implementation."
  },
  {
    icon: <CodeIcon className="h-10 w-10 text-secondary" />,
    title: "Full-Stack Development",
    description: "Creating robust web applications with React, TypeScript, Next.js, and modern backend technologies."
  },
  {
    icon: <ServerIcon className="h-10 w-10 text-accent" />,
    title: "Backend Architecture",
    description: "Designing scalable microservices and APIs using Node.js, Python, and containerization technologies."
  },
  {
    icon: <CloudIcon className="h-10 w-10 text-primary" />,
    title: "Cloud Solutions",
    description: "Implementing and optimizing cloud infrastructure on AWS, Azure, and GCP with focus on serverless architectures."
  },
  {
    icon: <DatabaseIcon className="h-10 w-10 text-secondary" />,
    title: "Data Engineering",
    description: "Building data pipelines, implementing vector databases, and designing efficient storage solutions for AI applications."
  },
  {
    icon: <ActivityIcon className="h-10 w-10 text-accent" />,
    title: "DevOps & MLOps",
    description: "Setting up CI/CD pipelines and production ML workflows to streamline development and deployment processes."
  },
];

const ExpertiseSection = () => {
  return (
    <section className="py-16 bg-background dark:bg-background/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-2 text-foreground">
            My Expertise
          </h2>
          <p className="max-w-[700px] mx-auto text-foreground/80">
            With extensive experience in AI engineering and full-stack development, I specialize in 
            building AI-powered applications that combine cutting-edge technologies with robust engineering principles.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {expertiseItems.map((item, idx) => (
            <div key={idx} className="bg-card border border-border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
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