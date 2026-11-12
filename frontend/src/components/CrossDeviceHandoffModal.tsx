import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  X, 
  Copy, 
  Check, 
  ShieldCheck
} from 'lucide-react';
import { generateQRCodeDataURL } from '../utils/qrDecoder';
import { getSessionSyncStatus } from '../services/api';

interface CrossDeviceHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayloadReceived: (payload: string) => void;
}

export const CrossDeviceHandoffModal: React.FC<CrossDeviceHandoffModalProps> = ({
  isOpen,
  onClose,
  onPayloadReceived
}) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [pairingUrl, setPairingUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'listening' | 'received'>('listening');
  const [receivedTarget, setReceivedTarget] = useState<string | null>(null);

  // Initialize or reset session when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const newSessionId = 'cs_' + Math.random().toString(36).substring(2, 9);
    setSessionId(newSessionId);
    setSyncStatus('listening');
    setReceivedTarget(null);

    const fullUrl = `${window.location.origin}/scanner?session=${newSessionId}&mode=mobile_upload`;
    setPairingUrl(fullUrl);

    generateQRCodeDataURL(fullUrl)
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate pairing QR:', err));

    // Start polling backend session sync
    const interval = setInterval(async () => {
      try {
        const data = await getSessionSyncStatus(newSessionId);
        if (data.status === 'ready' && data.payload) {
          clearInterval(interval);
          setSyncStatus('received');
          setReceivedTarget(data.payload);
          // Wait 1.5s for user to see success, then pass to caller
          setTimeout(() => {
            onPayloadReceived(data.payload!);
            onClose();
          }, 1500);
        }
      } catch (err) {
        // Silent polling error
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pairingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white border border-[#dedad2] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-[#787570] hover:text-[#141416] hover:bg-[#f7f5f0] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 flex items-center justify-center shrink-0">
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#141416] tracking-tight">
              Scan with Phone Camera
            </h3>
            <p className="text-xs text-[#52504c] font-medium">
              Cross-device upload from your phone gallery or camera
            </p>
          </div>
        </div>

        {/* QR Code Presentation */}
        {syncStatus === 'listening' ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-[#f7f5f0] border border-[#dedad2] rounded-2xl inline-block shadow-inner">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Pairing QR code for mobile upload"
                  className="w-56 h-56 mx-auto rounded-xl border border-white shadow-xs"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Listening State Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#141416]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Waiting for phone upload...</span>
            </div>

            <p className="text-xs text-[#52504c] leading-relaxed max-w-sm mx-auto">
              Scan this QR code using your phone camera. You will be able to take a live photo or pick any QR code screenshot from your phone's photo gallery to transfer it here.
            </p>

            {/* Pairing URL Copy Option */}
            <div className="pt-2 border-t border-[#dedad2] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#52504c]">
                <span>Session ID: <strong className="text-[#141416]">{sessionId}</strong></span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[#ff5500] hover:underline flex items-center gap-1 font-bold"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Link Copied' : 'Copy Mobile Link'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Transfer Success State */
          <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-emerald-950">
                Photo Received from Mobile!
              </h4>
              <p className="text-xs text-[#52504c] mt-1 font-medium">
                Populating target into the investigation workspace...
              </p>
            </div>
            <div className="p-3.5 bg-[#f7f5f0] border border-[#dedad2] rounded-xl text-xs font-mono text-[#141416] break-all max-h-24 overflow-y-auto">
              {receivedTarget}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
