export type MembershipTier = "free" | "standard" | "pro";

export type AccessMinTier = "auth" | "standard" | "pro";

const RANK: Record<MembershipTier, number> = {
  free: 0,
  standard: 1,
  pro: 2,
};

export function tierMeetsMin(tier: MembershipTier, min: AccessMinTier): boolean {
  if ("auth" === min) {
    return true;
  }
  if ("standard" === min) {
    return RANK[tier] >= RANK.standard;
  }
  return RANK[tier] >= RANK.pro;
}

export function tierDisplayName(tier: MembershipTier): string {
  if ("pro" === tier) {
    return "专业会员";
  }
  if ("standard" === tier) {
    return "进阶会员";
  }
  return "免费版";
}
