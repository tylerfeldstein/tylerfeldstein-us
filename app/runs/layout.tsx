import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AI Projects | Tyler Feldstein - AI Engineer & Cybersecurity Architect",
  description: "Explore AI security projects demonstrating machine learning for threat detection, cloud security automation, and zero trust architecture implementations.",
  keywords: "AI Projects, Machine Learning, Threat Detection, Cloud Security Automation, Zero Trust Architecture, AI Security, Cybersecurity Projects",
  openGraph: {
    title: "AI Projects | Tyler Feldstein - AI Engineer & Cybersecurity Architect",
    description: "Explore AI security projects demonstrating machine learning for threat detection, cloud security automation, and zero trust architecture implementations.",
    url: "https://tylerfeldstein.com/runs",
    type: "website",
  },
  twitter: {
    title: "AI Projects | Tyler Feldstein - AI Engineer & Cybersecurity Architect",
    description: "Explore AI security projects demonstrating machine learning for threat detection, cloud security automation, and zero trust architecture implementations.",
    card: "summary_large_image",
  }
};

export default function RunsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 