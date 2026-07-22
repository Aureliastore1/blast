"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, KeyRound } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiClient, apiErrorMessage } from "@/lib/apiClient";

interface Profile {
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    apiClient.get("/settings/profile").then((res) => setProfile(res.data.data));
  }, []);

  async function handleSaveProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      await apiClient.put("/settings/profile", { name: profile.name, phone: profile.phone });
      toast.success("Profil diperbarui");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) return toast.error("Lengkapi kedua field password");
    setChangingPassword(true);
    try {
      await apiClient.put("/settings/password", { currentPassword, newPassword });
      toast.success("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setChangingPassword(false);
    }
  }

  if (!profile) return <p className="py-10 text-center text-sm text-slate-500">Memuat...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <p className="text-sm text-slate-500">Kelola informasi akun Anda</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Nama</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
            <input value={profile.email} disabled className="input-field opacity-60" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Nomor Telepon</label>
            <input
              value={profile.phone ?? ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="input-field"
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} loading={saving}>
              <Save className="h-4 w-4" /> Simpan
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Password Saat Ini</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Password Baru</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" />
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleChangePassword} loading={changingPassword}>
              <KeyRound className="h-4 w-4" /> Ubah Password
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
