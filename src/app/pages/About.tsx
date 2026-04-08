import { Link } from "react-router";
import { Sparkles, Target, Heart, Users } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { siteConfig } from "@/lib/siteConfig";

export function About() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">关于我们</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
              {siteConfig.brandName} 是谁？
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              我们面向中文用户，用通俗语言整理 AI
              概念与工具，帮助个人与团队在可控成本内把大模型用起来。
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: "目标",
              text: "用清晰结构与可操作建议，降低「看得懂但用不起来」的门槛。",
            },
            {
              icon: Heart,
              title: "态度",
              text: "拒绝制造焦虑；不神化模型，也不回避局限与合规要求。",
            },
            {
              icon: Users,
              title: "社区",
              text: "欢迎反馈与纠错；模板与路线会持续按真实场景增补。",
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="rounded-3xl border-border p-8 h-full text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">{item.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">商务与合作</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            媒体采访、企业培训、内容授权等合作，请通过「联系我们」说明来意与期望时间，我们会尽快回复。
          </p>
          <Link to="/contact">
            <Button className="rounded-full bg-primary hover:bg-accent px-8 h-12">前往联系页面</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
