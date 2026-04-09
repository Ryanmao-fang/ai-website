import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { apiClient, ApiNetworkError } from "@/lib/api";
import { ChevronDown, ChevronUp, ClipboardCheck } from "lucide-react";

type Q = { id: string; prompt: string; options: string[]; points: number };

type AssessmentPayload = {
  topic: string;
  maxTotal: number;
  passScore: number;
  sections: { A: Q[]; B: Q[]; C: Q[] };
};

type ExamRow = {
  dayIndex: number;
  total: number;
  passed: boolean;
  scoreA: number;
  scoreB: number;
  scoreC: number;
};

type Props = {
  level: string;
  dayIndex: number;
  unlocked: boolean;
  accessToken: string | null;
  initial: ExamRow | null;
  onUpdate: () => void;
};

export function LearningDayExamPanel({ level, dayIndex, unlocked, accessToken, initial, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [submitHint, setSubmitHint] = useState("");

  useEffect(() => {
    if (!open || assessment) {
      return;
    }
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const data = await apiClient.getLearningAssessment(level, dayIndex);
        setAssessment(data as AssessmentPayload);
      } catch (e) {
        setError((e as Error)?.message || "加载题目失败");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, assessment, level, dayIndex]);

  const passed = Boolean(initial?.passed);
  const totalShown = initial?.total;

  const pick = (id: string, idx: number) => {
    setAnswers((prev) => ({ ...prev, [id]: idx }));
  };

  const submit = async () => {
    if (!accessToken) {
      setSubmitHint("请先登录");
      return;
    }
    if (!assessment) {
      return;
    }
    const need = [...assessment.sections.A, ...assessment.sections.B, ...assessment.sections.C].map((q) => q.id);
    const missing = need.filter((id) => answers[id] === undefined || answers[id] === null);
    if (missing.length > 0) {
      setSubmitHint("请答完所有题目");
      return;
    }
    setSubmitHint("");
    setLoading(true);
    try {
      await apiClient.submitLearningDayExam(accessToken, { level, dayIndex, answers });
      setSubmitHint("已提交");
      onUpdate();
    } catch (e) {
      const msg = e instanceof ApiNetworkError ? e.message : (e as Error)?.message || "提交失败";
      setSubmitHint(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!unlocked) {
    return (
      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-3">
        当日未解锁：需上一日考核达到 80 分。
      </p>
    );
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <button
        type="button"
        className="w-full flex items-center justify-between text-sm font-medium text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="inline-flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-primary" />
          日考核（A 习题 / B 闯关 / C 情景，共 100 分，80 分解锁下一天）
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {passed ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-emerald-100 text-emerald-800 border-0">已通过 · 总分 {totalShown ?? "-"}</Badge>
        </div>
      ) : null}

      {open ? (
        <div className="mt-3 space-y-4">
          {loading && !assessment ? <p className="text-sm text-muted-foreground">加载题目…</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {assessment ? (
            <>
              <p className="text-xs text-muted-foreground">本节主题：{assessment.topic}</p>
              {(
                [
                  ["A", "习题巩固", assessment.sections.A],
                  ["B", "闯关测验", assessment.sections.B],
                  ["C", "情景实战", assessment.sections.C],
                ] as const
              ).map(([secKey, secLabel, qs]) => (
                <Card key={secKey} className="rounded-2xl border-border p-4 bg-muted/20">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    {secKey} · {secLabel}
                  </p>
                  <div className="space-y-4">
                    {qs.map((q) => (
                      <div key={q.id}>
                        <p className="text-sm text-foreground mb-2">{q.prompt}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, idx) => (
                            <label
                              key={idx}
                              className={`flex gap-2 items-start rounded-xl border px-3 py-2 text-sm cursor-pointer ${
                                answers[q.id] === idx ? "border-primary bg-primary/5" : "border-border"
                              }`}
                            >
                              <input
                                type="radio"
                                className="mt-1"
                                checked={answers[q.id] === idx}
                                onChange={() => pick(q.id, idx)}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" className="rounded-full" disabled={loading || passed} onClick={() => void submit()}>
                  {passed ? "已通过" : "提交判分"}
                </Button>
                {submitHint ? <span className="text-xs text-muted-foreground">{submitHint}</span> : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
