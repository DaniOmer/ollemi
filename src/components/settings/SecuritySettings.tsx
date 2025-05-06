import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SecuritySettings() {
  const { t } = useTranslations();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = () => {
    // Password update logic would go here
    console.log("Password update requested");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.security")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="current-password">
              {t("settings.currentPassword")}
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-password">{t("settings.newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">
              {t("settings.confirmPassword")}
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button variant="default" onClick={handleUpdatePassword}>
            {t("settings.updatePassword")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
