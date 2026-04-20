import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Check, Crown, Sparkles, Star } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { apiClient, ApiNetworkError } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { trackEventSafe } from "@/lib/telemetry";

type PayChannel = "mock" | "alipay_pc" | "wechat_native";

export function Membership() {
  const { userId, accessToken, refreshMe } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [processingPlan, setProcessingPlan] = useState<string>("");
  const [payChannel, setPayChannel] = useState<PayChannel>(
    import.meta.env.DEV ? "mock" : "alipay_pc"
  );
  const [wechatDialogOpen, setWechatDialogOpen] = useState(false);
  const [wechatCodeUrl, setWechatCodeUrl] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const pollOrderUntilPaid = useCallback(
    (orderId: string) => {
      stopPoll();
      let attempts = 0;
      const maxAttempts = 150;

      const tick = async () => {
        attempts += 1;
        if (attempts > maxAttempts) {
          stopPoll();
          return;
        }
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;
          if (!token) {
            return;
          }
          const row = await apiClient.getPaymentOrder(token, orderId);
          if (row.status === "paid") {
            void trackEventSafe({
              eventName: "checkout_success",
              userId,
              payload: { payChannel: "wechat_native", result: "paid" },
            });
            stopPoll();
            setWechatDialogOpen(false);
            await refreshMe();
            navigate("/user", { replace: true });
          }
        } catch {
          /* 轮询失败时忽略，下次继续 */
        }
      };

      void tick();
      pollRef.current = setInterval(() => {
        void tick();
      }, 2000);
    },
    [refreshMe, navigate, userId]
  );

  useEffect(() => {
    return () => stopPoll();
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if ("return" === q.get("pay")) {
      refreshMe();
    }
  }, [location.search, refreshMe]);

  useEffect(() => {
    void trackEventSafe({
      eventName: "membership_view",
      userId,
      payload: { entry: "membership_page" },
    });
  }, [userId]);

  const handleSubscribe = async (planName: string) => {
    if (!userId || !accessToken) {
      alert("请先登录后再开通会员");
      return;
    }

    const planTier = "专业会员" === planName ? "pro" : "standard";
    const normalizedPlan =
      "进阶会员" === planName || "专业会员" === planName ? billingCycle : "monthly";

    setProcessingPlan(planName);
    try {
      void trackEventSafe({
        eventName: "checkout_start",
        userId,
        payload: {
          plan: normalizedPlan,
          planTier,
          payChannel,
        },
      });
      const result = await apiClient.createMembershipOrder(accessToken, {
        plan: normalizedPlan,
        planTier,
        payChannel,
      });

      if (result.payMode === "mock") {
        void trackEventSafe({
          eventName: "checkout_success",
          userId,
          payload: { plan: normalizedPlan, planTier, payChannel: "mock" },
        });
        alert(`已模拟开通会员，订单号：${String(result.orderId)}`);
        await refreshMe();
        return;
      }

      if (result.payMode === "alipay_form" && result.payFormHtml) {
        const w = window.open("", "_blank");
        if (w) {
          w.document.write(String(result.payFormHtml));
          w.document.close();
        } else {
          const div = document.createElement("div");
          div.innerHTML = String(result.payFormHtml);
          document.body.appendChild(div);
        }
        alert("已打开支付宝收银台，支付完成后返回站点刷新即可；也可稍后在「会员页」查看权益。");
        return;
      }

      if (result.payMode === "wechat_native" && result.codeUrl) {
        setWechatCodeUrl(String(result.codeUrl));
        setWechatDialogOpen(true);
        pollOrderUntilPaid(String(result.orderId));
      }
    } catch (error) {
      if (error instanceof ApiNetworkError) {
        alert(error.message);
      } else {
        const msg = (error as Error)?.message || "";
        if (msg.toLowerCase().includes("fetch") || msg.includes("网络")) {
          alert("无法连接支付服务。请检查网络与接口域名配置，稍后重试或联系客服。");
        } else {
          alert(msg || "开通失败");
        }
      }
    } finally {
      setProcessingPlan("");
    }
  };


  const plans = [
    {
      name: "免费版",
      price: { monthly: 0, yearly: 0 },
      description: "适合刚开始接触AI的朋友",
      icon: "🌱",
      color: "from-emerald-500 to-teal-500",
      features: [
        { text: "浏览所有AI名词", included: true },
        { text: "访问工具库", included: true },
        { text: "收藏功能", included: false },
        { text: "学习记录追踪", included: false },
        { text: "访问高级模板", included: false },
        { text: "专属学习计划", included: false },
        { text: "优先客服与线下活动", included: false },
        { text: "专业版深度权益", included: false },
      ],
      recommended: false,
    },
    {
      name: "进阶会员",
      price: { monthly: 29, yearly: 290 },
      description: "深入学习，全面掌握AI技能",
      icon: "🌿",
      color: "from-teal-500 to-cyan-500",
      features: [
        { text: "所有免费版功能", included: true },
        { text: "收藏功能", included: true },
        { text: "学习记录追踪", included: true },
        { text: "访问高级模板", included: true },
        { text: "专属学习计划", included: true },
        { text: "优先客服支持", included: true },
        { text: "线下活动优先", included: true },
        { text: "企业级模板与1对1辅导", included: false },
      ],
      recommended: true,
    },
    {
      name: "专业会员",
      price: { monthly: 99, yearly: 990 },
      description: "为专业人士和企业定制",
      icon: "🌳",
      color: "from-green-500 to-emerald-600",
      features: [
        { text: "所有进阶版功能", included: true },
        { text: "1对1学习辅导", included: true },
        { text: "独家深度课程", included: true },
        { text: "企业级模板库", included: true },
        { text: "优先体验新功能", included: true },
        { text: "专属社群交流", included: true },
        { text: "线下活动优先", included: true },
        { text: "定制化学习方案", included: true },
      ],
      recommended: false,
    },
  ];

  const benefits = [
    {
      icon: "📚",
      title: "系统化学习",
      description: "完整的知识体系，循序渐进掌握AI",
    },
    {
      icon: "🎯",
      title: "实战导向",
      description: "丰富的实用模板，直接应用到工作中",
    },
    {
      icon: "👥",
      title: "社群支持",
      description: "与同行交流，共同成长进步",
    },
    {
      icon: "⚡",
      title: "持续更新",
      description: "紧跟AI发展，第一时间获取新知识",
    },
  ];

  return (
    <div className="figma-page py-12">
      <div className="figma-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Crown className="w-4 h-4" />
            <span className="text-sm">升级会员，解锁更多权益</span>
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-4">选择适合你的计划</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            无论你是AI新手还是资深玩家，都能找到最适合的学习方案
          </p>
        </motion.div>

        {/* 支付方式 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="max-w-xl mx-auto mb-8"
        >
          <p className="text-center text-sm text-muted-foreground mb-3">支付方式</p>
          <div className="flex flex-wrap justify-center gap-2">
            {import.meta.env.DEV ? (
              <Button
                type="button"
                variant={payChannel === "mock" ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setPayChannel("mock")}
              >
                本地模拟
              </Button>
            ) : null}
            <Button
              type="button"
              variant={payChannel === "alipay_pc" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setPayChannel("alipay_pc")}
            >
              支付宝
            </Button>
            <Button
              type="button"
              variant={payChannel === "wechat_native" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setPayChannel("wechat_native")}
            >
              微信扫码
            </Button>
          </div>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-4 p-2 bg-muted rounded-full">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              月付
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === "yearly"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              年付
              <Badge className="ml-2 rounded-full bg-primary text-white border-0 text-xs">
                省20%
              </Badge>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card
                className={`rounded-3xl p-8 h-full flex flex-col relative overflow-hidden ${
                  plan.recommended
                    ? "border-primary shadow-xl scale-105"
                    : "border-border hover:shadow-lg"
                } transition-all`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-2xl">
                    <span className="text-sm flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      推荐
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">{plan.icon}</div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-4xl font-semibold text-foreground">
                      ¥{plan.price[billingCycle]}
                    </span>
                    {plan.price[billingCycle] > 0 && (
                      <span className="text-muted-foreground mb-1">
                        /{billingCycle === "monthly" ? "月" : "年"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 mb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            feature.included ? "text-foreground" : "text-muted-foreground"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className={`w-full rounded-full h-12 ${
                    plan.recommended
                      ? "bg-primary hover:bg-accent"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={"免费版" === plan.name || ("" !== processingPlan && processingPlan === plan.name)}
                >
                  {plan.price[billingCycle] === 0
                    ? "当前计划"
                    : (processingPlan === plan.name ? "处理中..." : "立即订阅")}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-semibold text-foreground text-center mb-12">会员特权</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="rounded-3xl border-border p-6 bg-white hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-semibold text-foreground text-center mb-6">用户评价</h2>
          <Card className="rounded-3xl border-dashed border-2 border-border p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5">
            <Star className="w-10 h-10 text-primary mx-auto mb-4 opacity-80" />
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-4">
              我们正在招募首批真实体验官。欢迎通过
              <Link to="/feedback" className="text-primary hover:underline mx-1">
                意见反馈
              </Link>
              留下你的学习场景与建议；入选展示的评价将经你确认后才会公开。
            </p>
            <p className="text-xs text-muted-foreground">当前不展示未经审核的虚构评价，以避免误导决策。</p>
          </Card>
        </motion.div>

        {/* FAQ CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Card className="rounded-3xl border-border p-12 bg-gradient-to-br from-primary/10 to-accent/10">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-3">还有疑问？</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
              我们的客服团队随时为您解答，让您放心选择最适合的方案
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/contact">
                <Button className="rounded-full bg-primary hover:bg-accent px-8">联系页面</Button>
              </Link>
              <Link to="/support/tickets">
                <Button variant="outline" className="rounded-full border-border px-8">
                  我的工单
                </Button>
              </Link>
              <Link to="/membership/benefits">
                <Button variant="outline" className="rounded-full border-border px-8">
                  权益落地索引
                </Button>
              </Link>
              <Link to="/legal/user-agreement">
                <Button variant="ghost" className="rounded-full px-8">
                  退款与发票条款
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        <Dialog
          open={wechatDialogOpen}
          onOpenChange={(open) => {
            setWechatDialogOpen(open);
            if (!open) {
              stopPoll();
            }
          }}
        >
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle>微信扫码支付</DialogTitle>
              <DialogDescription>
                使用微信扫一扫完成付款；支付成功后将自动跳转个人中心（也可关闭弹窗后在会员页查看）。
              </DialogDescription>
            </DialogHeader>
            {wechatCodeUrl ? (
              <div className="flex flex-col items-center gap-4 py-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(wechatCodeUrl)}`}
                  alt="微信支付二维码"
                  className="rounded-2xl border border-border"
                />
                <p className="text-xs text-muted-foreground text-center">长时间未到账请核对商户平台回调地址是否公网可访问</p>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
