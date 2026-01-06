import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addPancard } from "@/store/slices/pancardSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Step = "pan-number" | "pan-name";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("pan-number");
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.pancard);

  const handleNextFromPanNumber = () => {
    if (panNumber.trim()) {
      setStep("pan-name");
    }
  };

  const handleSubmit = async () => {
    if (panName.trim() && panNumber.trim()) {
      const result = await dispatch(
        addPancard({
          panCardName: panName,
          panCardNumber: panNumber.toUpperCase(),
        })
      );
      if (addPancard.fulfilled.match(result)) {
        navigate("/home");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {step === "pan-number"
              ? "Enter your PAN Number"
              : "Enter Name of PAN Holder"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {step === "pan-number" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  type="text"
                  placeholder="e.g., ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="uppercase"
                />
              </div>
              <Button
                onClick={handleNextFromPanNumber}
                className="w-full"
                disabled={!panNumber.trim() || panNumber.length !== 10}
              >
                Next
              </Button>
            </div>
          )}

          {step === "pan-name" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="panName">Name on PAN Card</Label>
                <Input
                  id="panName"
                  type="text"
                  placeholder="Enter name as on PAN card"
                  value={panName}
                  onChange={(e) => setPanName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("pan-number")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={!panName.trim() || isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
