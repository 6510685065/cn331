import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  GraduationCap,
  Shield,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import tuLogo from '../../assets/Emblem_of_Thammasat_University.svg.png';
import { motion, AnimatePresence } from 'motion/react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(username.trim(), password.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fffafa]">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.12),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(251,191,36,0.16),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(239,68,68,0.08),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(239,68,68,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-[460px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-100 bg-white shadow-lg shadow-red-100/70">
              <img src={tuLogo} alt="TU Logo" className="h-16 w-16 object-contain" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
              {/* <Sparkles className="h-3.5 w-3.5" /> */}
              Thammasat University
            </div>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-red-600">
              Smart Campus
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              เข้าสู่ระบบเพื่อใช้งานพื้นที่ข่าวสารและกิจกรรมภายในมหาวิทยาลัย
            </p>
          </div>

          {/* Card */}
          <Card className="overflow-hidden rounded-3xl border border-red-100 bg-white/95 shadow-2xl shadow-red-100/80 backdrop-blur">
            <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-amber-400" />

            <CardContent className="p-6 md:p-7">
              <div className="mb-6">
                <h2 className="text-center text-2xl font-bold text-slate-900">เข้าสู่ระบบ</h2>
                <p className="mt-1 text-center text-sm text-slate-500">
                  ใช้บัญชี TU เพื่อยืนยันตัวตนและแยกบทบาทอัตโนมัติ
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold text-slate-700">
                    รหัสนักศึกษา / ชื่อผู้ใช้
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Student ID หรือ TU username"
                    disabled={isLoading}
                    className="h-12 rounded-2xl border-red-100 bg-red-50/30 px-4 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500/20"
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                    รหัสผ่าน
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="h-12 rounded-2xl border-red-100 bg-red-50/30 px-4 pr-11 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500/20"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-red-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 h-12 w-full rounded-2xl bg-red-600 text-base font-bold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-700 hover:shadow-red-500/35"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      เข้าสู่ระบบด้วย TU Account
                    </>
                  )}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-red-100" />
                <span className="text-xs font-medium text-slate-400">รองรับบทบาท</span>
                <div className="h-px flex-1 bg-red-100" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  className="rounded-2xl border border-red-100 bg-red-50 p-3 text-center"
                  whileHover={{ y: -2 }}
                >
                  <GraduationCap className="mx-auto mb-1.5 h-5 w-5 text-red-600" />
                  <p className="text-xs font-bold text-red-700">นักศึกษา</p>
                </motion.div>

                <motion.div
                  className="rounded-2xl border border-orange-100 bg-orange-50 p-3 text-center"
                  whileHover={{ y: -2 }}
                >
                  <BookOpen className="mx-auto mb-1.5 h-5 w-5 text-orange-600" />
                  <p className="text-xs font-bold text-orange-700">อาจารย์</p>
                </motion.div>

                <motion.div
                  className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-center"
                  whileHover={{ y: -2 }}
                >
                  <Shield className="mx-auto mb-1.5 h-5 w-5 text-amber-600" />
                  <p className="text-xs font-bold text-amber-700">แอดมิน</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Smart Campus — Thammasat University
          </p>
        </motion.div>
      </div>
    </div>
  );
}