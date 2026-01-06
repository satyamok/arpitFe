import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">About Us</h1>
        <div className="prose max-w-none">
          <p className="text-gray-600 text-lg">
            Welcome to CA Arpit Kothari's portal. We provide professional
            chartered accountancy services to help you manage your financial
            documents and compliance requirements efficiently.
          </p>
        </div>
      </main>
    </div>
  );
}
