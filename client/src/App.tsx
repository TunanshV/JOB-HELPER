'use client';

import { useEffect, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { Bell, BriefcaseBusiness, ChevronRight, FileText, LayoutDashboard, LogOut, MapPin, Settings, Sparkles, Upload } from 'lucide-react';
import { auth, missingFirebaseFields } from './utils/firebase';

type Job = {
  id?: string;
  company: string;
  role: string;
  experience?: string;
  location: string;
  employmentType?: string;
  tags: string[];
  description?: string;
  applicationUrl?: string;
  posted?: string;
  postedAt?: string;
  score?: number;
  accent: string;
};

const defaultJobs: Job[] = [
  { company: 'Linear', role: 'Product Data Analyst', location: 'Remote · US / Canada', score: 96, tags: ['SQL', 'Product analytics', 'Remote'], posted: '2h ago', accent: 'coral' },
  { company: 'Vercel', role: 'Analytics Engineer', location: 'New York · Hybrid', score: 91, tags: ['dbt', 'Snowflake', 'Next.js'], posted: '5h ago', accent: 'ink' },
  { company: 'Notion', role: 'Data Platform Engineer', location: 'San Francisco · Hybrid', score: 87, tags: ['Python', 'Airflow', 'AWS'], posted: '1d ago', accent: 'mint' },
];

const applications = [
  { company: 'Stripe', role: 'Data Analyst', status: 'Interview', date: 'May 24', tone: 'warm' },
  { company: 'Figma', role: 'Analytics Engineer', status: 'Applied', date: 'May 22', tone: 'cool' },
  { company: 'Ramp', role: 'Product Analyst', status: 'Draft', date: 'May 21', tone: 'neutral' },
];

function App() {
  const [active, setActive] = useState('Overview');
  const [showUpload, setShowUpload] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [adminPanel, setAdminPanel] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [jobs, setJobs] = useState<Job[]>(defaultJobs);
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [resumeMessage, setResumeMessage] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [adminForm, setAdminForm] = useState({ role: '', company: '', experience: '', location: '', employmentType: 'Full-time', skills: '', requirements: '', description: '', applicationUrl: '' });

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    user.getIdToken().then((token) => fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'}/jobs`, { headers: { authorization: `Bearer ${token}` } }))
      .then((response) => response.ok ? response.json() as Promise<{ jobs: Array<Job & { skills?: string[] }> }> : null)
      .then((payload) => {
        if (!payload?.jobs.length) return;
        setJobs(payload.jobs.map((job, index) => ({ ...job, tags: job.tags ?? job.skills ?? [], posted: job.posted ?? new Date(job.postedAt ?? Date.now()).toLocaleDateString(), accent: ['coral', 'ink', 'mint'][index % 3] })));
      })
      .catch(() => undefined);
  }, [user]);

  async function handleGoogleSignIn() {
    if (!auth) {
      setAuthError(`Missing Firebase values: ${missingFirebaseFields.join(', ')}. Add them to client/.env and restart Next.js.`);
      return;
    }
    setAuthError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      const code = error instanceof Error ? error.message : 'Unknown Firebase error';
      setAuthError(`Google sign-in failed: ${code}`);
    }
  }

  if (authLoading) return <div className="auth-loading"><span className="brand-mark">cf</span><span>Preparing your workspace...</span></div>;
  if (!user) return <SignInScreen onSignIn={handleGoogleSignIn} error={authError} configured={Boolean(auth)} missingFields={missingFirebaseFields} />;

  const displayName = user.displayName ?? user.email?.split('@')[0] ?? 'there';
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
  const isAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));

  async function submitJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setAdminMessage('Publishing job...');
    const token = await user.getIdToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'}/admin/jobs`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ ...adminForm, skills: adminForm.skills.split(',').map((item) => item.trim()).filter(Boolean), requirements: adminForm.requirements.split('\n').map((item) => item.trim()).filter(Boolean) }) });
    if (!response.ok) { setAdminMessage((await response.json() as { error?: string }).error ?? 'Could not publish this job.'); return; }
    setAdminMessage('Job published. It is now visible to signed-in users.');
    setAdminForm({ role: '', company: '', experience: '', location: '', employmentType: 'Full-time', skills: '', requirements: '', description: '', applicationUrl: '' });
  }

  async function uploadResume() {
    if (!selectedResume || !user) {
      setResumeMessage('Choose a PDF or DOCX file first.');
      return;
    }
    setResumeUploading(true);
    setResumeMessage('Uploading resume...');
    try {
      const formData = new FormData();
      formData.append('resume', selectedResume);
      const token = await user.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'}/resumes`, { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: formData });
      const payload = await response.json() as { error?: string; filename?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Resume upload failed.');
      setResumeMessage(`${payload.filename ?? selectedResume.name} saved securely.`);
      setSelectedResume(null);
    } catch (error) {
      setResumeMessage(error instanceof Error ? error.message : 'Resume upload failed.');
    } finally {
      setResumeUploading(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">cf</span><span>careerflow</span></div>
        <div className="profile-chip"><div className="avatar">{initials}</div><div><strong>{displayName}</strong><span>Job seeker</span></div><ChevronRight size={15} /></div>
        <nav aria-label="Main navigation">
          {[{ label: 'Overview', icon: LayoutDashboard }, { label: 'Job matches', icon: Sparkles, count: '12' }, { label: 'Applications', icon: BriefcaseBusiness, count: '8' }, { label: 'My resume', icon: FileText }].map(({ label, icon: Icon, count }) => (
            <button className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => setActive(label)} key={label}><Icon size={18} /><span>{label}</span>{count && <em>{count}</em>}</button>
          ))}
          {isAdmin && <button className={`nav-item ${adminPanel ? 'active' : ''}`} onClick={() => setAdminPanel(true)}><Settings size={18} /><span>Admin panel</span></button>}
        </nav>
        <div className="sidebar-bottom"><button className="nav-item"><Settings size={18} /><span>Settings</span></button><button className="nav-item sign-out" onClick={() => signOut(auth!)}><LogOut size={18} /><span>Sign out</span></button><div className="tip"><Sparkles size={18} /><div><strong>Small steps, big moves.</strong><span>Keep your search focused this week.</span></div></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark">cf</span> careerflow</div><div className="topbar-actions"><button className="icon-button" aria-label="Notifications"><Bell size={19} /><span className="notification-dot" /></button><div className="avatar small">{initials}</div></div></header>
        <div className="content-wrap">
          {adminPanel && isAdmin ? <AdminPanel form={adminForm} message={adminMessage} onChange={(field, value) => setAdminForm((current) => ({ ...current, [field]: value }))} onSubmit={submitJob} /> : <>
          <section className="welcome-row"><div><p className="eyebrow">Your private job-search workspace</p><h1>Good morning, {displayName.split(' ')[0]}<span className="wave">.</span></h1><p className="subhead">Here is the signal in your job search today.</p></div><button className="button primary" onClick={() => setShowUpload(true)}><Upload size={17} /> Update resume</button></section>

          <section className="metrics" aria-label="Job search metrics">
            <div className="metric-card featured"><div className="metric-icon"><Sparkles size={18} /></div><span className="metric-label">Match quality</span><strong>86<span>%</span></strong><small><span className="up">+12%</span> from last week</small></div>
            <div className="metric-card"><div className="metric-icon muted"><BriefcaseBusiness size={18} /></div><span className="metric-label">Active applications</span><strong>08</strong><small><span className="up">3</span> need your attention</small></div>
            <div className="metric-card"><div className="metric-icon muted"><FileText size={18} /></div><span className="metric-label">Profile readiness</span><strong>74<span>%</span></strong><small><span className="up">Good</span> · add 2 skills</small></div>
          </section>

          <section className="section-block"><div className="section-heading"><div><p className="eyebrow">Published by CareerFlow admins</p><h2>Open roles</h2></div><button className="text-button" onClick={() => setActive('Job matches')}>View all <ChevronRight size={16} /></button></div><div className="job-list">{jobs.map((job) => <article className="job-card" key={job.id ?? `${job.company}-${job.role}`}><div className={`company-logo ${job.accent}`}>{job.company.slice(0, 1)}</div><div className="job-main"><div className="job-title-row"><div><h3>{job.role}</h3><p>{job.company} <span>·</span> {job.posted}</p></div><span className="match-score">{job.employmentType ?? 'Open role'}</span></div><div className="job-meta"><span><MapPin size={14} /> {job.location}</span>{job.experience && <span className="tag">{job.experience}</span>}{job.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div>{job.applicationUrl && <a className="circle-button" href={job.applicationUrl} target="_blank" rel="noreferrer" aria-label={`Apply for ${job.role}`}><ChevronRight size={17} /></a>}</article>)}</div></section>

          <section className="lower-grid"><div className="section-block applications-block"><div className="section-heading"><div><p className="eyebrow">Keep momentum</p><h2>Recent applications</h2></div><button className="text-button" onClick={() => setActive('Applications')}>View all <ChevronRight size={16} /></button></div><div className="application-list">{applications.map((application) => <div className="application-row" key={application.company}><div className={`company-logo mini ${application.tone}`}>{application.company.slice(0, 1)}</div><div className="application-name"><strong>{application.company}</strong><span>{application.role}</span></div><span className={`status ${application.status.toLowerCase()}`}>{application.status}</span><span className="application-date">{application.date}</span></div>)}</div></div><div className="section-block focus-block"><p className="eyebrow">Your focus today</p><h2>Make your profile do more work.</h2><p>Complete your project highlights to unlock stronger matches for analytics roles.</p><div className="progress-track"><span /></div><div className="progress-label"><span>Profile strength</span><strong>74%</strong></div><button className="button outline">Improve profile <ChevronRight size={16} /></button></div></section>
        </>} 
        </div>
      </main>
      {showUpload && <div className="modal-backdrop" onClick={() => setShowUpload(false)}><div className="upload-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowUpload(false)} aria-label="Close">×</button><div className="modal-icon"><Upload size={20} /></div><p className="eyebrow">Resume workspace</p><h2>Keep your story current.</h2><p>Upload one PDF or DOCX resume. Your latest file replaces the previous version.</p><label className="drop-zone"><FileText size={24} /><strong>{selectedResume ? selectedResume.name : 'Drop your resume here'}</strong><span>{selectedResume ? `${(selectedResume.size / 1024 / 1024).toFixed(2)} MB selected` : 'or click to browse · PDF, DOCX up to 5MB'}</span><input type="file" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx" onChange={(event) => { const file = event.target.files?.[0] ?? null; setSelectedResume(file); setResumeMessage(''); }} /></label>{resumeMessage && <p className="upload-status">{resumeMessage}</p>}<button className="button primary full" onClick={uploadResume} disabled={resumeUploading}>{resumeUploading ? 'Uploading...' : 'Save resume'}</button></div></div>}
    </div>
  );
}

function SignInScreen({ onSignIn, error, configured, missingFields }: { onSignIn: () => void; error: string; configured: boolean; missingFields: string[] }) {
  return <main className="auth-screen"><div className="auth-visual"><div className="auth-brand"><span className="brand-mark">cf</span><span>careerflow</span></div><div className="auth-quote"><span className="eyebrow">A calmer way forward</span><h1>Your next role deserves a little more intention.</h1><p>Bring your resume, goals, and momentum into one focused workspace.</p><div className="auth-signal"><Sparkles size={17} /><span>Personalized opportunities, reviewed by you.</span></div></div><div className="auth-footer">Built for thoughtful job searches.</div></div><section className="auth-panel"><div className="auth-panel-inner"><div className="auth-mobile-brand"><span className="brand-mark">cf</span><span>careerflow</span></div><span className="auth-kicker">Welcome to CareerFlow</span><h2>Make your next move count.</h2><p className="auth-copy">Sign in to save your profile, discover relevant opportunities, and keep every application in view.</p><button className="google-button" onClick={onSignIn}><span className="google-g">G</span><span>Continue with Google</span></button>{!configured && <p className="auth-error">{error || `Firebase setup is incomplete. Missing: ${missingFields.join(', ')}`}</p>}{configured && error && <p className="auth-error">{error}</p>}<p className="auth-legal">By continuing, you agree to keep your job search honest and under your control.</p></div></section></main>;
}

type AdminForm = { role: string; company: string; experience: string; location: string; employmentType: string; skills: string; requirements: string; description: string; applicationUrl: string };

function AdminPanel({ form, message, onChange, onSubmit }: { form: AdminForm; message: string; onChange: (field: keyof AdminForm, value: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const fields: Array<[keyof AdminForm, string, string]> = [['role', 'Job role', 'e.g. Senior Data Analyst'], ['company', 'Company', 'e.g. CareerFlow Labs'], ['experience', 'Experience required', 'e.g. 2-4 years'], ['location', 'Location', 'e.g. Remote / Bengaluru'], ['skills', 'Skills', 'Comma-separated: SQL, Python, Excel'], ['applicationUrl', 'Application URL', 'https://your-company.com/apply']];
  return <section className="admin-panel"><div className="admin-heading"><div><p className="eyebrow">Private administrator workspace</p><h1>Publish a new role.</h1><p className="subhead">Add the details candidates need. Published roles become visible in the shared job board.</p></div><span className="admin-badge">ADMIN</span></div><form className="admin-form" onSubmit={onSubmit}><div className="admin-fields">{fields.map(([field, label, placeholder]) => <label key={field}>{label}<input required={['role', 'company', 'experience', 'location', 'applicationUrl'].includes(field)} value={form[field]} placeholder={placeholder} onChange={(event) => onChange(field, event.target.value)} /></label>)}<label>Employment type<select value={form.employmentType} onChange={(event) => onChange('employmentType', event.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></label></div><label>Requirements <textarea value={form.requirements} placeholder="One requirement per line" rows={4} onChange={(event) => onChange('requirements', event.target.value)} /></label><label>Job description <textarea required value={form.description} placeholder="Describe the role, team, responsibilities, and what success looks like." rows={7} onChange={(event) => onChange('description', event.target.value)} /></label><div className="admin-submit"><button className="button primary" type="submit"><BriefcaseBusiness size={16} /> Publish job</button>{message && <span>{message}</span>}</div></form></section>;
}

export default App;
