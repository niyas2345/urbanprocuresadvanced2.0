import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../services/api.ts';
import { DocumentMetadata } from '../types/index.ts';
import { X, FileText, Download, CheckCircle, ShieldAlert, Eye, HardDrive, Check, Copy } from 'lucide-react';

interface DocumentViewerModalProps {
  document: (DocumentMetadata & { dataUrl?: string; sha256Hash?: string; standardized?: boolean }) | null;
  onClose: () => void;
  viewerRole?: string;
  approvalActions?: React.ReactNode;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, onClose, viewerRole = 'admin', approvalActions }) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const [preview,setPreview]=useState(''),[error,setError]=useState('');
  useEffect(()=>{let url='',cancelled=false;setPreview('');setError('');if(document?.id){fetch(`/api/documents/${document.id}/${document.standardized?'standardized/':''}view`,{headers:{Authorization:'Bearer '+(getAuthToken()||'')}}).then(async res=>{if(!res.ok)throw Error('Document access failed');url=URL.createObjectURL(await res.blob());if(!cancelled)setPreview(url);else URL.revokeObjectURL(url);}).catch(err=>{if(!cancelled)setError(err.message);});}else if(document?.dataUrl)setPreview(document.dataUrl);return()=>{cancelled=true;if(url)URL.revokeObjectURL(url);};},[document?.id,document?.standardized]);
  if (!document) return null;

  const isPdf = document.fileType?.includes('pdf') || document.fileName.toLowerCase().endsWith('.pdf');
  const isDwg = document.fileType?.includes('acad') || document.fileName.toLowerCase().endsWith('.dwg') || document.fileName.toLowerCase().endsWith('.dxf');
  const isSheet = document.fileType?.includes('spreadsheet') || document.fileName.toLowerCase().endsWith('.xlsx') || document.fileName.toLowerCase().endsWith('.xls') || document.fileName.toLowerCase().endsWith('.csv');
  const isImage = !isDwg&&!isSheet&&(document.fileType?.includes('image') || document.fileName.match(/\.(jpg|jpeg|png|webp|svg)$/i));

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const handleDownload = async () => {
    try {const res=await fetch(`/api/documents/${document.id}/${document.standardized?'standardized/':''}download`,{headers:{Authorization:'Bearer '+(getAuthToken()||'')}});if(!res.ok)throw Error('Document download failed');const url=URL.createObjectURL(await res.blob());const a=window.document.createElement('a');a.href=url;a.download=document.fileName;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setDownloadSuccess(true);}catch(err:any){setError(err.message);}
  };

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(document.id);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#082631]/80 backdrop-blur-sm animate-in fade-in duration-150 font-['DM_Sans']">
      <div className="bg-white border border-[#e1e7e4] w-full max-w-4xl rounded-[6px] shadow-[0_20px_50px_rgba(18,53,64,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {approvalActions&&<div className="p-4 bg-white border-b">{approvalActions}</div>}
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#123f47] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#eb6a32] flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-['Manrope'] flex items-center gap-2">
                <span>{document.fileName}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#082631] text-[#f6a47f] font-bold">
                  {document.documentPurpose}
                </span>
              </h3>
              <p className="text-xs text-[#c3d9d8] flex items-center gap-2 mt-0.5">
                <span>Document reference: <code className="text-[#f6a47f] font-mono">{document.id}</code></span>
                <span>·</span>
                <span>{formatBytes(document.fileSizeBytes)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyKey}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold bg-white/10 hover:bg-white/20 text-[#e3edeb] transition-colors"
              title="Copy document reference for support"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-[#eb6a32]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Reference copied' : 'Copy Reference'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] text-xs font-bold bg-[#eb6a32] hover:bg-[#bd4b1c] text-white transition-colors shadow-sm"
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadSuccess ? 'Downloaded!' : 'Download'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#c3d9d8] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Inspection Viewport */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f7f6f2] space-y-6">
          {/* Metadata Inspector Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[6px] bg-white border border-[#e1e7e4] text-xs shadow-sm">
            <div>
              <span className="text-[#63797b] block mb-0.5 text-[11px] font-semibold">File Type</span>
              <span className="text-[#123540] font-mono font-medium">{document.fileType || 'binary/octet-stream'}</span>
            </div>
            <div>
              <span className="text-[#63797b] block mb-0.5 text-[11px] font-semibold">Document Purpose</span>
              <span className="text-[#eb6a32] uppercase font-bold font-['Manrope']">{document.documentPurpose}</span>
            </div>
            <div>
              <span className="text-[#63797b] block mb-0.5 text-[11px] font-semibold">Upload Date</span>
              <span className="text-[#123540]">{new Date(document.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[#63797b] block mb-0.5 text-[11px] font-semibold">R2 Integrity</span>
              <span className="text-[#123f47] font-mono text-[11px] font-bold">{document.sha256Hash ? document.sha256Hash.slice(0,16) : 'Hash unavailable'}</span>
            </div>
          </div>

          {/* Interactive Document Preview Canvas */}
          <div className="border border-[#e1e7e4] rounded-[6px] bg-white overflow-hidden min-h-[360px] flex flex-col items-center justify-center p-6 text-center relative shadow-sm">
            {error?<p role="alert">{error}</p>:!preview?<p>Loading document…</p>:isImage?<img src={preview} alt={document.fileName} className="max-h-[400px] max-w-full object-contain"/>:(isPdf||document.fileType==='text/html')?<iframe sandbox={document.fileType==='text/html'?'':undefined} title={document.fileName} src={preview} className="w-full h-[480px]"/>:<p>Use Download to open this file.</p>}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#f7f6f2] border-t border-[#e1e7e4] flex items-center justify-between text-xs text-[#63797b]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#123f47]" />
            <span>Encrypted at rest with Cloudflare R2 AES-256</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[4px] bg-[#123540] hover:bg-[#082631] text-white font-bold transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
