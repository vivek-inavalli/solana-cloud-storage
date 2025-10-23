import { Link } from "react-router-dom";
import { Cloud, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gradient-accent)]">
      <div className="text-center space-y-8 p-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Cloud className="h-16 w-16 text-primary" />
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-[var(--gradient-primary)]">
            DCloud
          </h1>
        </div>
        <p className="text-2xl text-muted-foreground max-w-2xl">
          Decentralized Cloud Storage on Solana
        </p>
        <Link to="/dcloud">
          <Button size="lg" className="text-lg px-8 py-6 rounded-full">
            Launch App
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
