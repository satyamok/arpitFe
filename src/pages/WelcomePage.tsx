import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const welcomeMessage = `Hi ${
    user?.name || "User"
  }, Welcome to CA Arpit Kothari 😊`;

  const typeText = useCallback(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= welcomeMessage.length) {
        setDisplayedText(welcomeMessage.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [welcomeMessage]);

  useEffect(() => {
    const cleanup = typeText();
    return cleanup;
  }, [typeText]);

  const handleEnter = () => {
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8 min-h-[120px]">
          {displayedText}
          {!isTypingComplete && <span className="animate-pulse">|</span>}
        </h1>
        {isTypingComplete && (
          <Button
            size="lg"
            onClick={handleEnter}
            className="text-lg px-8 py-6 animate-fade-in"
          >
            Enter
          </Button>
        )}
      </div>
    </div>
  );
}
