"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createFaqApi,
  deleteFaqApi,
  getFaqsApi,
  updateFaqApi,
} from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import type { Faq, FaqPayload } from "@/types";

const emptyForm: FaqPayload = {
  question: "",
  answer: "",
  category: "General",
  sortOrder: 0,
  isPublished: true,
};

export default function FaqsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [form, setForm] = useState<FaqPayload>(emptyForm);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-faqs", page, debouncedSearch],
    queryFn: () =>
      getFaqsApi(page, 10, debouncedSearch).then((response) => response.data),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category?.trim() || "General",
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (editingFaq) {
        return updateFaqApi(editingFaq._id, payload);
      }

      return createFaqApi(payload);
    },
    onSuccess: () => {
      toast.success(editingFaq ? "FAQ updated" : "FAQ added");
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      setDialogOpen(false);
    },
    onError: (error: unknown) => {
      const response = error as { response?: { data?: { message?: string } } };
      toast.error(response.response?.data?.message ?? "Failed to save FAQ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFaqApi,
    onSuccess: () => {
      toast.success("FAQ deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    },
    onError: () => toast.error("Failed to delete FAQ"),
  });

  const rows = useMemo(() => data?.data ?? [], [data?.data]);
  const total = data?.meta?.total ?? 0;
  const start = rows.length ? (page - 1) * 10 + 1 : 0;
  const end = rows.length ? start + rows.length - 1 : 0;

  const openCreateDialog = () => {
    setEditingFaq(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (faq: Faq) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sortOrder: faq.sortOrder,
      isPublished: faq.isPublished,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.question.trim()) {
      toast.error("Question is required");
      return;
    }
    if (!form.answer.trim()) {
      toast.error("Answer is required");
      return;
    }
    saveMutation.mutate();
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingFaq(null);
      setForm(emptyForm);
    }
  };

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-6">
      <section className="rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold leading-[1.1] text-[#083f32]">
              FAQ Management
            </h1>
            <div className="mt-4 flex items-center gap-4 text-[16px] font-normal leading-[1.1] text-[#083f32]">
              <span>Dashboard</span>
              <span className="text-[#6b7280]">&gt;</span>
              <span>FAQ Management</span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative w-full sm:w-[356px]">
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="h-[52px] rounded-[12px] border-[#b8c7da] bg-white pl-5 pr-[64px] text-[16px] text-[#083f32] placeholder:text-[#083f32]"
                placeholder="Search FAQ"
              />
              <button
                type="button"
                className="absolute right-0 top-0 flex h-[52px] w-[62px] items-center justify-center rounded-r-[12px] bg-[#064b39] text-white"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            <Button
              type="button"
              onClick={openCreateDialog}
              className="h-[52px] rounded-[12px] bg-[#064b39] px-5 text-[16px] font-medium text-white hover:bg-[#053b2d]"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add FAQ
            </Button>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={10} cols={5} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-5">
                <thead>
                  <tr className="text-left text-[16px] font-semibold leading-[1.1] text-[#083f32]">
                    <th className="pb-1">Question</th>
                    <th className="pb-1">Category</th>
                    <th className="pb-1">Order</th>
                    <th className="pb-1">Status</th>
                    <th className="pb-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((faq) => (
                      <tr key={faq._id} className="text-[16px] font-normal leading-[1.25] text-[#083f32]">
                        <td className="max-w-[520px] py-2">
                          <div className="font-medium">{faq.question}</div>
                          <div className="mt-2 line-clamp-2 text-[14px] leading-6 text-[#6b7280]">
                            {faq.answer}
                          </div>
                        </td>
                        <td>{faq.category}</td>
                        <td>{faq.sortOrder}</td>
                        <td>
                          <span
                            className={`inline-flex min-w-[118px] items-center justify-center rounded-full px-4 py-2 text-[15px] font-medium ${
                              faq.isPublished
                                ? "bg-[#e8f7f1] text-[#083f32]"
                                : "bg-[#eef3f6] text-[#6b7280]"
                            }`}
                          >
                            {faq.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#e8f7f1] text-[#083f32]"
                              onClick={() => openEditDialog(faq)}
                              aria-label="Edit FAQ"
                            >
                              <Edit3 className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#fdeaea] text-[#ff2a2a]"
                              onClick={() => deleteMutation.mutate(faq._id)}
                              aria-label="Delete FAQ"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-[16px] text-[#7b8192]">
                        No FAQs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-[16px] font-medium leading-[1.1] text-[#083f32]">
                Showing {start}-{end} of {total} results
              </div>
              <Pagination
                page={page}
                totalPages={data?.meta.totalPages ?? 1}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[min(92vw,680px)] max-w-[680px] overflow-y-auto rounded-[28px] border-0 bg-white px-5 py-6 text-[#083f32] shadow-[0_18px_60px_rgba(0,0,0,0.18)] ring-0 sm:max-w-[680px] sm:px-7 sm:py-7">
          <DialogHeader>
            <DialogTitle className="text-[24px] font-semibold text-[#083f32]">
              {editingFaq ? "Update FAQ" : "Add FAQ"}
            </DialogTitle>
          </DialogHeader>

          <form className="mt-4 grid gap-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-[15px] font-medium text-[#083f32]">
                Question
              </label>
              <Input
                value={form.question}
                onChange={(event) =>
                  setForm((current) => ({ ...current, question: event.target.value }))
                }
                className="h-[52px] rounded-[12px] border-[#dfe7ef] text-[16px] text-[#083f32]"
                placeholder="How does Ajo Family work?"
              />
            </div>

            <div>
              <label className="mb-2 block text-[15px] font-medium text-[#083f32]">
                Answer
              </label>
              <Textarea
                value={form.answer}
                onChange={(event) =>
                  setForm((current) => ({ ...current, answer: event.target.value }))
                }
                className="min-h-[150px] rounded-[12px] border-[#dfe7ef] text-[16px] leading-7 text-[#083f32]"
                placeholder="Write a helpful answer for app users."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_140px_150px]">
              <div>
                <label className="mb-2 block text-[15px] font-medium text-[#083f32]">
                  Category
                </label>
                <Input
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                  className="h-[52px] rounded-[12px] border-[#dfe7ef] text-[16px] text-[#083f32]"
                  placeholder="General"
                />
              </div>

              <div>
                <label className="mb-2 block text-[15px] font-medium text-[#083f32]">
                  Order
                </label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: Number(event.target.value),
                    }))
                  }
                  className="h-[52px] rounded-[12px] border-[#dfe7ef] text-[16px] text-[#083f32]"
                />
              </div>

              <label className="flex items-end gap-3 pb-4 text-[15px] font-medium text-[#083f32]">
                <input
                  type="checkbox"
                  checked={Boolean(form.isPublished)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isPublished: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-[#064b39]"
                />
                Published
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-[50px] rounded-[12px] border-[#dfe7ef] px-5 text-[16px] text-[#083f32]"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="h-[50px] rounded-[12px] bg-[#064b39] px-6 text-[16px] font-medium text-white hover:bg-[#053b2d]"
              >
                {saveMutation.isPending ? "Saving..." : "Save FAQ"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
