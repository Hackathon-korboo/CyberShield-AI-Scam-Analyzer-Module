import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Smartphone, 
  AlertTriangle, 
  ArrowLeft,
  Check
} from 'lucide-react';
import { decodeQRFromImage } from '../utils/qrDecoder';
import { publishSessionSync } from '../services/api';

interface MobileUploadPortalProps {
  sessionId: string;
  onClose?: () => void;
}

export const MobileUploadPortal: React.FC<MobileUploadPortalProps> = ({ sessionId, onClose }) => {
  const [decoding, setDecoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPayload, setSuccessPayload] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setDecoding(true);
    setError(null);
    setSuccessPayload(null);

    // Show thumbnail preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const decoded = await decodeQRFromImage(file);
      await publishSessionSync({
        session_id: sessionId,
        payload: decoded,
        source_device: 'mobile'
      });
      setSuccessPayload(decoded);
    } catch (err: any) {
      setError(
        err?.message ||
        'No readable QR code found in this photo. You can take another photo or type the target manually below.'
      );
    } finally {
      setDecoding(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    setDecoding(true);
    setError(null);
    try {
      await publishSessionSync({
        session_id: sessionId,
        payload: manualText.trim(),
        source_device: 'mobile'
      });
      setSuccessPayload(manualText.trim());
    } catch (err: any) {
      setError('Failed to transmit target to laptop session. Please try again.');
    } finally {
      setDecoding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efece6] text-[#141416] p-4 sm:p-6 flex flex-col justify-between font-sans">
      <div className="max-w-md mx-auto w-full space-y-6 pt-4">
        {/* Header */}
        <div className="bg-white border border-[#dedad2] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 flex items-center justify-center">
                <Smartphone size={16} />
              </div>
              <span className="font-extrabold text-sm uppercase tracking-wider font-mono">
                Mobile Scanner Portal
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Paired
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#f7f5f0] border border-[#dedad2] text-xs font-mono text-[#52504c]">
            Connected Session: <span className="font-bold text-[#141416] select-all">{sessionId}</span>
          </div>

          <p className="text-xs text-[#52504c] font-medium leading-relaxed">
            Take a photo with your phone camera or choose a screenshot from your gallery. It will instantly transfer and display on your laptop.
          </p>
        </div>

        {/* Success State */}
        {successPayload && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-3 shadow-md animate-in fade-in zoom-in-95 duration-200 font-sans">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center">
              <Check size={24} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-emerald-950">
                Transferred to Laptop!
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                Your laptop screen has received this target and launched the threat investigation.
              </p>
            </div>

            <div className="p-3 bg-white border border-emerald-200 rounded-xl text-left text-xs font-mono text-[#141416] break-all select-all shadow-inner">
              <span className="text-[10px] text-emerald-700 font-bold block uppercase mb-0.5">Transferred Target:</span>
              {successPayload}
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessPayload(null);
                setPreviewUrl(null);
              }}
              className="mt-2 w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold font-mono transition-colors"
            >
              Upload Another Photo / QR
            </button>
          </div>
        )}

        {/* Action Buttons: Camera & Gallery */}
        {!successPayload && (
          <div className="bg-white border border-[#dedad2] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#141416] font-mono">
              Choose Photo Source
            </h3>

            {/* Hidden native inputs */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={decoding}
                onClick={() => cameraInputRef.current?.click()}
                className="py-4 px-4 rounded-xl bg-[#ff5500] hover:bg-[#e04b00] disabled:opacity-50 text-white font-mono font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Camera size={24} />
                <span>Take Photo / Scan Camera</span>
              </button>

              <button
                type="button"
                disabled={decoding}
                onClick={() => galleryInputRef.current?.click()}
                className="py-4 px-4 rounded-xl bg-[#141416] hover:bg-black disabled:opacity-50 text-white font-mono font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ImageIcon size={24} />
                <span>Browse Phone Gallery</span>
              </button>
            </div>

            {decoding && (
              <div className="py-6 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#141416] font-mono">Decoding QR &amp; Transmitting...</p>
              </div>
            )}

            {previewUrl && !decoding && (
              <div className="p-3 bg-[#f7f5f0] border border-[#dedad2] rounded-xl flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Uploaded target preview"
                  className="w-12 h-12 object-cover rounded-lg border border-[#dedad2]"
                />
                <span className="text-xs text-[#52504c] font-medium truncate">
                  Processing captured image...
                </span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 font-medium">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Manual fallback input */}
            <div className="pt-4 border-t border-[#dedad2] space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#52504c] font-mono block">
                Or Type / Paste Target Directly:
              </label>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL, UPI URI, or text to send"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="flex-1 p-2.5 bg-[#f7f5f0] border border-[#dedad2] rounded-xl text-xs font-mono text-[#141416] focus:outline-none focus:border-[#ff5500]"
                />
                <button
                  type="submit"
                  disabled={!manualText.trim() || decoding}
                  className="px-4 py-2.5 bg-[#ff5500] text-white text-xs font-bold rounded-xl font-mono hover:bg-[#e04b00] disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Back Link */}
        {onClose && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#52504c] hover:text-[#141416] font-mono"
            >
              <ArrowLeft size={13} /> Exit Mobile Portal
            </button>
          </div>
        )}
      </div>

      <footer className="py-6 text-center text-[10px] text-[#787570] font-mono">
        CyberShield AI &bull; Encrypted Cross-Device Session Sync
      </footer>
    </div>
  );
};
