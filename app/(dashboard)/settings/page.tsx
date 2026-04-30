"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { changePasswordApi } from "@/lib/api";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "password";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [editingProfile, setEditingProfile] = useState(false);

  const [firstName, setFirstName] = useState("Demo");
  const [lastName, setLastName] = useState("Name");
  const [email, setEmail] = useState(session?.user?.email ?? "example@example.com");
  const [phone, setPhone] = useState("(307) 555-0133");
  const [bio, setBio] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  );

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const displayName = session?.user?.name ?? "Ematony";
  const displayHandle = "@admin";
  const avatarUrl = (session?.user as { image?: string } | undefined)?.image ?? "";

  const profileCardName = useMemo(() => {
    const joined = `${firstName} ${lastName}`.trim();
    return joined || displayName;
  }, [displayName, firstName, lastName]);

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

  const handleProfileToggle = () => {
    if (editingProfile) {
      toast.success("Profile details updated locally.");
    }
    setEditingProfile((value) => !value);
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
              <Avatar className="h-[96px] w-[96px] border border-[#dfe7ef]">
                <AvatarImage src={avatarUrl} alt={profileCardName} />
                <AvatarFallback className="bg-[#064b39] text-[28px] text-white">
                  {getInitials(profileCardName)}
                </AvatarFallback>
              </Avatar>
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
                    First Name
                  </label>
                  <Input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    readOnly={!editingProfile}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-3 block text-[16px] font-normal leading-[1.1] text-[#083f32]">
                    Last Name
                  </label>
                  <Input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
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
                    <Input
                      type="password"
                      value={oldPassword}
                      onChange={(event) => setOldPassword(event.target.value)}
                      className={fieldClass}
                      placeholder=".............."
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-3 block text-[16px] font-normal leading-[1.1] text-[#083f32]">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className={fieldClass}
                      placeholder=".............."
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-3 block text-[16px] font-normal leading-[1.1] text-[#083f32]">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className={fieldClass}
                      placeholder=".............."
                      required
                    />
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
