import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  AlertTriangle, 
  FileText, 
  Upload,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DisputeManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [disputes, setDisputes] = useState([]);
  const [showNewDispute, setShowNewDispute] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newDispute, setNewDispute] = useState({
    dispute_type: "",
    description: "",
    sent_lead_id: ""
  });

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: disputes } = await supabase
        .from('disputes')
        .select(`
          *,
          sent_leads (
            *,
            leads (title, category),
            properties (title, price)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setDisputes(disputes || []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('disputes')
        .insert([{
          user_id: user.id,
          dispute_type: newDispute.dispute_type,
          description: newDispute.description,
          sent_lead_id: newDispute.sent_lead_id || null,
          status: 'open'
        }]);

      if (error) throw error;

      toast({
        title: "Dispute submitted successfully!",
        description: "Our team will review your dispute and get back to you soon."
      });

      setShowNewDispute(false);
      setNewDispute({
        dispute_type: "",
        description: "",
        sent_lead_id: ""
      });
      fetchDisputes();
    } catch (error) {
      console.error('Error submitting dispute:', error);
      toast({
        title: "Error",
        description: "Failed to submit dispute. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'investigating':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                onClick={() => navigate(-1)}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Dispute Management</h1>
                <p className="text-muted-foreground">Manage your disputes and refund requests</p>
              </div>
            </div>
            <Button onClick={() => setShowNewDispute(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Dispute
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Disputes</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="investigating">Under Review</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {disputes.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Disputes Found</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't raised any disputes yet. If you have any issues with leads or payments, feel free to raise a dispute.
                  </p>
                  <Button onClick={() => setShowNewDispute(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Raise New Dispute
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {disputes.map((dispute) => (
                  <Card key={dispute.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <div>
                            <CardTitle className="text-lg">
                              {dispute.dispute_type.replace('_', ' ').toUpperCase()}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Dispute #{dispute.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(dispute.status)}>
                          {getStatusIcon(dispute.status)}
                          <span className="ml-1 capitalize">{dispute.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{dispute.description}</p>
                        </div>
                        
                        {dispute.sent_leads && (
                          <div>
                            <h4 className="font-medium mb-2">Related Lead</h4>
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-sm font-medium">{dispute.sent_leads.leads?.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Property: {dispute.sent_leads.properties?.title}
                              </p>
                            </div>
                          </div>
                        )}

                        {dispute.admin_notes && (
                          <div>
                            <h4 className="font-medium mb-2">Admin Response</h4>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm">{dispute.admin_notes}</p>
                            </div>
                          </div>
                        )}

                        {dispute.resolution_amount > 0 && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">
                              Refund processed: {dispute.resolution_amount} coins
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Created: {new Date(dispute.created_at).toLocaleDateString()}</span>
                          <span>Updated: {new Date(dispute.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Other tabs would filter the disputes array based on status */}
          <TabsContent value="open">
            {/* Filter disputes with status 'open' */}
          </TabsContent>
          <TabsContent value="investigating">
            {/* Filter disputes with status 'investigating' */}
          </TabsContent>
          <TabsContent value="resolved">
            {/* Filter disputes with status 'resolved' */}
          </TabsContent>
        </Tabs>

        {/* New Dispute Modal/Form */}
        {showNewDispute && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Raise New Dispute</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitDispute} className="space-y-6">
                  <div>
                    <Label htmlFor="dispute_type">Dispute Type *</Label>
                    <Select 
                      value={newDispute.dispute_type} 
                      onValueChange={(value) => setNewDispute({...newDispute, dispute_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dispute type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wrong_lead">Wrong/Irrelevant Lead</SelectItem>
                        <SelectItem value="fake_requirement">Fake Requirement</SelectItem>
                        <SelectItem value="payment_issue">Payment Issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newDispute.description}
                      onChange={(e) => setNewDispute({...newDispute, description: e.target.value})}
                      placeholder="Describe your issue in detail..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label>Supporting Documents</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload screenshots or documents to support your dispute
                      </p>
                      <Button type="button" variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewDispute(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Dispute"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeManagement;
