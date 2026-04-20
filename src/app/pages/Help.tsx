import { ChevronDown } from "lucide-react";
import { Card } from "../components/ui/card";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useState } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { clearBrowseHistory } from "@/lib/browseHistory";
import { Button } from "../components/ui/button";

const faqItems = [
  {
    q: "为什么我已经登录，点击进阶内容仍提示升级？",
    a: "学习路线、模板库等部分能力需要进阶或专业会员。若刚完成支付，请刷新页面；仍异常请通过联系页面附上订单号，以便核对开通状态。",
  },
  {
    q: "收藏与进度保存在哪里？",
    a: "会员收藏保存在账号下。学习路线勾选在登录后会尝试同步至云端（需部署 learning_progress 表）；若未登录或同步失败，则仅保存在本机浏览器。清除站点数据会删除本机进度与浏览历史。",
  },
  {
    q: "支付遇到「无法连接」或失败怎么办？",
    a: "请确认使用的网站域名与后台接口域名已在同一安全策略下配置；会员页提供支付自助排查说明。微信商户需完成公网回调配置后再行开通（您可在拿到商户参数后由管理员接入）。",
  },
  {
    q: "内容与工具外链是否代表官方背书？",
    a: "工具外链仅作方便跳转，服务条款、价格与可用地区以各产品官网为准。详见站内用户协议与免责声明。",
  },
  {
    q: "如何申请删除账号与数据？",
    a: `请发邮件至 ${siteConfig.supportEmail}，说明注册邮箱与删除诉求。我们会在核验身份后处理，具体规则见隐私政策。`,
  },
];

export function Help() {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <div className="figma-page">
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="figma-container relative text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <span className="text-sm">帮助中心</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-4">常见问题</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              未解决？请前往
              <Link to="/contact" className="text-primary hover:underline mx-1">
                联系我们
              </Link>
              或
              <Link to="/feedback" className="text-primary hover:underline mx-1">
                意见反馈
              </Link>
              。
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 bg-white">
        <div className="figma-container max-w-3xl space-y-3">
          {faqItems.map((item, index) => {
            const open = openId === index;
            return (
              <Card key={item.q} className="rounded-3xl border-border overflow-hidden">
                <button
                  type="button"
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
                  onClick={() => setOpenId(open ? null : index)}
                >
                  <span className="font-medium text-foreground">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open ? (
                  <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {item.a}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>

        <div className="figma-container max-w-3xl mt-12">
          <Card className="rounded-3xl border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground">浏览记录与打印</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              「最近浏览」仅存于本机，用于个人中心展示。您可随时清空；不参与跨端同步。
            </p>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-border"
              onClick={() => {
                clearBrowseHistory();
                alert("已清空本机浏览历史记录");
              }}
            >
              清空本机浏览历史
            </Button>
            <p className="text-sm text-muted-foreground leading-relaxed">
              需要纸质材料时，可直接使用浏览器的「打印」功能；我们未对打印样式做单独强样式，建议在打印预览中勾选「背景图形」以获得更接近屏幕的配色。
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
