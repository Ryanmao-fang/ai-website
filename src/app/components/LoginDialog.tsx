import { useState } from "react";
import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Mail } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/lib/supabase";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeLegal, setAgreeLegal] = useState(false);

  const handleSignIn = async () => {
    setErrorText("");
    setSuccessText("");
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      onOpenChange(false);
    } catch (error) {
      const message = (error as Error)?.message || "登录失败";
      if (message.toLowerCase().includes("email not confirmed")) {
        setErrorText("该邮箱尚未验证，请先到邮箱点击验证链接，再登录。");
      } else {
        setErrorText(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorText("");
    setSuccessText("");
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorText("请先填写注册时使用的邮箱");
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/`;
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      });
      if (error) {
        setErrorText(error.message);
      } else {
        setSuccessText("重置邮件已发送，请到邮箱点击链接并按提示设置新密码。");
      }
    } catch (error) {
      setErrorText((error as Error)?.message || "发送失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setErrorText("");
    setSuccessText("");
    if (!agreeLegal) {
      setErrorText("请勾选同意用户协议与隐私政策");
      return;
    }
    if (password.length < 8) {
      setErrorText("密码建议至少 8 位，混合字母与数字更安全");
      return;
    }
    if (password !== confirmPassword) {
      setErrorText("两次密码不一致");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(email.trim(), password);
      if (result.needEmailConfirm) {
        setSuccessText("注册成功，请先到邮箱完成验证，再回来登录。");
      } else {
        setSuccessText("注册成功，已自动登录。");
        onOpenChange(false);
      }
    } catch (error) {
      setErrorText((error as Error)?.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-border shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl">登录或注册</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              登录后可按方案解锁名词、工具库、学习路线与模板等权益
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-full">
              <TabsTrigger value="login" className="rounded-full">
                <Mail className="w-4 h-4 mr-2" />
                邮箱
              </TabsTrigger>
              <TabsTrigger value="register" className="rounded-full">
                注册
              </TabsTrigger>
              <TabsTrigger value="phone" className="rounded-full text-xs sm:text-sm">
                手机
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">邮箱</Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-2xl border-border bg-input-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login">密码</Label>
                <Input
                  id="password-login"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-2xl border-border bg-input-background"
                />
              </div>
              <Button
                className="w-full rounded-full bg-primary hover:bg-accent mt-2"
                onClick={handleSignIn}
                disabled={loading}
              >
                {loading ? "登录中..." : "登录"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-full text-muted-foreground"
                onClick={() => void handleResetPassword()}
                disabled={loading}
              >
                忘记密码？邮件重置
              </Button>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                短信登录/微信扫码依赖运营商与备案主体资质，当前为预留入口。请暂时使用邮箱注册；企业批量接入可邮联运营。
              </p>
              <Button type="button" variant="outline" className="w-full rounded-full border-border" disabled>
                即将开放
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-register">邮箱</Label>
                <Input
                  id="email-register"
                  type="email"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-2xl border-border bg-input-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register">密码</Label>
                <Input
                  id="password-register"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-2xl border-border bg-input-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password-register">确认密码</Label>
                <Input
                  id="confirm-password-register"
                  type="password"
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-2xl border-border bg-input-background"
                />
              </div>
              <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-border"
                  checked={agreeLegal}
                  onChange={(e) => setAgreeLegal(e.target.checked)}
                />
                <span>
                  我已阅读并同意
                  <Link to="/legal/user-agreement" className="text-primary hover:underline mx-1">
                    用户协议
                  </Link>
                  与
                  <Link to="/legal/privacy-policy" className="text-primary hover:underline mx-1">
                    隐私政策
                  </Link>
                </span>
              </label>
              <Button
                className="w-full rounded-full bg-primary hover:bg-accent mt-2"
                onClick={handleSignUp}
                disabled={loading}
              >
                {loading ? "注册中..." : "注册"}
              </Button>
            </TabsContent>
          </Tabs>

          {errorText ? <p className="text-sm text-destructive mt-3">{errorText}</p> : null}
          {successText ? <p className="text-sm text-emerald-600 mt-3">{successText}</p> : null}

          <p className="text-center text-sm text-muted-foreground mt-6">
            登录即视为已知晓
            <Link to="/legal/user-agreement" className="text-primary hover:underline">
              用户协议
            </Link>
            与
            <Link to="/legal/privacy-policy" className="text-primary hover:underline">
              隐私政策
            </Link>
            摘要条款；完整内容见站内法务页。
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
