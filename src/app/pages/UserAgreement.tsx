import { Link } from "react-router";
import { siteConfig } from "@/lib/siteConfig";

export function UserAgreement() {
  return (
    <div className="min-h-screen py-12 bg-secondary/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">用户协议</h1>
        <p className="text-sm text-muted-foreground mb-6">
          最近修订：{siteConfig.legalLastUpdated}；适用于 {siteConfig.brandName} 网站及相关在线服务。
        </p>
        <div className="rounded-3xl border border-border bg-white p-6 space-y-5 text-muted-foreground leading-8 text-sm">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. 定义与接受</h2>
            <p>
              本协议是你与 {siteConfig.brandName}
              之间关于使用本站与相关服务条款。你注册、登录或以其它方式实际使用服务，即视为已阅读并同意本协议及不时更新的规则。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. 账号与安全</h2>
            <p>
              你应妥善保管登录凭据，对账号下的行为负责。如发现未经授权使用，请立即联系
              {siteConfig.supportEmail}。因你自身原因导致的损失，除法律另有规定外，本平台在合理范围内协助但不承担赔偿责任。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. 服务内容</h2>
            <p>
              本站提供 AI
              通识内容、工具索引、学习路线与模板等线上资源；具体可用范围随会员档位与功能迭代调整，请以站内说明为准。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. 会员与付费</h2>
            <p>
              会员服务为数字化在线内容服务。价格、周期与权益以付款前页面展示为准。税费（如有）按法律规定在结算页或发票中列示；促销价与「年付优惠比例」以实际扣款金额为准。
            </p>
            <p>
              自动续费（若开通）：周期与取消方式以支付渠道与站内说明为准；涨价或规则调整将提前在站内公告或邮件告知合理期限。
            </p>
            <p>
              发票：企业用户可申请对公支付与增值税发票，请联系客服并在工单中注明抬头与税号；个人用户以支付平台电子凭证为准，除非当地法律另有强制要求。
            </p>
            <p>
              退款与冷静期：数字内容消费适用法律法规关于在线信息服务的规定；除法定或我们公示的特殊情形外，已交付的会员期原则上不办理无理由退款。如因重大故障导致长期无法使用核心服务，请通过客服工单申请核查。
            </p>
            <p>
              会员专项规则索引：
              <Link to="/membership/benefits" className="text-primary hover:underline mx-1">
                权益落地说明
              </Link>
              与站内会员页公示同步更新。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. 第三方工具、外链与生成式内容</h2>
            <p>
              站内对第三方工具的链接仅为你提供便利。第三方服务条款、价格、可用区域及数据处理方式以其官网为准，你应自行评估合规与风险。不代表本平台与第三方存在合作关系。产品界面截图与商标仅作识别说明，权利归各权利人所有。
            </p>
            <p>
              生成式 AI 输出具有不确定性；你不应将自动化输出直接用于医疗、法律、金融等高风险决策而不经专业人士复核。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. 知识产权</h2>
            <p>
              本站原创内容受法律保护；未经授权不得抓取、批量复制用于商业竞争或再许可。你在「意见投稿」中提交的内容，应保证不侵犯他人权利。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. 免责声明</h2>
            <p>
              生成式 AI
              内容与工具输出可能存在偏差或不适用你所在场景。你应将关键输出用于生产或合规场景前进行人工校验。因不可抗力、第三方服务中断或非可归责于本平台的原因导致的损失，本平台在法律允许范围内不承担责任。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. 协议变更与终止</h2>
            <p>
              我们可根据运营与合规要求更新条款，并于站内公示。你继续使用即视为接受更新后的条款；如不同意，应停止使用并可在规则允许范围内申请关闭账号。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">9. 联系方式</h2>
            <p>
              客服邮箱：{siteConfig.supportEmail}。未成年人应在监护人指导下使用付费与账号功能；详见
              <Link to="/legal/privacy-policy" className="text-primary hover:underline">
                隐私政策
              </Link>
              。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
