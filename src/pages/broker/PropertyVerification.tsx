import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PropertyVerification = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (property) {
        setProperty(property);
        setDocuments(property.documents || []);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    }
  };

  const requiredDocuments = [
    {
      id: 'title_deed',
      name: 'Title Deed / Sale Deed',
      description: 'Original property ownership document',
      required: true
    },
    {
      id: 'approval_plan',
      name: 'Approved Building Plan',
      description: 'Municipal corporation approved building plan',
      required: true
    },
    {
      id: 'completion_certificate',
      name: 'Completion Certificate',
      description: 'Building completion certificate from authorities',
      required: true
    },
    {
      id: 'noc_fire',
      name: 'Fire NOC',
      description: 'No objection certificate from fire department',
      required: false
    },
    {
      id: 'rera_certificate',
      name: 'RERA Registration',
      description: 'RERA registration certificate (if applicable)',
      required: false
    },
    {
      id: 'tax_receipts',
      name: 'Property Tax Receipts',
      description: 'Latest property tax payment receipts',
      required: true
    }
  ];

  const handleFileUpload = (documentId: string, files: FileList) => {
    // Simulate file upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Add document to list
          const newDoc = {
            id: Date.now().toString(),
            document_type: documentId,
            file_name: files[0].name,
            file_size: files[0].size,
            upload_date: new Date().toISOString(),
            status: 'uploaded'
          };
          setDocuments(prev => [...prev, newDoc]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const submitForVerification = async () => {
    setLoading(true);
    try {
      // Update property with documents and set status to pending verification
      const { error } = await supabase
        .from('properties')
        .update({
          documents: documents,
          status: 'available'
        })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Submitted for verification!",
        description: "Your property documents have been submitted for review."
      });

      navigate('/broker/properties');
    } catch (error) {
      console.error('Error submitting for verification:', error);
      toast({
        title: "Error",
        description: "Failed to submit for verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDocumentStatus = (docType: string) => {
    const uploaded = documents.find(doc => doc.document_type === docType);
    return uploaded ? 'uploaded' : 'pending';
  };

  const getCompletionPercentage = () => {
    const requiredDocs = requiredDocuments.filter(doc => doc.required);
    const uploadedRequired = requiredDocs.filter(doc => getDocumentStatus(doc.id) === 'uploaded');
    return Math.round((uploadedRequired.length / requiredDocs.length) * 100);
  };

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/broker/properties')}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Property Verification</h1>
                <p className="text-muted-foreground">{property.title}</p>
              </div>
            </div>
            <Badge variant={property.status === 'verified' ? 'default' : 'secondary'}>
              {property.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Verification Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Document Upload Progress</span>
                <span>{getCompletionPercentage()}% Complete</span>
              </div>
              <Progress value={getCompletionPercentage()} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Upload all required documents to submit for verification
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 animate-spin" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uploading document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Required Documents */}
        <div className="space-y-6">
          {requiredDocuments.map((docType) => {
            const status = getDocumentStatus(docType.id);
            const uploadedDoc = documents.find(doc => doc.document_type === docType.id);
            
            return (
              <Card key={docType.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {status === 'uploaded' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                        {docType.name}
                        {docType.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{docType.description}</p>
                    </div>
                    <Badge variant={status === 'uploaded' ? 'default' : 'secondary'}>
                      {status === 'uploaded' ? 'Uploaded' : 'Pending'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {status === 'uploaded' && uploadedDoc ? (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">{uploadedDoc.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedDoc.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeDocument(uploadedDoc.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Drag and drop your file here, or click to browse
                      </p>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => e.target.files && handleFileUpload(docType.id, e.target.files)}
                        className="hidden"
                        id={`file-${docType.id}`}
                      />
                      <Label htmlFor={`file-${docType.id}`}>
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <span>Choose File</span>
                        </Button>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-2">
                        Supported formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/broker/properties')}
          >
            Save Draft
          </Button>
          <Button
            onClick={submitForVerification}
            disabled={loading || getCompletionPercentage() < 100}
          >
            {loading ? "Submitting..." : "Submit for Verification"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyVerification;