import { AnchorProvider, Program, web3, BN, Idl } from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "./idl.json";

const PROGRAM_ID = new PublicKey("2DWNrUtJXqnA9qu444yyACg2VXnXmEqwBPG7Q7cgM1NM");
const NETWORK = "https://api.devnet.solana.com";

export const getProvider = (wallet: WalletContextState) => {
  const connection = new Connection(NETWORK, "confirmed");
  const provider = new AnchorProvider(
    connection,
    wallet as any,
    { commitment: "confirmed" }
  );
  return provider;
};

export const getProgram = (wallet: WalletContextState) => {
  const provider = getProvider(wallet);
  return new Program(idl as Idl, PROGRAM_ID, provider);
};

export const getStorageAccountPDA = (userPublicKey: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("storage"), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
};

export const getFileAccountPDA = (userPublicKey: PublicKey, fileHash: string) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("file"), userPublicKey.toBuffer(), Buffer.from(fileHash)],
    PROGRAM_ID
  );
};

export const storageAccountExists = async (wallet: WalletContextState, publicKey: PublicKey) => {
  try {
    const program: any = getProgram(wallet);
    const [storageAccountPDA] = getStorageAccountPDA(publicKey);
    
    const account = await program.account.storageAccount.fetchNullable(storageAccountPDA);
    return account !== null;
  } catch (error) {
    console.error("Error checking storage account:", error);
    return false;
  }
};

export const initializeStorage = async (wallet: WalletContextState) => {
  if (!wallet.publicKey) throw new Error("Wallet not connected");

  const program = getProgram(wallet);
  const [storageAccountPDA] = getStorageAccountPDA(wallet.publicKey);

  const tx = await program.methods
    .initializeStorage()
    .accounts({
      user: wallet.publicKey,
      storageAccount: storageAccountPDA,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return tx;
};

export const uploadFile = async (
  wallet: WalletContextState,
  fileHash: string,
  fileName: string,
  fileSize: number,
  ipfsHash: string,
  encryptionKey?: string
) => {
  if (!wallet.publicKey) throw new Error("Wallet not connected");

  const program = getProgram(wallet);
  const [storageAccountPDA] = getStorageAccountPDA(wallet.publicKey);
  const [fileAccountPDA] = getFileAccountPDA(wallet.publicKey, fileHash);

  const tx = await program.methods
    .uploadFile(
      fileHash,
      fileName,
      new BN(fileSize),
      ipfsHash,
      encryptionKey || null
    )
    .accounts({
      user: wallet.publicKey,
      storageAccount: storageAccountPDA,
      fileAccount: fileAccountPDA,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return tx;
};

export const downloadFile = async (
  wallet: WalletContextState,
  fileOwner: PublicKey,
  fileHash: string
) => {
  if (!wallet.publicKey) throw new Error("Wallet not connected");

  const program = getProgram(wallet);
  const [fileAccountPDA] = getFileAccountPDA(fileOwner, fileHash);

  const fileInfo = await program.methods
    .downloadFile(fileHash)
    .accounts({
      user: wallet.publicKey,
      fileAccount: fileAccountPDA,
    })
    .view();

  return fileInfo;
};

export const deleteFile = async (wallet: WalletContextState, fileHash: string) => {
  if (!wallet.publicKey) throw new Error("Wallet not connected");

  const program = getProgram(wallet);
  const [storageAccountPDA] = getStorageAccountPDA(wallet.publicKey);
  const [fileAccountPDA] = getFileAccountPDA(wallet.publicKey, fileHash);

  const tx = await program.methods
    .deleteFile()
    .accounts({
      user: wallet.publicKey,
      storageAccount: storageAccountPDA,
      fileAccount: fileAccountPDA,
    })
    .rpc();

  return tx;
};

export const shareFile = async (
  wallet: WalletContextState,
  fileHash: string,
  isPublic: boolean
) => {
  if (!wallet.publicKey) throw new Error("Wallet not connected");

  const program = getProgram(wallet);
  const [fileAccountPDA] = getFileAccountPDA(wallet.publicKey, fileHash);

  const tx = await program.methods
    .shareFile(isPublic)
    .accounts({
      user: wallet.publicKey,
      fileAccount: fileAccountPDA,
    })
    .rpc();

  return tx;
};

export const getStorageInfo = async (wallet: WalletContextState) => {
  if (!wallet.publicKey) throw new Error("Wallet not connected");

  const program = getProgram(wallet);
  const [storageAccountPDA] = getStorageAccountPDA(wallet.publicKey);

  const storageInfo = await program.methods
    .getStorageInfo()
    .accounts({
      user: wallet.publicKey,
      storageAccount: storageAccountPDA,
    })
    .view();

  return storageInfo;
};

export const getUserFiles = async (wallet: WalletContextState) => {
  if (!wallet.publicKey) throw new Error("Wallet not connected");

  const program: any = getProgram(wallet);
  
  const fileAccounts = await program.account.fileAccount.all([
    {
      memcmp: {
        offset: 8,
        bytes: wallet.publicKey.toBase58(),
      },
    },
  ]);

  return fileAccounts.map((account: any) => ({
    publicKey: account.publicKey,
    ...account.account,
  }));
};
