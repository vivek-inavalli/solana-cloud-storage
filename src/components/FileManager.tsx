import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  Trash2,
  Share2,
  Lock,
  Unlock,
  Loader2,
  FileText,
  HardDrive,
  AlertCircle,
} from "lucide-react";
import {
  uploadFile,
  deleteFile,
  shareFile,
  getStorageInfo,
  getUserFiles,
  downloadFile,
} from "../lib/anchorClient";
import { useToast } from "@/hooks/use-toast";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

interface FileData {
  publicKey: PublicKey;
  owner: PublicKey;
  fileHash: string;
  fileName: string;
  fileSize: number;
  ipfsHash: string;
  uploadTimestamp: number;
  isPublic: boolean;
  accessCount: number;
}

export default function FileManager() {
  const wallet = useWallet();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileData[]>([]);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (wallet.connected) {
      loadFiles();
      loadStorageInfo();
    }
  }, [wallet.connected]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const userFiles = await getUserFiles(wallet);
      setFiles(userFiles as any);
    } catch (error) {
      console.error("Error loading files:", error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageInfo(wallet);
      setStorageInfo(info);
    } catch (error) {
      console.error("Error loading storage info:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Generate file hash (simplified - in production use proper hashing)
      const fileHash = bs58.encode(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-256",
            await file.arrayBuffer()
          )
        )
      ).substring(0, 32);

      // In production, upload to IPFS and get the hash
      const ipfsHash = `Qm${Math.random().toString(36).substring(7)}`;

      await uploadFile(
        wallet,
        fileHash,
        file.name,
        file.size,
        ipfsHash
      );

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      await loadFiles();
      await loadStorageInfo();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileHash: string, fileName: string) => {
    if (!confirm(`Delete ${fileName}?`)) return;

    try {
      await deleteFile(wallet, fileHash);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      await loadFiles();
      await loadStorageInfo();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (fileHash: string, currentPublic: boolean) => {
    try {
      await shareFile(wallet, fileHash, !currentPublic);
      toast({
        title: "Success",
        description: `File is now ${!currentPublic ? "public" : "private"}`,
      });
      await loadFiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update sharing",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (file: FileData) => {
    try {
      const fileInfo = await downloadFile(wallet, file.owner, file.fileHash);
      toast({
        title: "File Info",
        description: `IPFS: ${fileInfo.ipfsHash}`,
      });
      // In production, fetch from IPFS and download
      window.open(`https://ipfs.io/ipfs/${file.ipfsHash}`, "_blank");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Storage Info Card */}
      {storageInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 backdrop-blur-2xl rounded-3xl p-6 border border-border/50"
        >
          <div className="flex items-center gap-4">
            <HardDrive className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">Storage Usage</h3>
              <p className="text-muted-foreground">
                {storageInfo.totalFiles} files • {formatBytes(storageInfo.totalStorageUsed.toNumber())} used
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card/40 backdrop-blur-2xl rounded-3xl p-8 border border-border/50"
      >
        <label className="flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent/5 p-8 rounded-2xl border-2 border-dashed border-border transition-all">
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <span className="text-muted-foreground">Uploading to blockchain...</span>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-primary" />
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">Upload File</p>
                <p className="text-sm text-muted-foreground">Click to select a file</p>
              </div>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </>
          )}
        </label>
      </motion.div>

      {/* Files List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card/40 backdrop-blur-2xl rounded-3xl p-6 border border-border/50"
      >
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Your Files
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={file.fileHash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-background/50 rounded-2xl p-4 border border-border/30 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {file.fileName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatBytes(file.fileSize)} • {file.accessCount} views
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-2 hover:bg-accent/20 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="h-5 w-5 text-primary" />
                      </button>
                      <button
                        onClick={() => handleShare(file.fileHash, file.isPublic)}
                        className="p-2 hover:bg-accent/20 rounded-lg transition-colors"
                        title={file.isPublic ? "Make Private" : "Make Public"}
                      >
                        {file.isPublic ? (
                          <Unlock className="h-5 w-5 text-success" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(file.fileHash, file.fileName)}
                        className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
