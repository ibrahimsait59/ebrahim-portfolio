"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CopyLink } from "./copy-link";
import qaData from "../data/qa.json";

/* ─── data ─── */

type Token = { text: string; cls?: string };

const skills = [
  { label: "Gen AI", items: "Gemini API, Chatbot Development, Conversational AI, Prompt Engineering" },
  { label: "RAG & Agents", items: "LangChain, FAISS, Vector Databases, Agentic Workflows" },
  { label: "Automation", items: "n8n, Python, JavaScript, Google Workspace, Notion" },
  { label: "Marketing", items: "Digital Marketing, Content Writing, SEO, Social Media Strategy" },
  { label: "Languages", items: "Python, JavaScript, HTML, CSS" },
];

const projects = [
  { name: "personal-knowledge-assistant", desc: "RAG system with LangChain, FAISS, and Gemini API", stars: 12 },
  { name: "cold-email-classifier", desc: "Agentic n8n pipeline for automated email triage", stars: 8 },
  { name: "mental-health-support-chatbot", desc: "Conversational Flash chatbot with crisis detection", stars: 15 },
  { name: "interactive-lesson-modules", desc: "Dynamic prompt-powered content generation platform", stars: 10 },
];

const contacts = [
  { label: "linkedin", value: "ebrahim-sait", href: "https://www.linkedin.com/in/ebrahim-sait/" },
  { label: "email   ", value: "ibrahimsait59@gmail.com", href: "mailto:ibrahimsait59@gmail.com" },
  { label: "phone   ", value: "+91 95384 00457", href: "tel:+919538400457" },
  { label: "resume  ", value: "download (pdf)", href: "/resume.pdf", download: true },
];

const bioTokens: Token[] = [
  { text: "Computer Science Engineering graduate turned " },
  { text: "Agentic AI & Gen AI Engineer", cls: "text-accent" },
  { text: ". Most recently Founder\u2019s Office Associate at " },
  { text: "KUN International", cls: "text-accent" },
  { text: ", a London-based family office, where he handled digital marketing, content strategy, and cross-functional operations. Before that, AI Integration Lead at " },
  { text: "Khayal", cls: "text-accent" },
  { text: ", where he drove 20% team efficiency gains by building " },
  { text: "n8n", cls: "text-accent" },
  { text: " automation pipelines, integrating AI into production workflows, and shipping internal tools. Now focused on " },
  { text: "RAG architectures", cls: "text-accent" },
  { text: ", agentic pipeline design, and bridging the gap between " },
  { text: "AI engineering", cls: "text-accent" },
  { text: " and business growth." },
];

const education = [
  {
    degree: "B.E. in Computer Science Engineering",
    institution: "Acharya Institute of Technology, Bengaluru"
  }
];

const certifications = [
  { name: "Google AI Essentials", details: "Coursera Website" },
  { name: "Agentic AI and Generative AI", details: "LearnersBytes Website (2026)" },
  { name: "Google Data Analytics Certificate", details: "Coursera Website" },
  { name: "HubSpot Digital Marketing", details: "HubSpot Website" }
];

const leadership = [
  {
    role: "Head and Co-Founder",
    org: "Giant Leap Youth Nonprofit, Bengaluru",
    period: "2023 – Present",
    desc: "Lead a youth nonprofit focused on public speaking and leadership development. Successfully executed three full-scale events as the organization head."
  },
  {
    role: "Vice Team Lead",
    org: "Comic Con Bangalore",
    period: "2025",
    desc: "Served as Vice Team Head for a dedicated squad, managing coordination and on-ground execution in a large-scale public event environment."
  },
  {
    role: "Core Staff Member",
    org: "The United Foundation (TUF) NGO, Bengaluru",
    period: "2022 – Present",
    desc: "Active staff since 2022, contributing to grassroots community programs and social impact initiatives."
  }
];

/* ─── section definitions ─── */

type BodyKind = "hero" | "bio" | "education" | "skills" | "certifications" | "projects" | "leadership" | "contact";

type SectionDef = {
  id: string;
  prompt: string;
  tools: string[];
  bodyKind: BodyKind;
  bodySteps: number;
};

