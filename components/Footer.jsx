import { Github, Linkedin, Mail, FileText } from 'lucide-react';
import PillLink from '@/components/ui/PillLink';

export default function Footer({ links }) {
  return (
    <footer className="border-t dark:border-slate-800 py-10 mt-10">
      <div className="section-container flex items-center justify-between">
        <p className="text-sm opacity-70">
          © {new Date().getFullYear()} Sean P. May. All rights reserved.
        </p>
        <div className="flex gap-3">
          <PillLink href={links.github} icon={Github} external>
            GitHub
          </PillLink>
          <PillLink href={links.linkedin} icon={Linkedin} external>
            LinkedIn
          </PillLink>
          <PillLink href={links.email} icon={Mail}>
            Email
          </PillLink>
          <PillLink href={links.resume} icon={FileText} external variant="solid">
            Resume
          </PillLink>
        </div>
      </div>
    </footer>
  );
}

