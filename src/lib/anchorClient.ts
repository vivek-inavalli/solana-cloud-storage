// Mock Anchor Client for demonstration purposes
export const initializeStorage = async (wallet: any) => {
  // Simulate blockchain transaction
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log("Storage initialized for:", wallet.publicKey?.toBase58());
  return true;
};

export const storageAccountExists = async (wallet: any, publicKey: any) => {
  // Simulate checking if storage account exists
  await new Promise(resolve => setTimeout(resolve, 500));
  // For demo purposes, return false initially
  return false;
};
