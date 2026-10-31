import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  ExternalLink,
  X,
  Usb,
  Laptop,
  CheckCircle2,
  HardDrive,
  Cable,
  Zap,
  Info,
  ShieldAlert,
  ArrowRight,
  PackageCheck,
  Sparkles,
} from 'lucide-react';

interface UsbDeviceItem {
  productName?: string;
  manufacturerName?: string;
  vendorId?: number;
  productId?: number;
  serialNumber?: string;
}

interface UsbConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsbConnectModal: React.FC<UsbConnectModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'apk_download' | 'file_transfer' | 'webusb' | 'pwa_install'>('apk_download');
  const [isWebUsbSupported, setIsWebUsbSupported] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<UsbDeviceItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [permissionsBlocked, setPermissionsBlocked] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Standalone live URL that can be converted to APK
  const directUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-s5bnehqrghlsoene4wdmrr-146306608312.europe-west1.run.app';
  const pwaBuilderApkUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(directUrl)}`;
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      setIsWebUsbSupported(true);
      try {
        (navigator as any).usb.getDevices().then((devices: any[]) => {
          const mapped = devices.map((d) => ({
            productName: d.productName || 'USB Device',
            manufacturerName: d.manufacturerName || 'Unknown Vendor',
            vendorId: d.vendorId,
            productId: d.productId,
            serialNumber: d.serialNumber,
          }));
          setConnectedDevices(mapped);
        }).catch(() => {});
      } catch {}
    } else {
      setIsWebUsbSupported(false);
    }
  }, []);

  const handleRequestUsbDevice = async () => {
    if (!('usb' in navigator)) {
      setStatusMessage('Browser-kaagu ma taageerayo WebUSB toos ah.');
      return;
    }

    try {
      setIsSearching(true);
      setStatusMessage(null);
      setPermissionsBlocked(false);

      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      if (device) {
        const newDev: UsbDeviceItem = {
          productName: device.productName || 'Android / Mobile Device',
          manufacturerName: device.manufacturerName || 'Mobile Manufacturer',
          vendorId: device.vendorId,
          productId: device.productId,
          serialNumber: device.serialNumber,
        };
        setConnectedDevices((prev) => [newDev, ...prev.filter((d) => d.productId !== newDev.productId)]);
        setStatusMessage(`Taleefanka (${newDev.productName}) si guul leh ayaa loogu xiray USB!`);
      }
    } catch (err: any) {
      const msg = String(err?.message || '');
      const errName = String(err?.name || '');

      if (
        msg.includes('disallowed by permissions policy') ||
        errName === 'SecurityError' ||
        msg.includes('permissions policy') ||
        msg.includes('denied')
      ) {
        setPermissionsBlocked(true);
        setStatusMessage(
          'Digniin Amni: iFrame-ka preview-ga ma ogolaanayo WebUSB toos ah. Fadlan isticmaal soo degsashada rasmiga ah ee APK-ga!'
        );
      } else if (errName !== 'NotFoundError') {
        setStatusMessage(`Xaaladda USB: ${err.message || 'Lama xiriirin karin qalabka USB-ga'}`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadOfflineHTML = () => {
    const offlineHtml = `<!DOCTYPE html>
