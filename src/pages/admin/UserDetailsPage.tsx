import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import FileUpload from "@/components/FileUpload";
import {
  fetchUserDetails,
  addPanCardToUser,
  addDocumentToUser,
  type UserDetails,
  type Document,
} from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add PAN Card modal state
  const [showAddPanCardModal, setShowAddPanCardModal] = useState(false);
  const [panCardName, setPanCardName] = useState("");
  const [panCardNumber, setPanCardNumber] = useState("");
  const [isAddingPanCard, setIsAddingPanCard] = useState(false);

  // Add Document modal state
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [selectedPanCard, setSelectedPanCard] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [aboutDocument, setAboutDocument] = useState("");
  const [isAddingDocument, setIsAddingDocument] = useState(false);

  const handleUploadComplete = (url: string) => {
    setDocumentUrl(url);
  };

  const loadUserDetails = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchUserDetails(userId);
      if (response.success) {
        setUserDetails(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const handleRefresh = () => {
    loadUserDetails();
  };

  const handleAddPanCard = async () => {
    if (!userId || !panCardName.trim() || !panCardNumber.trim()) return;

    try {
      setIsAddingPanCard(true);
      await addPanCardToUser(userId, {
        panCardName: panCardName.trim(),
        panCardNumber: panCardNumber.trim().toUpperCase(),
      });
      toast.success("PAN card added successfully");
      setShowAddPanCardModal(false);
      setPanCardName("");
      setPanCardNumber("");
      loadUserDetails();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add PAN card"
      );
    } finally {
      setIsAddingPanCard(false);
    }
  };

  const handleAddDocument = async () => {
    if (!userId || !documentName.trim() || !selectedPanCard || !documentUrl)
      return;

    try {
      setIsAddingDocument(true);
      await addDocumentToUser(userId, {
        documentName: documentName.trim(),
        panCard: selectedPanCard,
        documentUrl,
        aboutDocument: aboutDocument.trim() || undefined,
      });
      toast.success("Document added successfully");
      setShowAddDocumentModal(false);
      setDocumentName("");
      setSelectedPanCard("");
      setDocumentUrl("");
      setAboutDocument("");
      loadUserDetails();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add document"
      );
    } finally {
      setIsAddingDocument(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "master":
        return "destructive" as const;
      case "admin":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(doc.documentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.documentName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Fallback: open in new tab
      window.open(doc.documentUrl, "_blank");
    }
  };

  const getDocumentsForPanCard = (panCardId: string): Document[] => {
    if (!userDetails) return [];
    return userDetails.documents.filter((doc) => doc.panCard._id === panCardId);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !userDetails) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-red-600">{error || "User not found"}</p>
          <Button onClick={() => navigate("/admin/users")}>
            Back to Users
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const { user, panCards, documents } = userDetails;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with back button and action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/users")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                User Details
              </h2>
              <p className="text-muted-foreground">
                View and manage user information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddPanCardModal(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
              Add PAN Card
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddDocumentModal(true)}
              disabled={panCards.length === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
              Add Document
            </Button>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-semibold">{user.name}</h3>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mobile:</span>
                    <p className="font-medium">{user.mobile}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Joined:</span>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {panCards.length}
                </div>
                <div className="text-sm text-muted-foreground">PAN Cards</div>
                <div className="text-3xl font-bold text-primary mt-2">
                  {documents.length}
                </div>
                <div className="text-sm text-muted-foreground">Documents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Details and PAN Cards */}
        <Tabs defaultValue="all-details" className="w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-muted/50 p-2">
            <TabsTrigger
              value="all-details"
              className="data-[state=active]:bg-background"
            >
              All Details
            </TabsTrigger>
            {panCards.map((panCard) => (
              <TabsTrigger
                key={panCard._id}
                value={panCard._id}
                className="data-[state=active]:bg-background"
              >
                <span className="hidden sm:inline">
                  {panCard.panCardName} -{" "}
                </span>
                {panCard.panCardNumber}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All Details Tab */}
          <TabsContent value="all-details" className="space-y-6">
            {/* PAN Cards Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  PAN Cards ({panCards.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {panCards.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No PAN cards added yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {panCards.map((panCard) => (
                      <Card key={panCard._id} className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="font-semibold">
                              {panCard.panCardName}
                            </div>
                            <div className="font-mono text-lg tracking-wider">
                              {panCard.panCardNumber}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Added: {formatDate(panCard.createdAt)}
                            </div>
                            <Badge variant="outline">
                              {getDocumentsForPanCard(panCard._id).length}{" "}
                              Documents
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* All Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  All Documents ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No documents uploaded yet
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>PAN Card</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc._id}>
                          <TableCell className="font-medium">
                            {doc.documentName}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{doc.panCard.panCardName}</div>
                              <div className="text-muted-foreground font-mono text-xs">
                                {doc.panCard.panCardNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {doc.aboutDocument}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(doc.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dynamic PAN Card Tabs */}
          {panCards.map((panCard) => {
            const panDocuments = getDocumentsForPanCard(panCard._id);
            return (
              <TabsContent
                key={panCard._id}
                value={panCard._id}
                className="space-y-6"
              >
                {/* PAN Card Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path
                            fillRule="evenodd"
                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        PAN Card Details
                      </div>
                      <Badge variant="outline">
                        {panDocuments.length} Documents
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Name
                        </span>
                        <p className="font-semibold text-lg">
                          {panCard.panCardName}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          PAN Number
                        </span>
                        <p className="font-mono text-lg tracking-wider">
                          {panCard.panCardNumber}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Added On
                        </span>
                        <p className="font-medium">
                          {formatDate(panCard.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents for this PAN Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {panDocuments.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No documents uploaded for this PAN card
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Document Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {panDocuments.map((doc) => (
                            <TableRow key={doc._id}>
                              <TableCell className="font-medium">
                                {doc.documentName}
                              </TableCell>
                              <TableCell className="max-w-[300px]">
                                {doc.aboutDocument}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDate(doc.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(doc)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Download
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Add PAN Card Modal */}
      <Dialog open={showAddPanCardModal} onOpenChange={setShowAddPanCardModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add PAN Card</DialogTitle>
            <DialogDescription>
              Add a new PAN card for {user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="panCardName">
                Name on PAN Card <span className="text-red-500">*</span>
              </Label>
              <Input
                id="panCardName"
                placeholder="Enter name as on PAN card"
                value={panCardName}
                onChange={(e) => setPanCardName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panCardNumber">
                PAN Card Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="panCardNumber"
                placeholder="e.g., ABCDE1234F"
                value={panCardNumber}
                onChange={(e) => setPanCardNumber(e.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddPanCardModal(false);
                setPanCardName("");
                setPanCardNumber("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPanCard}
              disabled={
                isAddingPanCard ||
                !panCardName.trim() ||
                panCardNumber.length !== 10
              }
            >
              {isAddingPanCard ? "Adding..." : "Add PAN Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Document Modal */}
      <Dialog
        open={showAddDocumentModal}
        onOpenChange={setShowAddDocumentModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
            <DialogDescription>
              Upload a document for {user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="documentName">
                Document Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="documentName"
                placeholder="e.g., Aadhar Card, Voter ID"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panCardSelect">
                PAN Card <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedPanCard}
                onValueChange={setSelectedPanCard}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a PAN card" />
                </SelectTrigger>
                <SelectContent>
                  {panCards.map((pc) => (
                    <SelectItem key={pc._id} value={pc._id}>
                      {pc.panCardName} - {pc.panCardNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Upload Document <span className="text-red-500">*</span>
              </Label>
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutDocument">Description (Optional)</Label>
              <Input
                id="aboutDocument"
                placeholder="Brief description about the document"
                value={aboutDocument}
                onChange={(e) => setAboutDocument(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDocumentModal(false);
                setDocumentName("");
                setSelectedPanCard("");
                setDocumentUrl("");
                setAboutDocument("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDocument}
              disabled={
                isAddingDocument ||
                !documentName.trim() ||
                !selectedPanCard ||
                !documentUrl
              }
            >
              {isAddingDocument ? "Adding..." : "Add Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
