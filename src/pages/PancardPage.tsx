import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPancards,
  addPancard,
  clearPancardError,
} from "@/store/slices/pancardSlice";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PancardPage() {
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const dispatch = useAppDispatch();
  const { pancards, isLoading, error } = useAppSelector(
    (state) => state.pancard
  );

  useEffect(() => {
    dispatch(fetchPancards());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearPancardError());

    if (panName.trim() && panNumber.trim()) {
      const result = await dispatch(
        addPancard({
          panCardName: panName,
          panCardNumber: panNumber.toUpperCase(),
        })
      );
      if (addPancard.fulfilled.match(result)) {
        setPanNumber("");
        setPanName("");
        setShowForm(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">PAN Cards</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add New PAN Card"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New PAN Card</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panName">Name on PAN Card</Label>
                  <Input
                    id="panName"
                    type="text"
                    placeholder="Enter name as on PAN card"
                    value={panName}
                    onChange={(e) => setPanName(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={
                    isLoading || !panName.trim() || panNumber.length !== 10
                  }
                >
                  {isLoading ? "Adding..." : "Add PAN Card"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Your PAN Cards
          </h2>

          {isLoading && pancards.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : pancards.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-600">No PAN cards added yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pancards.map((pancard) => (
                <Card key={pancard._id}>
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-lg">
                          {pancard.panCardName}
                        </p>
                        <p className="text-gray-600 font-mono">
                          {pancard.panCardNumber}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        Added:{" "}
                        {new Date(pancard.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
