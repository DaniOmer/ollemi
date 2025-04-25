import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProQRCodeProps {
  companyId: string;
  baseUrl: string;
}

export default function ProQRCode({ companyId, baseUrl }: ProQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const profileUrl = `${baseUrl}/pro/${companyId}`;

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) {
      const svg = qrRef.current.querySelector("svg");
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");

        // Download PNG
        const downloadLink = document.createElement("a");
        downloadLink.download = `${companyId}-qrcode.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };

      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
      return;
    }

    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.download = `${companyId}-qrcode.png`;
    downloadLink.href = pngUrl;
    downloadLink.click();
  };

  const copyProfileUrl = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          QR Code de votre profil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div ref={qrRef} className="bg-white p-4 rounded-lg">
            <QRCode
              value={profileUrl}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>

          <div className="text-sm text-center text-muted-foreground">
            Ce QR code permet à vos clients d'accéder directement à votre profil
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button onClick={downloadQRCode} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
            <Button
              variant="outline"
              onClick={copyProfileUrl}
              className="flex-1"
            >
              {copied ? "Copié!" : "Copier le lien"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
