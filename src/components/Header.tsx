import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { resetPancardState } from "@/store/slices/pancardSlice";
import { Button } from "@/components/ui/button";

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetPancardState());
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/home" className="text-xl font-bold text-gray-800">
              CA Arpit Kothari
            </Link>
          </div>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/about">About Us</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/notifications">Notifications</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/pancard">Add PAN Card</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/profile">{user?.name || "Profile"}</Link>
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
