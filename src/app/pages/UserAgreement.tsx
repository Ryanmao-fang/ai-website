export function UserAgreement() {
  return (
    <div className="min-h-screen py-12 bg-secondary/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-foreground mb-6">用户协议</h1>
        <div className="rounded-3xl border border-border bg-white p-6 space-y-4 text-muted-foreground leading-8">
          <p>欢迎使用 CommononesAI。本协议用于说明你与平台之间的使用规则。</p>
          <p>你注册并使用本站，即表示同意遵守平台规则、合法使用本站内容与服务。</p>
          <p>会员服务为付费内容，订阅后可在有效期内访问会员资源。</p>
          <p>我们保留在法律允许范围内更新协议条款的权利，更新后将在站内公示。</p>
        </div>
      </div>
    </div>
  );
}