const sectionDefs: SectionDef[] = [
  { id: "who", prompt: "who is ebrahim?", tools: ["Reading profile.md", "Loading ebrahim.jpeg", "Resolving location"], bodyKind: "hero", bodySteps: 5 },
  { id: "bg", prompt: "tell me more about his background", tools: ["Reading bio.md", "Compiling highlights"], bodyKind: "bio", bodySteps: bioTokens.length },
  { id: "education", prompt: "cat education.txt", tools: ["Reading education.txt", "Extracting degrees"], bodyKind: "education", bodySteps: education.length },
  { id: "skills", prompt: "cat skills.txt", tools: ["Reading skills.json", "Parsing skills.json", "Sorting by relevance"], bodyKind: "skills", bodySteps: skills.length },
  { id: "certifications", prompt: "cat certifications.txt", tools: ["Reading certifications.json", "Verifying credentials"], bodyKind: "certifications", bodySteps: certifications.length },
  { id: "projects", prompt: "ls projects/", tools: ["Fetching projects from GitHub\u2026", "Loading metadata", "Sorting by stars"], bodyKind: "projects", bodySteps: projects.length },
  { id: "leadership", prompt: "cat leadership.txt", tools: ["Reading community_work.md", "Loading impact metrics"], bodyKind: "leadership", bodySteps: leadership.length },
  { id: "contact", prompt: "cat contact.txt", tools: ["Reading contact.txt", "Validating links"], bodyKind: "contact", bodySteps: contacts.length },
];

/* ─── animation state ─── */

type SectionState = {
  promptChars: number;
  toolsDone: number;
  toolsCollapsed: boolean;
  bodySteps: number;
  done: boolean;
};

const emptyState = (): SectionState => ({
  promptChars: 0,
  toolsDone: 0,
  toolsCollapsed: false,
  bodySteps: 0,
  done: false,
});

const fullState = (def: SectionDef): SectionState => ({
  promptChars: def.prompt.length,
  toolsDone: def.tools.length,
  toolsCollapsed: true,
  bodySteps: def.bodySteps,
  done: true,
});

const STORAGE_KEY = "portfolio-played";

/* ─── icons ─── */

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-5" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-5" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

/* ─── animation atoms ─── */

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function Spinner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((x) => (x + 1) % SPINNER_FRAMES.length), 80);
    return () => window.clearInterval(id);
  }, []);
  return <span className="text-accent">{SPINNER_FRAMES[i]}</span>;
}

function Cursor() {
  return <span className="inline-block h-4 w-2 -mb-0.5 ml-0.5 bg-accent cursor-blink align-baseline" aria-hidden />;
}

/* ─── tool block ─── */

