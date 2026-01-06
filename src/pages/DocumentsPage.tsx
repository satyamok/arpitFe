import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDocuments, addDocument } from "@/store/slices/documentSlice";
import { fetchPancards } from "@/store/slices/pancardSlice";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function DocumentsPage() {
  const dispatch = useAppDispatch();
  const { documents, isLoading, isAdding, error } = useAppSelector(
    (state) => state.document
  );
  const { pancards } = useAppSelector((state) => state.pancard);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [aboutDocument, setAboutDocument] = useState("");
  const [selectedPanCard, setSelectedPanCard] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  useEffect(() => {
    dispatch(fetchDocuments());
    dispatch(fetchPancards());
  }, [dispatch]);

  const resetForm = () => {
    setDocumentName("");
    setAboutDocument("");
    setSelectedPanCard("");
    setDocumentUrl("");
  };

  const handleUploadComplete = (url: string) => {
    setDocumentUrl(url);
  };

  const handleSubmit = async () => {
    if (!documentName || !selectedPanCard || !documentUrl) {
      toast.error("Please fill all required fields");
      return;
    }

    const result = await dispatch(
      addDocument({
        documentName,
        panCard: selectedPanCard,
        documentUrl,
        aboutDocument: aboutDocument || "",
      })
    );

    if (addDocument.fulfilled.match(result)) {
      toast.success("Document added successfully!");
      setIsDialogOpen(false);
      resetForm();
      dispatch(fetchDocuments());
    } else {
      toast.error("Failed to add document");
    }
  };

  // Group documents by PAN card
  const groupedDocuments = useMemo(() => {
    const groups: Record<
      string,
      {
        panCardId: string;
        panCardName: string;
        panCardNumber: string;
        documents: typeof documents;
      }
    > = {};

    documents.forEach((doc) => {
      const panId = doc.panCard._id;
      if (!groups[panId]) {
        groups[panId] = {
          panCardId: panId,
          panCardName: doc.panCard.panCardName,
          panCardNumber: doc.panCard.panCardNumber,
          documents: [],
        };
      }
      groups[panId].documents.push(doc);
    });

    return Object.values(groups);
  }, [documents]);

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Your Documents</h1>
            <p className="text-gray-600 mt-2">
              View and download your uploaded documents organized by PAN card.
            </p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Document</DialogTitle>
                <DialogDescription>
                  Upload a new document and associate it with a PAN card.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="documentName">
                    Document Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="documentName"
                    placeholder="e.g., Voter ID, Aadhar Card"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="panCard">
                    Select PAN Card <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedPanCard}
                    onValueChange={setSelectedPanCard}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a PAN card" />
                    </SelectTrigger>
                    <SelectContent>
                      {pancards.map((pan, index) => (
                        <SelectItem key={pan._id} value={pan._id}>
                          {index + 1}. {pan.panCardName} {pan.panCardNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutDocument">
                    About Document (Optional)
                  </Label>
                  <Input
                    id="aboutDocument"
                    placeholder="Brief description of the document"
                    value={aboutDocument}
                    onChange={(e) => setAboutDocument(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Upload Document <span className="text-red-500">*</span>
                  </Label>
                  <FileUpload onUploadComplete={handleUploadComplete} />
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={
                    isAdding ||
                    !documentName ||
                    !selectedPanCard ||
                    !documentUrl
                  }
                >
                  {isAdding ? "Adding..." : "Add Document"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 text-lg">No documents found.</p>
              <p className="text-gray-500 mt-2">
                Your uploaded documents will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs
            defaultValue={groupedDocuments[0]?.panCardId}
            className="w-full"
          >
            <TabsList className="mb-6 flex-wrap h-auto gap-2">
              {groupedDocuments.map((group) => (
                <TabsTrigger
                  key={group.panCardId}
                  value={group.panCardId}
                  className="px-4 py-2"
                >
                  <div className="text-left">
                    <div className="font-semibold">{group.panCardNumber}</div>
                    <div className="text-xs opacity-70">
                      {group.panCardName}
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {groupedDocuments.map((group) => (
              <TabsContent key={group.panCardId} value={group.panCardId}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📋</span>
                      Documents for {group.panCardName} ({group.panCardNumber})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {group.documents.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">
                              {doc.documentName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {doc.aboutDocument}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              Uploaded:{" "}
                              {new Date(doc.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleDownload(doc.documentUrl)}
                            variant="outline"
                            className="ml-4"
                          >
                            📥 Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
    </div>
  );
}
