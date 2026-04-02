import { Github, GraduationCap, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  const platformLinks = [
    "Browse Courses",
    "Materials Library",
    "Categories",
    "Instructors",
  ];
  const resourceLinks = ["Documentation", "Help Center", "Community", "Blog"];
  const companyLinks = [
    "About Us",
    "Privacy Policy",
    "Terms of Service",
    "Contact",
  ];

  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">CloudLearn</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Empowering learners worldwide with quality course materials.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2">
              {platformLinks.map((l) => (
                <li key={l}>
                  <span className="text-sm text-white/60 cursor-default">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-2">
              {resourceLinks.map((l) => (
                <li key={l}>
                  <span className="text-sm text-white/60 cursor-default">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((l) => (
                <li key={l}>
                  <span className="text-sm text-white/60 cursor-default">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/50">
            &copy; {year}. Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-white/30">
            CloudLearn — Cloud Computing Project
          </p>
        </div>
      </div>
    </footer>
  );
}
