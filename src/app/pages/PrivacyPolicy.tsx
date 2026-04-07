export function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12 bg-secondary/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-foreground mb-6">隐私政策</h1>
        <div className="rounded-3xl border border-border bg-white p-6 space-y-4 text-muted-foreground leading-8">
          <p>我们重视你的隐私，只有在提供服务所必需时才会收集基础账号信息。</p>
          <p>你的数据将用于登录鉴权、会员权益识别、收藏与学习进度等核心功能。</p>
          <p>除法律要求或你明确授权外，我们不会向第三方出售你的个人信息。</p>
          <p>如需删除账号数据，可通过客服渠道提交申请，我们会在核验后处理。</p>
        </div>
      </div>
    </div>
  );
}
