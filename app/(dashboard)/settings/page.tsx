"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    candidateCompleted: true,
    candidateInvited: false,
    reportReady: true,
    weeklyDigest: true,
  });
  const [profile, setProfile] = useState({
    name: "HR Admin",
    email: "admin@company.com",
    company: "",
    role: "HR Manager",
  });

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and platform preferences.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Settings saved successfully.
        </div>
      )}

      {/* Profile section */}
      <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-white border-b border-[#1E2240] pb-3">Account Profile</h2>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1D4ED8]/20 border-2 border-[#1D4ED8]/40 flex items-center justify-center text-xl font-bold text-[#6B9FFF]">
            HR
          </div>
          <div>
            <p className="text-sm font-medium text-white">{profile.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>
            <button className="text-xs text-[#6B9FFF] hover:text-blue-300 mt-1.5 transition-colors">
              Change avatar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { key: "name", label: "Full Name", placeholder: "Your name" },
            { key: "email", label: "Email Address", placeholder: "you@company.com" },
            { key: "company", label: "Company", placeholder: "Company name" },
            { key: "role", label: "Job Title", placeholder: "Your role" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
              <input
                value={profile[field.key as keyof typeof profile]}
                onChange={(e) => setProfile((p) => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 rounded-lg bg-[#07080F] border border-[#1E2240] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-white border-b border-[#1E2240] pb-3">Notification Preferences</h2>
        {[
          { key: "candidateCompleted", label: "Candidate completes assessment", desc: "Get notified when a candidate finishes their assessment" },
          { key: "candidateInvited", label: "Candidate accepts invitation", desc: "Notification when a candidate opens their invitation link" },
          { key: "reportReady", label: "Report is ready", desc: "Alert when a project report is generated and ready to review" },
          { key: "weeklyDigest", label: "Weekly digest", desc: "A summary of all hiring activity sent every Monday" },
        ].map((item) => (
          <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b border-[#1E2240] last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-slate-200">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
                notifications[item.key as keyof typeof notifications] ? "bg-[#1D4ED8]" : "bg-[#1E2240]"
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                notifications[item.key as keyof typeof notifications] ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        ))}
      </div>

      {/* Team members */}
      <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6">
        <div className="flex items-center justify-between border-b border-[#1E2240] pb-3 mb-4">
          <h2 className="text-base font-semibold text-white">Team Members</h2>
          <button className="text-xs text-[#6B9FFF] hover:text-blue-300 transition-colors font-medium">
            + Invite member
          </button>
        </div>
        <div className="space-y-3">
          {[
            { name: "HR Admin", email: "admin@company.com", role: "Owner", avatar: "HR", color: "bg-[#1D4ED8]/20 text-[#6B9FFF] border-[#1D4ED8]/30" },
            { name: "Sarah Kowalski", email: "s.kowalski@company.com", role: "Recruiter", avatar: "SK", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
            { name: "David Park", email: "d.park@company.com", role: "Recruiter", avatar: "DP", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
          ].map((member) => (
            <div key={member.email} className="flex items-center gap-3 py-2">
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-semibold flex-shrink-0 ${member.color}`}>
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{member.name}</p>
                <p className="text-xs text-slate-500">{member.email}</p>
              </div>
              <span className="text-xs bg-[#1E2240] text-slate-400 px-2.5 py-1 rounded-full">{member.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-[#0D1020] border border-red-500/20 rounded-xl p-6">
        <h2 className="text-base font-semibold text-red-400 mb-3">Danger Zone</h2>
        <p className="text-sm text-slate-500 mb-4">These actions are irreversible. Please proceed with caution.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors">
            Delete All Assessment Data
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors">
            Close Account
          </button>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-semibold transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
