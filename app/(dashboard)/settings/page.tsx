"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Camera, Eye, EyeOff, Loader2, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { changePasswordApi, getProfileApi, updateProfileApi } from "@/lib/api";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "password";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [editingProfile, setEditingProfile] = useState(false);

  const [yourName, setYourName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const { data: profileResponse } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfileApi().then((res) => res.data?.data),
    enabled: Boolean(session),
  });

  useEffect(() => {
    if (!profileResponse) return;
    setYourName(profileResponse.name ?? "");
    setEmail(profileResponse.email ?? "");
    const phoneValue = (profileResponse as { phone?: string }).phone;
    if (phoneValue) setPhone(phoneValue);
    const bioValue = (profileResponse as { bio?: string }).bio;
    if (bioValue) setBio(bioValue);
    if (profileResponse.avatar?.url) setAvatarUrl(profileResponse.avatar.url);
  }, [profileResponse]);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const displayName = session?.user?.name ?? "Ematony";
  const displayHandle = "@admin";
  const sessionAvatarUrl = (session?.user as { image?: string } | undefined)?.image ?? "";
  const [avatarUrl, setAvatarUrl] = useState<string>(sessionAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return updateProfileApi(formData);
    },
    onSuccess: async (response) => {
      const url = response.data?.data?.avatar?.url;
      if (url) {
        setAvatarUrl(url);
        await updateSession({ image: url });
      }
      toast.success("Avatar updated");
    },
    onError: (error: unknown) => {
      const response = error as { response?: { data?: { message?: string } } };
      toast.error(response.response?.data?.message ?? "Failed to upload avatar");
    },
  });

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    uploadAvatarMutation.mutate(file);
  };

  const profileCardName = useMemo(() => {
    const joined = `${yourName}`.trim();
    return joined || displayName;
  }, [displayName, yourName]);

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      changePasswordApi({
        oldPassword,
        newPassword,
      }),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: unknown) => {
      const response = error as { response?: { data?: { message?: string } } };
      toast.error(response.response?.data?.message ?? "Failed to change password");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("name", yourName);
      return updateProfileApi(formData);
    },
    onSuccess: async (response) => {
      const updated = response.data?.data;
      if (updated?.avatar?.url) setAvatarUrl(updated.avatar.url);
      if (updated?.name) setYourName(updated.name);
      await updateSession({
        name: updated?.name,
        image: updated?.avatar?.url,
      });
      toast.success("Profile updated successfully");
      setEditingProfile(false);
    },
    onError: (error: unknown) => {
      const response = error as { response?: { data?: { message?: string } } };
      toast.error(response.response?.data?.message ?? "Failed to update profile");
    },
  });

  const handleProfileToggle = () => {
    if (editingProfile) {
      if (!yourName.trim()) {
        toast.error("Name is required.");
        return;
      }
      updateProfileMutation.mutate();
      return;
    }
    setEditingProfile(true);
  };

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    changePasswordMutation.mutate();
  };

  const tabButtonClass = (tab: SettingsTab) =>
    cn(
      "flex h-[56px] flex-1 items-center justify-center rounded-[18px] border text-center text-[16px] font-semibold leading-[1.1] transition-colors",
      activeTab === tab
        ? "border-[#064b39] bg-[#064b39] text-white"
        : "border-[#8f979e] bg-white text-[#083f32]"
    );

  const fieldClass =
    "h-[52px] rounded-[18px] border-[#dfe7ef] bg-white px-4 text-[16px] font-normal text-[#083f32] placeholder:text-[#7c8da8]";

  return (
    <div className="min-h-full bg-[#f2f2f2] px-0 pb-10 lg:px-0">
      <div className="mx-auto w-full max-w-none rounded-none bg-[#f2f2f2] px-4 py-6 sm:px-6 lg:px-6">
        <div className="rounded-none bg-[#f2f2f2]">
          <div className="mb-10">
            <h1 className="text-[24px] font-semibold leading-[1.1] text-[#083f32]">
              Settings
            </h1>
            <div className="mt-3 flex items-center gap-4 text-[16px] font-normal leading-[1.1] text-[#083f32]">
              <span>Dashboard</span>
              <span className="text-[#6b7280]">›</span>
              <span>Settings</span>
            </div>
          </div>

          <div className="mb-10 flex flex-col gap-4 lg:flex-row">
            <button type="button" className={tabButtonClass("profile")} onClick={() => setActiveTab("profile")}>
              Personal Information
            </button>
            <button type="button" className={tabButtonClass("password")} onClick={() => setActiveTab("password")}>
              Change Password
            </button>
          </div>

          <div className="mb-10 flex items-center justify-between rounded-[18px] border border-[#dfe7ef] bg-white px-5 py-6 shadow-[0_2px_6px_rgba(0,0,0,0.02)] sm:px-7">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="group relative h-[96px] w-[96px] cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                aria-label="Change profile picture"
              >
                <Avatar className="h-[96px] w-[96px] border border-[#dfe7ef]">
                  <AvatarImage src={avatarUrl} alt={profileCardName} />
                  <AvatarFallback className="bg-[#064b39] text-[28px] text-white">
                    {getInitials(profileCardName)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity",
                    uploadAvatarMutation.isPending
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  )}
                >
                  {uploadAvatarMutation.isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[24px] font-semibold leading-[1.1] text-[#083f32]">
                  {displayName}
                </div>
                <div className="mt-2 text-[16px] font-normal leading-[1.1] text-[#083f32]">
                  {displayHandle}
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="h-[44px] rounded-[16px] bg-[#064b39] px-5 text-[16px] font-normal text-white hover:bg-[#053b2d]"
              onClick={activeTab === "profile" ? handleProfileToggle : undefined}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>

          {activeTab === "profile" ? (
            <section className="rounded-[18px] border border-[#dfe7ef] bg-white px-5 py-6 shadow-[0_2px_6px_rgba(0,0,0,0.02)] sm:px-7">
              <div className="mb-8 flex items-center justify-between gap-4">
                <h2 className="text-[24px] font-semibold leading-[1.1] text-[#083f32]">
                  Personal Information
                </h2>
                <Button
                  type="button"
                  className="h-[44px] rounded-[16px] bg-[#064b39] px-5 text-[16px] font-normal text-white hover:bg-[#053b2d]"
                  onClick={handleProfileToggle}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {editingProfile ? "Save" : "Edit"}
                </Button>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <label className="mb-3 block text-[16px] font-normal leading-[1.1] text-[#083f32]">
                    Your Name
                  </label>
                  <Input
                    value={yourName}
                    onChange={(event) => setYourName(event.target.value)}
                    readOnly={!editingProfile}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-3 block text-[16px] font-normal leading-[1.1] text-[#083f32]">
                    Email Address
                  </label>
                  <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    readOnly={!editingProfile}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-3 block text-[16px] font-normal leading-[1.1] text-[#083f32]">
                    Phone
                  </label>
                  <Input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    readOnly={!editingProfile}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-3 block text-[16px] font-normal leading-[1.1] text-[#083f32]">
                  Bio
                </label>
                <Textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  readOnly={!editingProfile}
                  className="min-h-[146px] rounded-[18px] border-[#dfe7ef] bg-white px-4 py-4 text-[16px] font-normal leading-[1.25] text-[#083f32] placeholder:text-[#7c8da8]"
                />
              </div>
            </section>
          ) : (
            <section className="rounded-[18px] border border-[#dfe7ef] bg-white px-5 py-6 shadow-[0_2px_6px_rgba(0,0,0,0.02)] sm:px-7">
              <div className="mb-8 flex items-center justify-between gap-4">
                <h2 className="text-[24px] font-semibold leading-[1.1] text-[#083f32]">
                  Change password
                </h2>
                <Button
                  type="button"
                  className="h-[44px] rounded-[16px] bg-[#064b39] px-5 text-[16px] font-normal text-white hover:bg-[#053b2d]"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="grid gap-5 lg:grid-cols-3">
                  <div>
                    <label className="mb-3 block text-[16px] font-normal leading-[1.1] text-[#083f32]">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(event) => setOldPassword(event.target.value)}
                        className={cn(fieldClass, "pr-12")}
                        placeholder=".............."
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword((v) => !v)}
                        aria-label={showOldPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-3 flex items-center text-[#7c8da8] hover:text-[#083f32]"
                      >
                        {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-[16px] font-normal leading-[1.1] text-[#083f32]">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className={cn(fieldClass, "pr-12")}
                        placeholder=".............."
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-3 flex items-center text-[#7c8da8] hover:text-[#083f32]"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-[16px] font-normal leading-[1.1] text-[#083f32]">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className={cn(fieldClass, "pr-12")}
                        placeholder=".............."
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-3 flex items-center text-[#7c8da8] hover:text-[#083f32]"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="h-[52px] rounded-[18px] bg-[#064b39] px-8 text-[16px] font-medium text-white hover:bg-[#053b2d]"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {changePasswordMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
