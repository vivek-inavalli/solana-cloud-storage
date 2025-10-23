"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { initializeStorage, storageAccountExists } from "../lib/anchorClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  CheckCircle,
  Wallet,
  Zap,
  Loader2,
  AlertTriangle,
  FileText,
  Sparkles,
} from "lucide-react";

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring" as const, stiffness: 100, damping: 20 }}
    className={`w-full max-w-md bg-card/40 backdrop-blur-2xl rounded-3xl p-8 border border-border/50 shadow-[var(--shadow-glass)] hover:shadow-[var(--shadow-glow)] transition-all duration-500 ${className}`}
  >
    {children}
  </motion.div>
);

const sectionVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15, duration: 0.6 },
  },
  exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.3 } },
};

export default function DCloudPage() {
  const wallet = useWallet();
  const [isInitializing, setIsInitializing] = useState(false);
  const [storageExists, setStorageExists] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkStorageAccount = async () => {
      setError(null);
      if (wallet.connected && wallet.publicKey) {
        try {
          const exists = await storageAccountExists(wallet, wallet.publicKey);
          setStorageExists(exists);
        } catch (error: any) {
          setError("Failed to verify storage account status.");
          setStorageExists(false);
        }
      } else {
        setStorageExists(false);
      }
    };

    if (mounted) checkStorageAccount();
  }, [wallet.connected, wallet.publicKey, mounted]);

  const handleInit = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      await initializeStorage(wallet);
      setStorageExists(true);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to initialize storage.";

      if (errorMessage.includes("already in use")) {
        setStorageExists(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin mr-3" />
        <p className="text-muted-foreground text-lg">Loading DCloud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--gradient-accent)] flex flex-col items-center py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring" as const, stiffness: 120, damping: 14, delay: 0.1 }}
        className="w-full max-w-3xl text-center mb-12 relative z-10"
      >
        <motion.div 
          className="flex items-center justify-center mb-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring" as const, stiffness: 300 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Cloud className="h-12 w-12 mr-3 text-primary" />
            <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
          </motion.div>
          <h1 className="text-6xl sm:text-7xl font-extrabold text-foreground tracking-tight bg-clip-text text-transparent bg-[var(--gradient-primary)]">
            DCloud
          </h1>
        </motion.div>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto font-medium">
          Secure decentralized file storage, powered by{" "}
          <span className="font-bold text-primary">Solana</span> and{" "}
          <span className="font-bold text-accent">IPFS</span>
        </p>
      </motion.header>

      {/* Main Content */}
      <div className="w-full flex flex-col items-center gap-8 relative z-10">
        {/* Wallet Connection Card */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <GlassCard>
            <h2 className="text-2xl font-bold text-foreground mb-6 pb-3 flex items-center justify-center border-b border-border/50">
              <span className="text-3xl font-extrabold text-primary mr-3">1</span>
              <Wallet className="h-6 w-6 mr-2 text-primary" />
              Connect Wallet
            </h2>

            <div className="flex justify-center mb-6">
              <WalletMultiButton className="!bg-[var(--gradient-primary)] !text-primary-foreground !font-bold !py-3 !px-8 !rounded-full !shadow-[var(--shadow-glow)] hover:!scale-105 !transition-all !duration-300" />
            </div>

            <AnimatePresence mode="wait">
              {wallet.connected && wallet.publicKey ? (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center w-full p-4 bg-success/10 rounded-2xl border border-success/20 backdrop-blur-sm"
                >
                  <p className="text-success font-bold flex items-center justify-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5" />
                    Connected Successfully
                  </p>
                  <p className="text-xs text-muted-foreground break-all mt-2 font-mono">
                    {wallet.publicKey.toBase58().substring(0, 8)}...
                    {wallet.publicKey.toBase58().slice(-8)}
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  key="disconnected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-muted-foreground text-center p-3"
                >
                  Connect your wallet to unlock DCloud features
                </motion.p>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.section>

        {/* Storage Account Card */}
        <AnimatePresence mode="wait">
          {wallet.connected && wallet.publicKey && (
            <motion.section
              key="storage"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.35 }}
              className="w-full"
            >
              <GlassCard>
                <h2 className="text-2xl font-bold text-foreground mb-6 pb-3 flex items-center justify-center border-b border-border/50">
                  <span className="text-3xl font-extrabold text-accent mr-3">2</span>
                  <Zap className="h-6 w-6 mr-2 text-accent" />
                  Storage Account
                </h2>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-sm flex items-center justify-center backdrop-blur-sm"
                    >
                      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {storageExists ? (
                    <motion.div
                      key="ready"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="text-center w-full space-y-6"
                    >
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-success/10 rounded-2xl border border-success/20 backdrop-blur-sm"
                      >
                        <p className="text-success font-bold text-xl flex items-center justify-center gap-2">
                          <CheckCircle className="h-6 w-6" />
                          Storage Ready
                        </p>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Your decentralized storage is active
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-dashed border-primary/30 backdrop-blur-sm"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <FileText className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              File Manager Access
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              Upload, manage, and share your files securely
                            </p>
                          </div>
                        </div>
                        <button
                          disabled
                          className="w-full bg-muted text-muted-foreground font-semibold py-3 px-8 rounded-full cursor-not-allowed opacity-50 transition-all"
                        >
                          Coming Soon
                        </button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="init"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="text-center w-full space-y-6"
                    >
                      <p className="text-muted-foreground text-base leading-relaxed">
                        Initialize your storage account with a one-time blockchain transaction
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleInit}
                        disabled={isInitializing}
                        className="w-full bg-[var(--gradient-primary)] text-primary-foreground font-bold py-4 px-10 rounded-full shadow-[var(--shadow-glow)] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-lg"
                      >
                        {isInitializing ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processing Transaction...
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5 mr-2" />
                            Initialize Storage
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="w-full max-w-2xl mx-auto mt-16 text-center text-sm text-muted-foreground relative z-10"
      >
        <p className="mb-3 font-medium">Built on Solana • Powered by IPFS</p>
        <a
          href="https://docs.dcloud.example.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-semibold text-primary hover:text-accent transition-colors duration-300 border-b-2 border-transparent hover:border-primary pb-1"
        >
          <FileText className="h-4 w-4" />
          View Documentation
        </a>
      </motion.footer>
    </div>
  );
}