<html lang="so">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Model#1 Gold Study Agent - USB Mobile Launcher</title>
  <style>
    body { background-color: #020617; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
    .card { background: #0f172a; border: 1px solid #d97706; border-radius: 16px; padding: 28px 24px; max-width: 480px; width: 100%; box-shadow: 0 10px 25px rgba(217, 119, 6, 0.25); }
    h1 { color: #fbbf24; font-size: 22px; margin-bottom: 8px; font-weight: 800; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
    .btn { display: block; background: #f59e0b; color: #020617; padding: 14px 24px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 16px; margin-top: 20px; transition: 0.2s; }
    .btn:hover { background: #fbbf24; transform: translateY(-1px); }
    .badge { background: #3b82f6; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .tip { margin-top: 18px; padding: 12px; background: rgba(245, 158, 11, 0.1); border-radius: 10px; font-size: 12px; color: #fcd34d; text-align: left; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Model#1 Gold • USB Mobile Package</span>
    <h1>XAUUSD Study Agent</h1>
    <p>Ku soo dhowow app-ka Model#1 Gold ee ICT Mentorship. Faylkan waxaad ku soo shubatay USB cable ama xiriir toos ah.</p>
    <a href="${directUrl}" class="btn">🚀 Fur App-ka Buuxa (Launch Model#1)</a>
    <div class="tip">
      💡 <strong>Talo Taleefanka:</strong> Marka uu furmo Chrome-kaaga, guji 3-da dhibcood (⋮) oo dooro <strong>"Install app"</strong> ama <strong>"Add to Home screen"</strong> si uu ugu jiro taleefankaaga sida Application caadi ah.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([offlineHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Model1_Gold_USB_Launcher.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-amber-500/15">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500/25 via-slate-800/80 to-slate-900 border-b border-amber-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300/40 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                Degso Android APK (.apk)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Android File
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sida tooska ah ee aad taleefankaaga ugu soo degsan karto faylka .apk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-5 pt-3 shrink-0">
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] sm:text-xs">
            <button
              onClick={() => setActiveTab('apk_download')}
              className={`py-2 px-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition cursor-pointer text-center ${
                activeTab === 'apk_download'
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5 shrink-0" />
              <span>1. Degso APK</span>
            </button>
            <button
              onClick={() => setActiveTab('file_transfer')}
              className={`py-2 px-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition cursor-pointer text-center ${
                activeTab === 'file_transfer'
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 shrink-0" />
              <span>2. USB File</span>
            </button>
            <button
              onClick={() => setActiveTab('webusb')}
              className={`py-2 px-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition cursor-pointer text-center ${
                activeTab === 'webusb'
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Usb className="w-3.5 h-3.5 shrink-0" />
              <span>3. USB Cable</span>
            </button>
            <button
              onClick={() => setActiveTab('pwa_install')}
              className={`py-2 px-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition cursor-pointer text-center ${
                activeTab === 'pwa_install'
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>4. Direct URL</span>
            </button>
          </div>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          
          {/* TAB 1: APK Download (Primary requested feature) */}
          {activeTab === 'apk_download' && (
            <div className="space-y-4 text-xs">
              
              {/* Highlight Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 space-y-3 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-300 text-sm">
                      Soo Degsashada Faylka Rasmiga ah ee APK (.apk)
                    </h4>
                    <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                      Haa, waan ku fahmay! Haddii aad doonayso faylka rasmiga ah ee <strong>.apk</strong> ee taleefanka Android-ka lagu shubto (sida WhatsApp ama Telegram oo kale), waxaad toos ugu beddelan kartaa oo aad uga soo degsan kartaa badhanka hoose:
                    </p>
                  </div>
                </div>

                {/* Main 1-Click APK Builder Button */}
                <div className="pt-2">
                  <a
                    href={pwaBuilderApkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>⚡ GUJI SI AAD U SAMEYSATO OO U DEGSATO APK (.APK FILE)</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <span className="block text-[10px] text-center text-amber-400/80 mt-1.5 font-medium">
                    (Waxay toos kuu geynaysaa dhismaha APK-ga ee rasmiga ah oo bilaash ah)
                  </span>
                </div>
              </div>

              {/* Step by step guide */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                  Tallaabooyinka Sida Loo Soo Dejiyo & Loo Geliyo Taleefanka:
                </h4>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <div className="text-[11px]">
                      Guji badhanka dahabiga ah ee kore <strong>"GUJI SI AAD U SAMEYSATO OO U DEGSATO APK"</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <div className="text-[11px]">
                      Bogga furma, guji badhanka <strong>"Package for Android"</strong> (ama <strong>"Store Package / APK"</strong>).
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <div className="text-[11px]">
                      Dooro <strong>"Download APK"</strong> si faylka <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">Model1_Gold.apk</code> uu toos ugu soo dego taleefankaaga.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                    <div className="text-[11px]">
                      Fur galka <strong>Download</strong> ee taleefankaaga, taabo faylka APK-ga kadibna ku dhufo <strong>"Install"</strong> (Haddii uu ku weydiiyo ogolaansho, dooro *Allow from this source*).
                    </div>
                  </div>
                </div>
              </div>

              {/* GitHub Actions Capacitor APK Workflow Info */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-sky-300 text-xs">
                    Capacitor & GitHub Actions Workflow (Otomaatik)
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Mashruucan waxaan ku darnay <strong>Capacitor Native Android</strong> iyo <strong>GitHub Actions</strong> workflow (<code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded font-mono">.github/workflows/android.yml</code>).
                  Mar kasta oo aad git push sameyso, GitHub wuxuu si toos ah u dhisayaa <strong>app-debug.apk</strong> adigoo toos uga soo degsan kara qaybta <em>Actions &rarr; Artifacts</em>.
                </p>
              </div>

              {/* Direct App Link for Manual APK Generator */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 block font-medium">
                  Link-ga App-ka ee aad u gelinayso APK Builder kasta:
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-amber-300 text-[11px] truncate block select-all">
                    {directUrl}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold shrink-0 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Waad Koobisay!' : 'Koobi Link-ga'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Direct USB File Transfer (MTP) */}
          {activeTab === 'file_transfer' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  Ku shubida Taleefanka adigoo isticmaalaya USB Storage (MTP):
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-start gap-2.5 text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                    <span>Kombuyuutarkaaga ku xir taleefanka adigoo isticmaalaya <strong>USB Cable</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                    <span>Taleefanka shaashaddiisa ka dooro <strong>"File Transfer"</strong> ama <strong>"MTP"</strong> (ha dooran *Charging only*).</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                    <span>Soo degso faylka launcher-ka hoose oo ku tuur galka <strong>Download</strong> ee taleefankaaga USB-ga ku jira.</span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadOfflineHTML}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>DEJISO FAYLKA LAUNCHER-KA (DOWNLOAD FOR USB)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Direct WebUSB */}
          {activeTab === 'webusb' && (
            <div className="space-y-4 text-xs">
              {(permissionsBlocked || isInIframe) && (
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 space-y-2.5 shadow-lg">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-300 text-xs sm:text-sm">
                        Ogeysiis Amni (iFrame Restriction)
                      </h4>
                      <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                        Browser-ka preview-ga ee AI Studio wuxuu ku dhex jiraa iFrame xannibaya WebUSB. Si aad APK-ga u hesho, tag tab-ka <strong>1. Degso APK</strong>.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('apk_download')}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Tag Tab-ka Degso APK</span>
                  </button>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-slate-200">Xiriirinta Hardware-ka USB:</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Chrome & Edge
                  </span>
                </div>

                <button
                  onClick={handleRequestUsbDevice}
                  disabled={isSearching}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Usb className="w-4 h-4" />
                  <span>DOORO TALEEFANKA KU XIRAN USB</span>
                </button>

                {statusMessage && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Direct URL */}
          {activeTab === 'pwa_install' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-sky-400" />
                  Ku Furo Daaqad Madax-bannaan (Full Window):
                </h4>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Waxaad toos ugu furan kartaa app-ka daaqad cusub oo aan lahayn wax xannibaad ah:
                </p>

                <a
                  href={directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ku Furo Tab Cusub (Open Direct App)</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-amber-400" />
              Android APK Ready
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={pwaBuilderApkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Degso APK</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Xir
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
