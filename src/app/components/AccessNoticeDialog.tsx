import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { motion } from "motion/react";

type AccessNoticeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "login" | "upgrade";
  /** 登录流程：点了「去登录」后由父级打开 LoginDialog */
  onRequestLogin: () => void;
};

export function AccessNoticeDialog({
  open,
  onOpenChange,
  variant,
  onRequestLogin,
}: AccessNoticeDialogProps) {
  const isLogin = "login" === variant;

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
            <DialogTitle className="text-2xl">
              {isLogin ? "需要登录" : "需要升级会员"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isLogin ? "请登录后重试。" : "请升级会员后重试。"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {isLogin ? (
              <Button
                className="w-full rounded-full bg-primary hover:bg-accent"
                onClick={() => {
                  onOpenChange(false);
                  onRequestLogin();
                }}
              >
                去登录
              </Button>
            ) : (
              <>
                <Link to="/membership" className="w-full">
                  <Button
                    className="w-full rounded-full bg-primary hover:bg-accent"
                    onClick={() => onOpenChange(false)}
                  >
                    前往会员中心
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-border"
                  onClick={() => onOpenChange(false)}
                >
                  稍后再说
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
