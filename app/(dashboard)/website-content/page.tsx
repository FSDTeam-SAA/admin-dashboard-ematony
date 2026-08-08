"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Save, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import {
  createTeamMemberApi,
  createTestimonialApi,
  deleteTeamMemberApi,
  deleteTestimonialApi,
  getSitePageApi,
  getTeamApi,
  getTestimonialsApi,
  updateSitePageApi,
  updateTeamMemberApi,
  updateTestimonialApi,
} from "@/lib/api";
import type {
  SitePage,
  SitePagePayload,
  TeamMember,
  TeamMemberPayload,
  Testimonial,
  TestimonialPayload,
} from "@/types";

type View = SitePage["slug"] | "team" | "testimonials";

const views: Array<{ value: View; label: string }> = [
  { value: "about-ajo-family", label: "About Ajo Family" },
  { value: "team", label: "Our Team" },
  { value: "testimonials", label: "Testimonials" },
  { value: "contact", label: "Contact Us" },
  { value: "privacy-policy", label: "Privacy Policy" },
  { value: "terms-of-service", label: "Terms of Service" },
];

const fieldClass = "h-[50px] rounded-[12px] border-[#dfe7ef] bg-white px-4 text-[16px] text-[#083f32]";

const escapeHtml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const toRichHtml = (value: string) => {
  if (/<\/?[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
};

const legacySectionsToHtml = (sections: SitePage["sections"]) =>
  sections
    .map((section) =>
      `<h2>${escapeHtml(section.title)}</h2>${section.body.map((paragraph) => toRichHtml(paragraph)).join("")}`
    )
    .join("");

function errorMessage(error: unknown) {
  const response = error as { response?: { data?: { message?: string } } };
  return response.response?.data?.message ?? "Something went wrong";
}

function PageEditor({ slug }: { slug: SitePage["slug"] }) {
  const query = useQuery({
    queryKey: ["admin-site-page", slug],
    queryFn: () => getSitePageApi(slug).then((response) => response.data.data),
  });

  if (query.isLoading) {
    return <div className="rounded-[18px] border border-[#dfe7ef] bg-white p-8 text-[#6b7280]">Loading content...</div>;
  }
  if (!query.data) {
    return <div className="rounded-[18px] border border-[#dfe7ef] bg-white p-8 text-[#b42318]">Unable to load this page.</div>;
  }

  return <PageEditorForm key={`${slug}-${query.data.updatedAt ?? "initial"}`} page={query.data} />;
}

function PageEditorForm({ page }: { page: SitePage }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SitePagePayload>({
    title: page.title,
    intro: page.intro,
    content: page.content || legacySectionsToHtml(page.sections ?? []),
    updatedLabel: page.updatedLabel ?? "",
    sections: [],
    email: page.email ?? "",
    phone: page.phone ?? "",
    address: page.address ?? "",
    supportHours: page.supportHours ?? "",
    isPublished: page.isPublished,
  });

  const saveMutation = useMutation({
    mutationFn: () => updateSitePageApi(page.slug, form),
    onSuccess: () => {
      toast.success("Website content updated");
      queryClient.invalidateQueries({ queryKey: ["admin-site-page", page.slug] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const isContact = page.slug === "contact";
  const usesRichText = page.slug === "about-ajo-family" || page.slug === "privacy-policy" || page.slug === "terms-of-service";

  return (
    <form
      className="rounded-[18px] border border-[#dfe7ef] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(); }}
    >
      <div className="grid gap-5">
        <div>
          <label className="mb-2 block text-[15px] font-medium">Page title</label>
          <Input className={fieldClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        </div>
        <div>
          <label className="mb-2 block text-[15px] font-medium">Introduction</label>
          {usesRichText ? (
            <RichTextEditor
              value={toRichHtml(form.intro)}
              onChange={(intro) => setForm({ ...form, intro })}
              placeholder="Write the page introduction..."
              minHeight={120}
            />
          ) : (
            <Textarea className="min-h-[110px] rounded-[12px] border-[#dfe7ef] px-4 py-3 text-[16px] leading-7" value={form.intro} onChange={(event) => setForm({ ...form, intro: event.target.value })} />
          )}
        </div>

        {isContact ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div><label className="mb-2 block text-[15px] font-medium">Official email</label><Input type="email" className={fieldClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
            <div><label className="mb-2 block text-[15px] font-medium">Official phone</label><Input className={fieldClass} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Add the confirmed official number" /></div>
            <div><label className="mb-2 block text-[15px] font-medium">Address</label><Input className={fieldClass} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></div>
            <div><label className="mb-2 block text-[15px] font-medium">Support hours</label><Input className={fieldClass} value={form.supportHours} onChange={(event) => setForm({ ...form, supportHours: event.target.value })} /></div>
          </div>
        ) : (
          <>
            {(page.slug === "privacy-policy" || page.slug === "terms-of-service") ? (
              <div><label className="mb-2 block text-[15px] font-medium">Last updated</label><Input className={fieldClass} value={form.updatedLabel} onChange={(event) => setForm({ ...form, updatedLabel: event.target.value })} /></div>
            ) : null}
            <div>
              <label className="mb-2 block text-[15px] font-medium">Content</label>
              <RichTextEditor
                value={form.content ?? ""}
                placeholder="Write and format the complete page content..."
                minHeight={360}
                onChange={(content) => setForm({ ...form, content, sections: [] })}
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-4 border-t border-[#e4eaf0] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] text-[#6b7280]">Saved changes publish on the website immediately.</p>
          <Button type="submit" disabled={saveMutation.isPending} className="h-[50px] rounded-[12px] bg-[#064b39] px-7 text-[16px] text-white hover:bg-[#053b2d]"><Save className="mr-2" />{saveMutation.isPending ? "Saving..." : "Save changes"}</Button>
        </div>
      </div>
    </form>
  );
}

const emptyTeam: TeamMemberPayload = { name: "", role: "", bio: "", imageUrl: "", sortOrder: 0, isPublished: true };

function TeamManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<TeamMemberPayload>(emptyTeam);
  const query = useQuery({ queryKey: ["admin-team"], queryFn: () => getTeamApi().then((response) => response.data.data) });
  const save = useMutation({
    mutationFn: () => editing ? updateTeamMemberApi(editing._id, form) : createTeamMemberApi(form),
    onSuccess: () => { toast.success(editing ? "Team member updated" : "Team member added"); setEditing(null); setForm(emptyTeam); queryClient.invalidateQueries({ queryKey: ["admin-team"] }); },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = useMutation({ mutationFn: deleteTeamMemberApi, onSuccess: () => { toast.success("Team member deleted"); queryClient.invalidateQueries({ queryKey: ["admin-team"] }); }, onError: (error) => toast.error(errorMessage(error)) });

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form className="h-fit rounded-[18px] border border-[#dfe7ef] bg-white p-6" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
        <h2 className="text-[21px] font-semibold">{editing ? "Update team member" : "Add team member"}</h2>
        <div className="mt-5 grid gap-4">
          <Input className={fieldClass} placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input className={fieldClass} placeholder="Role or position" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} required />
          <Input className={fieldClass} placeholder="Photo URL (optional)" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
          <Textarea className="min-h-[130px] rounded-[12px] border-[#dfe7ef] px-4 py-3 text-[15px] leading-6" placeholder="Short profile" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
          <Input type="number" className={fieldClass} placeholder="Display order" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} />
          <label className="flex items-center gap-3 text-[15px]"><input type="checkbox" className="h-5 w-5 accent-[#064b39]" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} />Published</label>
          <div className="flex gap-3"><Button type="submit" className="h-[48px] flex-1 rounded-[12px] bg-[#064b39] text-white"><Save className="mr-2" />Save</Button>{editing ? <Button type="button" variant="outline" className="h-[48px] rounded-[12px]" onClick={() => { setEditing(null); setForm(emptyTeam); }}>Cancel</Button> : null}</div>
        </div>
      </form>
      <div className="rounded-[18px] border border-[#dfe7ef] bg-white p-6">
        <h2 className="text-[21px] font-semibold">Team members</h2>
        <div className="mt-5 grid gap-4">
          {query.isLoading ? <p className="text-[#6b7280]">Loading team...</p> : null}
          {query.data?.map((member) => (
            <article key={member._id} className="flex flex-col gap-4 rounded-[14px] border border-[#e4eaf0] p-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8f7f1] font-semibold">{member.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
              <div className="min-w-0 flex-1"><div className="font-semibold">{member.name}</div><div className="mt-1 text-[14px] text-[#6b7280]">{member.role} · {member.isPublished ? "Published" : "Draft"}</div><p className="mt-2 line-clamp-2 text-[14px] leading-6 text-[#6b7280]">{member.bio}</p></div>
              <div className="flex gap-2"><button type="button" aria-label="Edit team member" className="rounded-full bg-[#e8f7f1] p-3" onClick={() => { setEditing(member); setForm({ name: member.name, role: member.role, bio: member.bio, imageUrl: member.imageUrl ?? "", sortOrder: member.sortOrder, isPublished: member.isPublished }); }}><Edit3 className="h-4 w-4" /></button><button type="button" aria-label="Delete team member" className="rounded-full bg-[#fdeaea] p-3 text-[#d92d20]" onClick={() => remove.mutate(member._id)}><Trash2 className="h-4 w-4" /></button></div>
            </article>
          ))}
          {!query.isLoading && !query.data?.length ? <div className="py-12 text-center text-[#6b7280]"><UsersRound className="mx-auto mb-3" />No team members yet.</div> : null}
        </div>
      </div>
    </div>
  );
}

const emptyTestimonial: TestimonialPayload = { name: "", review: "", rating: 5, location: "", imageUrl: "", sortOrder: 0, isPublished: true };

function TestimonialsManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialPayload>(emptyTestimonial);
  const query = useQuery({ queryKey: ["admin-testimonials"], queryFn: () => getTestimonialsApi().then((response) => response.data.data) });
  const save = useMutation({ mutationFn: () => editing ? updateTestimonialApi(editing._id, form) : createTestimonialApi(form), onSuccess: () => { toast.success(editing ? "Testimonial updated" : "Testimonial added"); setEditing(null); setForm(emptyTestimonial); queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] }); }, onError: (error) => toast.error(errorMessage(error)) });
  const remove = useMutation({ mutationFn: deleteTestimonialApi, onSuccess: () => { toast.success("Testimonial deleted"); queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] }); }, onError: (error) => toast.error(errorMessage(error)) });

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form className="h-fit rounded-[18px] border border-[#dfe7ef] bg-white p-6" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
        <h2 className="text-[21px] font-semibold">{editing ? "Update testimonial" : "Add testimonial"}</h2>
        <div className="mt-5 grid gap-4">
          <Input className={fieldClass} placeholder="Customer name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input className={fieldClass} placeholder="Location (optional)" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
          <Input className={fieldClass} placeholder="Photo URL (optional)" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
          <Textarea className="min-h-[150px] rounded-[12px] border-[#dfe7ef] px-4 py-3 text-[15px] leading-6" placeholder="Customer review" value={form.review} onChange={(event) => setForm({ ...form, review: event.target.value })} required />
          <div className="grid grid-cols-2 gap-3"><Input type="number" min={1} max={5} className={fieldClass} value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} /><Input type="number" className={fieldClass} placeholder="Order" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} /></div>
          <label className="flex items-center gap-3 text-[15px]"><input type="checkbox" className="h-5 w-5 accent-[#064b39]" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} />Published</label>
          <div className="flex gap-3"><Button type="submit" className="h-[48px] flex-1 rounded-[12px] bg-[#064b39] text-white"><Save className="mr-2" />Save</Button>{editing ? <Button type="button" variant="outline" className="h-[48px] rounded-[12px]" onClick={() => { setEditing(null); setForm(emptyTestimonial); }}>Cancel</Button> : null}</div>
        </div>
      </form>
      <div className="rounded-[18px] border border-[#dfe7ef] bg-white p-6"><h2 className="text-[21px] font-semibold">Customer reviews</h2><div className="mt-5 grid gap-4">{query.isLoading ? <p className="text-[#6b7280]">Loading testimonials...</p> : null}{query.data?.map((item) => <article key={item._id} className="rounded-[14px] border border-[#e4eaf0] p-5"><div className="flex items-start justify-between gap-4"><div><div className="font-semibold">{item.name}</div><div className="mt-1 text-[14px] text-[#6b7280]">{"★".repeat(item.rating)}{item.location ? ` · ${item.location}` : ""} · {item.isPublished ? "Published" : "Draft"}</div></div><div className="flex gap-2"><button type="button" aria-label="Edit testimonial" className="rounded-full bg-[#e8f7f1] p-3" onClick={() => { setEditing(item); setForm({ name: item.name, review: item.review, rating: item.rating, location: item.location ?? "", imageUrl: item.imageUrl ?? "", sortOrder: item.sortOrder, isPublished: item.isPublished }); }}><Edit3 className="h-4 w-4" /></button><button type="button" aria-label="Delete testimonial" className="rounded-full bg-[#fdeaea] p-3 text-[#d92d20]" onClick={() => remove.mutate(item._id)}><Trash2 className="h-4 w-4" /></button></div></div><p className="mt-4 text-[15px] leading-7 text-[#52635d]">{item.review}</p></article>)}{!query.isLoading && !query.data?.length ? <div className="py-12 text-center text-[#6b7280]">No testimonials yet.</div> : null}</div></div>
    </div>
  );
}

export default function WebsiteContentPage() {
  const [view, setView] = useState<View>("about-ajo-family");
  return (
    <div className="px-4 pb-8 pt-6 sm:px-6">
      <div className="mb-6"><h1 className="text-[26px] font-semibold text-[#083f32]">Website Content</h1><p className="mt-2 text-[15px] leading-6 text-[#6b7280]">Update the public website without changing code.</p></div>
      <div className="mb-6 flex gap-2 overflow-x-auto rounded-[16px] border border-[#dfe7ef] bg-white p-2">
        {views.map((item) => <button type="button" key={item.value} onClick={() => setView(item.value)} className={`shrink-0 rounded-[11px] px-4 py-3 text-[14px] font-medium transition ${view === item.value ? "bg-[#064b39] text-white" : "text-[#083f32] hover:bg-[#e8f7f1]"}`}>{item.label}</button>)}
      </div>
      {view === "team" ? <TeamManager /> : view === "testimonials" ? <TestimonialsManager /> : <PageEditor slug={view} />}
    </div>
  );
}
