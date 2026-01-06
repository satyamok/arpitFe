import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPancards } from "@/store/slices/pancardSlice";

export default function CheckDataPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { hasData, isLoading } = useAppSelector((state) => state.pancard);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    dispatch(fetchPancards()).then(() => {
      setChecked(true);
    });
  }, [dispatch]);

  useEffect(() => {
    if (checked && !isLoading) {
      if (hasData) {
        navigate("/home");
      } else {
        navigate("/welcome");
      }
    }
  }, [checked, hasData, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your data...</p>
      </div>
    </div>
  );
}
