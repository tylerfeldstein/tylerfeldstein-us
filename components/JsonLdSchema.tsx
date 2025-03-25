import React from 'react';

interface JsonLdProps {
  data: Record<string, unknown>;
}

const JsonLdSchema: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export const createPersonSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Tyler Feldstein',
    jobTitle: 'AI Engineer & Cybersecurity Architect',
    description: 'AI security expert with expertise in machine learning, threat detection, and cloud security architecture.',
    url: 'https://tylerfeldstein.com',
    image: 'https://tylerfeldstein.com/photos/DSC00379-min.JPG',
    sameAs: [
      'https://github.com/tylerfeldstein',
      'https://www.linkedin.com/in/tylerfeldstein',
    ],
    knowsAbout: [
      'AI Engineering',
      'Cybersecurity Architecture',
      'Machine Learning',
      'Cloud Security',
      'Zero Trust Architecture',
      'AWS',
      'Azure',
      'GCP',
      'CISSP',
      'DevSecOps'
    ],
    skills: [
      'AI Engineering',
      'Cybersecurity Architecture',
      'Machine Learning',
      'Cloud Security',
      'Zero Trust Architecture',
      'AWS',
      'Azure',
      'GCP',
      'CISSP',
      'DevSecOps'
    ],
    alumniOf: [
      {
        '@type': 'CollegeOrUniversity',
        name: 'Your University' // Replace with actual data
      }
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Your Company' // Replace with actual data
    }
  };
};

export const createWebsiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tyler Feldstein - AI Engineer & Cybersecurity Architect',
    url: 'https://tylerfeldstein.com',
    description: 'AI security expert with expertise in machine learning, threat detection, and cloud security architecture.',
    author: {
      '@type': 'Person',
      name: 'Tyler Feldstein'
    },
    keywords: 'AI Engineer, Cybersecurity Architect, AI Security Expert, Machine Learning Engineer, Cloud Security Specialist, Zero Trust Architect, CISSP',
  };
};

export default JsonLdSchema; 