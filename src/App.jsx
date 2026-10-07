import { useState } from 'react';
import Hero from './components/Hero.jsx';
import Nav from './components/Nav.jsx';
import { SITE } from './config.js';

function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <button type="button" className="button button-quiet" onClick={copy}>
      {copied ? 'Email copied' : 'Copy email'}
    </button>
  );
}

export default function App() {
  const year = new Date().getFullYear();
  const links = SITE.links.filter((l) => l.href);
  const linkedin = links.find((l) => l.label === 'LinkedIn');
  // Without an email, LinkedIn becomes the main contact button, so don't list it twice.
  const extraLinks = SITE.email ? links : links.filter((l) => l !== linkedin);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav name={SITE.name} />

      <Hero>
        <h1>Hi, I'm {SITE.name}.</h1>
        <p className="hero-role">{SITE.role}</p>
        <p className="hero-intro">{SITE.intro}</p>
        <div className="hero-actions">
          <a className="button" href="#work">See my work</a>
          {linkedin && (
            <a className="button button-quiet" href={linkedin.href} target="_blank" rel="noreferrer">
              View LinkedIn
            </a>
          )}
        </div>
        <ul className="hero-facts">
          {SITE.facts.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </Hero>

      <main id="main" tabIndex={-1}>
        <section className="section" id="work" aria-labelledby="work-title">
          <div className="section-head">
            <h2 id="work-title">Selected work</h2>
            <p>Payment systems I've designed and built.</p>
          </div>
          <ul className="projects">
            {SITE.projects.map((p) => (
              <li key={p.title} className="project">
                <h3>
                  {p.href ? <a href={p.href} target="_blank" rel="noreferrer">{p.title}</a> : p.title}
                </h3>
                <div className="project-body">
                  <p>{p.summary}</p>
                  <ul className="tags" aria-label="Built with">
                    {p.stack.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="section" id="experience" aria-labelledby="experience-title">
          <div className="section-head">
            <h2 id="experience-title">Experience</h2>
            <p>Four years across three fintech companies.</p>
          </div>
          <ol className="timeline">
            {SITE.experience.map((job) => (
              <li key={job.role + job.dates} className="job">
                <p className="job-dates">{job.dates}</p>
                <div className="job-body">
                  <h3>{job.role}</h3>
                  <p className="job-company">{job.company}, {job.place}</p>
                  <p>{job.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section about" id="about" aria-labelledby="about-title">
          <div className="about-text">
            <h2 id="about-title">About me</h2>
            {SITE.about.map((para, i) => <p key={i}>{para}</p>)}
          </div>
          <div className="skills">
            {SITE.skillGroups.map((g) => (
              <div key={g.name} className="skill-group">
                <h3>{g.name}</h3>
                <ul className="tags">
                  {g.items.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-title">
          <div className="contact-inner">
            <h2 id="contact-title">Let's build something reliable</h2>
            {SITE.email ? (
              <>
                <p>Have a role or a project in mind? Email is the fastest way to reach me.</p>
                <a className="contact-main" href={`mailto:${SITE.email}`}>{SITE.email}</a>
                <div className="contact-actions">
                  <CopyEmail email={SITE.email} />
                </div>
              </>
            ) : linkedin ? (
              <>
                <p>Have a role or a project in mind? LinkedIn is the fastest way to reach me.</p>
                <a className="contact-main" href={linkedin.href} target="_blank" rel="noreferrer">
                  Message me on LinkedIn
                </a>
              </>
            ) : null}
            {extraLinks.length > 0 && (
              <ul className="contact-links">
                {extraLinks.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© {year} {SITE.name}</p>
        <a href="#top">Back to top</a>
      </footer>
    </>
  );
}
