import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Important Notifications
        </h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">No notifications at this time.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
