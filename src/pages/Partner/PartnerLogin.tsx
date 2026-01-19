import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const PartnerLogin = () => {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // MOCK VALIDATION - Replace with Supabase check later
    // For now, we accept any code that is longer than 3 chars
    setTimeout(() => {
      if (accessCode.length > 3) {
        toast.success("Welcome back!");
        // Redirect to dashboard with the event ID (mocked as the code)
        navigate(`/partner/dashboard/${accessCode.toLowerCase()}`);
      } else {
        toast.error("Invalid access code");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mb-6">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Partner Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your event access code to manage your photobook
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="code">Access Code</Label>
              <div className="mt-2">
                <Input
                  id="code"
                  name="code"
                  type="text"
                  required
                  placeholder="e.g. SUMMER2024"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="h-12 text-lg tracking-wide uppercase placeholder:normal-case"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Access Dashboard"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </div>
        
        <p className="text-center text-xs text-gray-400">
          Powered by Laney AI Business
        </p>
      </div>
    </div>
  );
};

export default PartnerLogin;