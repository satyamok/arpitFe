import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";

export default function HomePage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.name || "User"}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your documents and PAN cards with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/documents">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>📄 Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  View and manage your uploaded documents.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/pancard">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>💳 PAN Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Manage your registered PAN cards.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/notifications">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>🔔 Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Stay updated with important notifications.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
