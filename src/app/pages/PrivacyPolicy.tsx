import { Link } from "react-router";
import { siteConfig } from "@/lib/siteConfig";

export function PrivacyPolicy() {
  return (
    <div className="figma-page py-12 bg-secondary/30">
      <div className="figma-container max-w-4xl">
        <h1 className="text-3xl font-semibold text-foreground mb-2">隐私政策</h1>
        <p className="text-sm text-muted-foreground mb-6">
          最近修订：{siteConfig.legalLastUpdated}；适用于 {siteConfig.brandName} 网站及相关在线服务。
        </p>
        <div className="rounded-3xl border border-border bg-white p-6 space-y-5 text-muted-foreground leading-8 text-sm">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. 我们收集的信息</h2>
            <p>
              为实现注册登录、会员权益识别、收藏与（在你主动使用时）订单处理，我们可能处理：邮箱、会话标识、会员状态摘要、收藏目标标识、支付订单元数据（金额、渠道、状态等）。部分功能使用本机浏览器存储记录最近浏览与学习进度勾选。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. 使用目的</h2>
            <p>
              用于身份验证、提供与改进服务、安全防护、客户支持、合规审计及在你同意或法律要求下的其它场景。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. 存储与地点</h2>
            <p>
              认证与部分业务数据由第三方身份/数据库服务托管（如 Supabase），其数据中心位置与处理规则以该供应商公开政策为准。我们会尽量采取合理措施限制访问。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. 保留期限</h2>
            <p>
              在实现目的所必需的期间内保留；当你申请删除账号或法规要求我们删除时，我们将在合理期限内处理，依法需留存的信息除外。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Cookie 与本地存储</h2>
            <p>
              为保持登录态与记住站点偏好，我们可能使用浏览器存储技术。你可以在浏览器设置中清理；清理后可能需要重新登录，本机进度类数据可能丢失。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. 第三方与 SDK</h2>
            <p>
              我们可能集成支付、地图与统计等第三方能力；其清单与权限随功能迭代调整。除法律另有规定或合同另有约定外，我们不会出售你的个人信息。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. 你的权利</h2>
            <p>
              你可以与我们联系以访问、更正、删除个人信息或撤回同意（如适用）。请求邮箱：
              {siteConfig.supportEmail}。我们将在核验身份后于合理期限内响应。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. 未成年人</h2>
            <p>
              若你为未成年人，应在监护人指导下使用本站，尤其是付费行为；监护人可联系我们行使相关权利。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">9. 本政策更新</h2>
            <p>
              我们可能更新本政策并在站内公示；重大变更将尽量以显著方式提示。继续使用即表示你在适用法下同意更新内容。
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">10. 与协议的关系</h2>
            <p>
              本政策与
              <Link to="/legal/user-agreement" className="text-primary hover:underline">
                用户协议
              </Link>
              共同构成你使用服务的重要规则。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
