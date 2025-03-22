"use client";

import React from 'react';
import { Github } from 'lucide-react';

// Project data
const projects = [
  {
    title: "AI Document Assistant",
    description: "An intelligent document processing system using RAG architecture, vector databases, and LLMs to provide accurate answers from company documentation.",
    tags: ["Next.js", "TypeScript", "OpenAI", "Vector DB", "Tailwind"],
    githubUrl: "https://github.com/username/ai-document-assistant",
    liveUrl: "https://example-ai-docs.com",
    imageUrl: "/projects/ai-assistant.jpg"
  },
  {
    title: "ML-Powered Analytics Platform",
    description: "An analytics dashboard that uses machine learning to predict trends and provide actionable insights from business data.",
    tags: ["React", "Python", "TensorFlow", "D3.js", "FastAPI"],
    githubUrl: "https://github.com/username/ml-analytics",
    liveUrl: "https://example-ml-analytics.com",
    imageUrl: "/projects/ml-analytics.jpg"
  },
  {
    title: "AI Content Generator",
    description: "A content creation platform that leverages natural language processing to help marketers generate high-quality copy, blog posts, and social media content.",
    tags: ["React", "Node.js", "GPT-4", "MongoDB", "AWS"],
    githubUrl: "https://github.com/username/ai-content-generator",
    liveUrl: "https://example-content-gen.com",
    imageUrl: "/projects/content-gen.jpg"
  }
];

const ProjectsSection = () => {
  return (
    <section className="py-16 bg-background dark:bg-background/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-2 text-foreground">
            Featured Projects
          </h2>
          <p className="max-w-[700px] mx-auto text-foreground/80">
            A selection of my innovative AI and full-stack projects that demonstrate 
            my expertise in building intelligent, scalable applications that solve real-world problems.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-muted flex items-center justify-center">
                <div className="text-muted-foreground">Project Image</div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {project.title}
                </h3>
                <p className="mb-4 text-muted-foreground">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 text-xs rounded-md bg-background/30 text-foreground/70"
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