function ToolBlock({ def, state, instant }: { def: SectionDef; state: SectionState; instant: boolean }) {
  const allDone = state.toolsDone >= def.tools.length;
  const [collapsed, setCollapsed] = useState(false);
  const prevCollapseRef = useRef(state.toolsCollapsed);

  useEffect(() => {
    if (instant) {
      setCollapsed(true);
      prevCollapseRef.current = true;
      return;
    }
    if (state.toolsCollapsed && !prevCollapseRef.current) {
      setCollapsed(true);
    }
    prevCollapseRef.current = state.toolsCollapsed;
  }, [state.toolsCollapsed, instant]);

  if (collapsed && allDone) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="text-dim text-sm hover:text-foreground transition-colors flex items-center gap-2"
      >
        <span className="text-success">●</span>
        <span>{def.tools.length} tool uses</span>
        <span className="text-dim/70">▸</span>
      </button>
    );
  }

  const visibleCount = allDone ? def.tools.length : Math.min(state.toolsDone + 1, def.tools.length);

  return (
    <div className="text-sm space-y-1 text-dim">
      {allDone && (
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="flex items-center gap-2 hover:text-foreground transition-colors"
        >
          <span className="text-success">●</span>
          <span>{def.tools.length} tool uses</span>
          <span className="text-dim/70">▾</span>
        </button>
      )}
      {def.tools.slice(0, visibleCount).map((t, i) => {
        const done = i < state.toolsDone;
        return (
          <div key={i} className="flex items-center gap-2 pl-1">
            <span className="w-3 inline-block">
              {done ? <span className="text-success">✓</span> : <Spinner />}
            </span>
            <span>{t}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── body renderers ─── */

function HeroBody({ step, streaming }: { step: number; streaming: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-start">
      {step >= 1 && (
        <div className="shrink-0 flex flex-col items-center gap-3">
          <div className="size-40 sm:size-52 rounded-full overflow-hidden border border-accent/70 shadow-[0_0_80px_-15px_rgba(245,158,11,0.55)]">
            <Image
              src="/ebrahim.jpeg"
              alt="Mohammed Ebrahim Imran"
              width={208}
              height={208}
              priority
              className="size-full object-cover"
            />
          </div>
          <span className="text-muted text-xs">ebrahim.jpeg</span>
        </div>
      )}
      <div className="space-y-4 sm:pt-2 min-h-[12rem]">
        {step >= 2 && (
          <h1 className="text-5xl sm:text-6xl font-bold tracking-wide text-foreground">EBRAHIM IMRAN</h1>
        )}
        {step >= 3 && <p className="text-success text-xl sm:text-2xl">Agentic AI &amp; Gen AI Engineer</p>}
        {step >= 4 && (
          <p className="text-lg max-w-xl text-foreground/95 leading-relaxed">
            Building <span className="text-accent">autonomous agents</span>,{" "}
            <span className="text-accent">advanced RAG pipelines</span>, and high-converting marketing workflows designed to scale business growth and operations.
          </p>
        )}
        {step >= 5 && (
          <>
            <p className="text-dim text-sm">// Bengaluru, India</p>
            <div className="flex gap-5 pt-1 text-dim">
              <a
                href="https://www.linkedin.com/in/ebrahim-sait/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="hover:text-accent transition-colors"
              >
                <IconLinkedIn />
              </a>
              <CopyLink value="ibrahimsait59@gmail.com" label="email">
                <IconMail />
              </CopyLink>
              <CopyLink value="+91 95384 00457" label="phone">
                <IconPhone />
              </CopyLink>
            </div>
          </>
        )}
        {streaming && step < 5 && <Cursor />}
      </div>
    </div>
  );
}

function BioBody({ step, streaming }: { step: number; streaming: boolean }) {
  return (
    <p className="text-base sm:text-lg leading-loose max-w-3xl">
      {bioTokens.slice(0, step).map((t, i) => (
        <span key={i} className={t.cls}>
          {t.text}
        </span>
      ))}
      {streaming && <Cursor />}
    </p>
  );
}

function SkillsBody({ step, streaming }: { step: number; streaming: boolean }) {
  return (
    <ul className="space-y-2 text-base sm:text-lg">
      {skills.slice(0, step).map((s, i) => (
        <li key={s.label}>
          <span className="text-highlight">{s.label.padEnd(14, "\u00A0")}</span>
          <span>{s.items}</span>
          {streaming && i === step - 1 && step < skills.length && <Cursor />}
        </li>
      ))}
    </ul>
  );
}

function ProjectsBody({ step, streaming }: { step: number; streaming: boolean }) {
  return (
    <ul className="space-y-3 text-base sm:text-lg">
      {projects.slice(0, step).map((p, i) => (
        <li key={p.name} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
          <span className="text-highlight shrink-0">{p.name}</span>
          <span className="text-foreground/90">— {p.desc}</span>
          <span className="text-muted text-xs sm:ml-auto shrink-0">★ {p.stars}</span>
          {streaming && i === step - 1 && step < projects.length && <Cursor />}
        </li>
      ))}
    </ul>
  );
}

function ContactBody({ step, streaming }: { step: number; streaming: boolean }) {
  return (
    <ul className="space-y-2 text-base sm:text-lg">
      {contacts.slice(0, step).map((c, i) => (
        <li key={c.label}>
          <span className="text-dim">{c.label}</span>{" "}
          <a
            href={c.href}
            target={c.href.startsWith("mailto:") || c.href.startsWith("tel:") ? undefined : "_blank"}
            download={c.download ? "ebrahim_sait_resume.pdf" : undefined}
            rel="noreferrer noopener"
            className="text-highlight hover:underline"
          >
            {c.value}
          </a>
          {streaming && i === step - 1 && step < contacts.length && <Cursor />}
        </li>
      ))}
    </ul>
  );
}

function EducationBody({ step, streaming }: { step: number; streaming: boolean }) {
  return (
    <ul className="space-y-2 text-base sm:text-lg">
      {education.slice(0, step).map((edu, i) => (
        <li key={edu.degree} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
          <span className="text-highlight shrink-0">{edu.degree}</span>
          <span className="text-foreground/90">— {edu.institution}</span>
          {streaming && i === step - 1 && step < education.length && <Cursor />}
        </li>
      ))}
    </ul>
  );
}

function CertificationsBody({ step, streaming }: { step: number; streaming: boolean }) {
  return (
    <ul className="space-y-2 text-base sm:text-lg">
      {certifications.slice(0, step).map((c, i) => (
        <li key={c.name} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
          <span className="text-highlight shrink-0">{c.name}</span>
          {c.details && <span className="text-foreground/90">— {c.details}</span>}
          {streaming && i === step - 1 && step < certifications.length && <Cursor />}
        </li>
      ))}
    </ul>
  );
}

function LeadershipBody({ step, streaming }: { step: number; streaming: boolean }) {
  return (
    <ul className="space-y-4 text-base sm:text-lg">
      {leadership.slice(0, step).map((item, i) => (
        <li key={item.org} className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
            <span className="text-highlight font-semibold shrink-0">{item.role}</span>
            <span className="text-foreground/90">— {item.org}</span>
            <span className="text-muted text-xs sm:ml-auto shrink-0">{item.period}</span>
          </div>
          <p className="text-foreground/80 pl-4 border-l border-muted/30 text-sm leading-relaxed max-w-2xl">
            • {item.desc}
          </p>
          {streaming && i === step - 1 && step < leadership.length && <Cursor />}
        </li>
      ))}
    </ul>
  );
}

function renderBody(def: SectionDef, state: SectionState, isActive: boolean) {
  const streaming = isActive && state.bodySteps < def.bodySteps;
  switch (def.bodyKind) {
    case "hero":
      return <HeroBody step={state.bodySteps} streaming={streaming} />;
    case "bio":
      return <BioBody step={state.bodySteps} streaming={streaming} />;
    case "education":
      return <EducationBody step={state.bodySteps} streaming={streaming} />;
    case "skills":
      return <SkillsBody step={state.bodySteps} streaming={streaming} />;
    case "certifications":
      return <CertificationsBody step={state.bodySteps} streaming={streaming} />;
    case "projects":
      return <ProjectsBody step={state.bodySteps} streaming={streaming} />;
    case "leadership":
      return <LeadershipBody step={state.bodySteps} streaming={streaming} />;
    case "contact":
      return <ContactBody step={state.bodySteps} streaming={streaming} />;
  }
}

/* ─── chat ─── */

type QAEntry = { patterns: string[]; answer: string };
const qa = qaData as QAEntry[];

const FALLBACK_ANSWER =
  "Hmm, I don't have a canned answer for that one — and yes, they're all canned. Try asking about my background, tech stack, projects, availability, or how to get in touch. Or just email ibrahimsait59@gmail.com and ask a real human (me).";

function tokenize(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

function findAnswer(question: string): string {
  for (const entry of qa) {
    for (const pattern of entry.patterns) {
      try {
        if (new RegExp(pattern, "i").test(question)) return entry.answer;
      } catch {
        // skip invalid regex
      }
    }
  }
  return FALLBACK_ANSWER;
}

type HistoryItem = { id: number; q: string; words: string[]; shown: number };

function ChatInterface() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const idRef = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history]);

  useEffect(() => {
    return () => {
      streamRef.current.cancelled = true;
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    setValue("");


    const answer = findAnswer(q);
    const words = tokenize(answer);
    const id = ++idRef.current;
    setHistory((prev) => [...prev, { id, q, words, shown: 0 }]);

    streamRef.current.cancelled = true;
    const token = { cancelled: false };
    streamRef.current = token;

    (async () => {
      const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
      for (let s = 1; s <= words.length; s++) {
        if (token.cancelled) return;
        await sleep(35);
        setHistory((prev) => prev.map((h) => (h.id === id ? { ...h, shown: s } : h)));
      }
    })();
  };

  return (
    <div className="space-y-6 pt-2">
      {history.map((h) => {
        const streaming = h.shown < h.words.length;
        return (
          <div key={h.id} className="space-y-2 text-base sm:text-lg">
            <div>
              <span className="text-accent">
                $ ask&gt; <span className="text-foreground">{h.q}</span>
              </span>
            </div>
            <p className="pl-6 text-foreground leading-relaxed max-w-3xl">
              {h.words.slice(0, h.shown).join("")}
              {streaming && <Cursor />}
            </p>
          </div>
        );
      })}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 text-base sm:text-lg">
        <span className="text-accent shrink-0">$ ask&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-label="Ask a question about Ebrahim"
          className="flex-1 bg-transparent outline-none border-none text-foreground caret-accent placeholder:text-muted"
          placeholder="ask me anything…"
        />
      </form>

      <div ref={bottomRef} />
    </div>
  );
}

/* ─── section view ─── */

function SectionView({ def, state, isActive, instant }: { def: SectionDef; state: SectionState; isActive: boolean; instant: boolean }) {
  const promptDone = state.promptChars >= def.prompt.length;
  const showTools = promptDone;
  const showBody = state.toolsCollapsed;

  return (
    <section className="space-y-4">
      <h2 className="flex items-baseline gap-3 text-base sm:text-lg">
        <span className="text-accent">&gt;</span>
        <span className="text-accent">
          {def.prompt.slice(0, state.promptChars)}
          {isActive && !promptDone && <Cursor />}
        </span>
      </h2>
      <div className="border-l border-border pl-6 sm:pl-8 space-y-4">
        {showTools && <ToolBlock def={def} state={state} instant={instant} />}
        {showBody && renderBody(def, state, isActive)}
      </div>
    </section>
  );
}

/* ─── page ─── */

export default function Home() {
  const [states, setStates] = useState<SectionState[]>(() => sectionDefs.map(emptyState));
  const [activeIdx, setActiveIdx] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [instant, setInstant] = useState(false);
  const startedRef = useRef(false);
  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const startSequence = useCallback(() => {
    cancelRef.current.cancelled = true;
    const token = { cancelled: false };
    cancelRef.current = token;

    setInstant(false);
    setAllDone(false);
    setActiveIdx(0);
    setStates(sectionDefs.map(emptyState));

    const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
    const update = (i: number, patch: Partial<SectionState>) =>
      setStates((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

    (async () => {
      for (let i = 0; i < sectionDefs.length; i++) {
        if (token.cancelled) return;
        setActiveIdx(i);
        const def = sectionDefs[i];

        // Type prompt
        for (let c = 1; c <= def.prompt.length; c++) {
          if (token.cancelled) return;
          await sleep(18);
          update(i, { promptChars: c });
        }
        await sleep(140);

        // Run tools
        for (let t = 1; t <= def.tools.length; t++) {
          if (token.cancelled) return;
          await sleep(260);
          update(i, { toolsDone: t });
        }
        await sleep(180);
        if (token.cancelled) return;
        update(i, { toolsCollapsed: true });
        await sleep(120);

        // Stream body
        const stepDelay = def.bodyKind === "bio" ? 45 : 60;
        for (let s = 1; s <= def.bodySteps; s++) {
          if (token.cancelled) return;
          await sleep(stepDelay);
          update(i, { bodySteps: s });
        }
        update(i, { done: true });
        await sleep(160);
      }
      if (token.cancelled) return;
      setActiveIdx(sectionDefs.length);
      setAllDone(true);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let played = false;
    try {
      played = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // ignore
    }

    if (reduced || played) {
      setInstant(true);
      setStates(sectionDefs.map(fullState));
      setActiveIdx(sectionDefs.length);
      setAllDone(true);
      return;
    }

    startSequence();

    return () => {
      cancelRef.current.cancelled = true;
    };
  }, [startSequence]);

  const handleNewSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    startSequence();
  };

  return (
    <main className="flex-1 bg-background p-3 sm:p-5">
      <div className="min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2.5rem)] rounded-lg border border-border flex flex-col">
        {/* Chrome bar */}
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#ff5f57]" aria-hidden />
              <span className="size-3 rounded-full bg-[#febc2e]" aria-hidden />
              <span className="size-3 rounded-full bg-[#28c840]" aria-hidden />
            </div>
            <span className="text-dim text-sm hidden sm:inline">ebrahim@terminal &mdash; 0:45</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleNewSession}
              className="rounded border border-accent/70 px-3 py-1 text-accent text-xs sm:text-sm hover:bg-accent/10 transition-colors cursor-pointer"
            >
              new session
            </button>
            <span className="rounded border border-border px-2 py-1 text-dim text-xs hidden sm:inline-block">
              Ctrl+K
            </span>
            <span className="flex items-center gap-2 text-dim text-xs sm:text-sm">
              <span className="size-2 rounded-full bg-success" aria-hidden />
              online
            </span>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 px-5 sm:px-12 py-10 sm:py-14 space-y-14">
          {sectionDefs.map((def, i) => {
            const visible = instant || i <= activeIdx;
            if (!visible) return null;
            const state = states[i];
            const isActive = !instant && i === activeIdx && !state.done;
            return <SectionView key={def.id} def={def} state={state} isActive={isActive} instant={instant} />;
          })}

          {/* Chat interface */}
          {allDone && <ChatInterface />}
        </div>
      </div>
    </main>
  );
}
